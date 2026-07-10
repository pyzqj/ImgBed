const express = require('express');
const multer = require('multer');
const iconv = require('iconv-lite');
const { saveFile, getFile, listFiles, countFiles, deleteFile, getConfig } = require('../database');
const { authenticateToken, authenticateAPI } = require('../middleware');

const router = express.Router();

// 文件大小限制：通过环境变量 MAX_FILE_SIZE 配置（单位：字节）
// 默认 500MB，设置为 0 表示不限制
const MAX_FILE_SIZE = (() => {
  const envValue = parseInt(process.env.MAX_FILE_SIZE);
  if (isNaN(envValue) || envValue === 0) {
    return Infinity; // 不限制
  }
  return envValue;
})();

// 各平台文件大小限制（单位：字节）
const PLATFORM_SIZE_LIMITS = {
  discord: 25 * 1024 * 1024,      // Discord: 25MB
  telegram: 50 * 1024 * 1024,     // Telegram Bot: 50MB
  huggingface: Infinity,           // HuggingFace: 不限制
  localdrive: Infinity             // Local Drive: 不限制
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    try {
      const originalname = file.originalname;
      
      if (!originalname) {
        return cb(null, true);
      }
      
      const buffer = Buffer.from(originalname, 'binary');
      let decodedName = originalname;
      
      try {
        decodedName = iconv.decode(buffer, 'utf-8');
      } catch (e) {
        try {
          decodedName = iconv.decode(buffer, 'gbk');
        } catch (e2) {
          try {
            decodedName = iconv.decode(buffer, 'gb2312');
          } catch (e3) {
            decodedName = originalname;
          }
        }
      }
      
      file.originalname = decodedName;
      cb(null, true);
    } catch (error) {
      cb(null, true);
    }
  }
});

async function uploadToDiscord(file, config) {
  const DiscordAPI = require('../api/discordAPI');
  const api = new DiscordAPI(config.botToken);
  
  const response = await api.sendFile(file, config.channelId, file.originalname || 'image');
  const fileInfo = api.getFileInfo(response);
  
  if (!fileInfo) {
    throw new Error('Failed to get Discord file info');
  }
  
  return {
    DiscordMessageId: response.id,
    DiscordChannelId: config.channelId,
    DiscordBotToken: config.botToken
  };
}

async function uploadToHuggingFace(file, config) {
  const HuggingFaceAPI = require('../api/huggingfaceAPI');
  const api = new HuggingFaceAPI(config.token, config.repo, config.isPrivate || false);
  
  const fileName = file.originalname || `file_${Date.now()}`;
  const filePath = config.path ? `${config.path}/${fileName}` : fileName;
  
  const result = await api.uploadFile(file, filePath, `Upload via ImgBed`);
  
  return {
    Repo: config.repo,
    FilePath: result.filePath,
    FileUrl: result.fileUrl,
    Oid: result.oid
  };
}

async function uploadToTelegram(file, config) {
  const TelegramAPI = require('../api/telegramAPI');
  const api = new TelegramAPI(config.botToken, config.proxyUrl || '');
  
  const isImage = file.mimetype?.startsWith('image/');
  const functionName = isImage ? 'sendPhoto' : 'sendDocument';
  const functionType = isImage ? 'photo' : 'document';
  
  console.log('Telegram upload:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    hasBuffer: !!file.buffer
  });
  
  const response = await api.sendFile(file, config.chatId, functionName, functionType, '', file.originalname);
  const fileInfo = api.getFileInfo(response);
  
  if (!fileInfo) {
    throw new Error('Failed to get Telegram file info');
  }
  
  return {
    TgFileId: fileInfo.file_id,
    TgChatId: config.chatId,
    TgBotToken: config.botToken
  };
}

/**
 * 上传文件到 Local Drive 服务
 * @param {Object} file - multer 文件对象
 * @param {Object} config - Local Drive 配置（serverUrl, authToken, agentId）
 * @returns {Promise<Object>} 包含 LocalDriveDownloadUrl 等元数据
 */
async function uploadToLocalDrive(file, config) {
  const LocalDriveAPI = require('../api/localDriveAPI');
  const api = new LocalDriveAPI(config.serverUrl, config.authToken, config.agentId || 'default');
  
  const result = await api.uploadFile(file);
  
  if (!result.success) {
    throw new Error(result.message || 'Local Drive upload failed');
  }
  
  // 拼接完整的直接下载地址
  const directDownloadUrl = api.buildDirectDownloadUrl(result.download_url);
  
  return {
    LocalDriveServerUrl: config.serverUrl,
    LocalDriveAuthToken: config.authToken,
    LocalDriveAgentId: result.agent_id || config.agentId || 'default',
    LocalDrivePath: result.path,
    LocalDriveDownloadUrl: directDownloadUrl,
    LocalDriveSize: result.size,
    LocalDriveSizeHuman: result.size_human
  };
}

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { platform } = req.body;
    
    if (!platform) {
      return res.status(400).json({ error: 'Platform is required' });
    }
    
    const validPlatforms = ['discord', 'huggingface', 'telegram', 'localdrive'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // 平台级文件大小检查
    const platformLimit = PLATFORM_SIZE_LIMITS[platform];
    if (platformLimit !== Infinity && req.file.size > platformLimit) {
      const limitMB = (platformLimit / 1024 / 1024).toFixed(0);
      return res.status(413).json({ error: `File too large for ${platform}. Maximum: ${limitMB}MB` });
    }
    
    const config = getConfig(req.user.id, platform);
    if (!config) {
      return res.status(400).json({ error: `${platform} config not found. Please configure ${platform} first.` });
    }
    
    let platformData;
    
    if (platform === 'discord') {
      platformData = await uploadToDiscord(req.file, config);
    } else if (platform === 'huggingface') {
      platformData = await uploadToHuggingFace(req.file, config);
    } else if (platform === 'telegram') {
      platformData = await uploadToTelegram(req.file, config);
    } else if (platform === 'localdrive') {
      platformData = await uploadToLocalDrive(req.file, config);
    }
    
    const timestamp = Date.now();
    const fileId = `${timestamp}_${req.file.originalname}`;
    
    const metadata = {
      FileName: req.file.originalname,
      FileType: req.file.mimetype || 'application/octet-stream',
      FileSize: (req.file.size / 1024 / 1024).toFixed(2),
      UploadIP: req.ip || 'unknown',
      UploadAddress: '',
      ListType: 'None',
      TimeStamp: timestamp,
      Label: 'None',
      Directory: '',
      Tags: [],
      Channel: platform.charAt(0).toUpperCase() + platform.slice(1),
      ChannelName: '',
      ...platformData
    };
    
    console.log('Saving file:', {
      fileId,
      originalname: req.file.originalname,
      platform
    });
    
    saveFile(
      fileId,
      platform,
      metadata,
      req.file.originalname,
      req.file.mimetype || 'application/octet-stream',
      (req.file.size / 1024 / 1024).toFixed(2),
      req.ip || 'unknown',
      ''
    );

    const accessUrl = `${req.protocol}://${req.get('host')}/file/${fileId}`;

    // Local Drive 通道额外返回拼接好的直接下载地址
    const responseData = {
      success: true,
      fileId,
      platform,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      contentType: req.file.mimetype,
      accessUrl
    };

    if (platform === 'localdrive' && platformData.LocalDriveDownloadUrl) {
      responseData.directDownloadUrl = platformData.LocalDriveDownloadUrl;
    }

    res.json(responseData);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

router.post('/api-upload', authenticateAPI, upload.single('file'), async (req, res) => {
  try {
    const { platform } = req.body;
    
    if (!platform) {
      return res.status(400).json({ error: 'Platform is required' });
    }
    
    const validPlatforms = ['discord', 'huggingface', 'telegram', 'localdrive'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // 平台级文件大小检查
    const platformLimit = PLATFORM_SIZE_LIMITS[platform];
    if (platformLimit !== Infinity && req.file.size > platformLimit) {
      const limitMB = (platformLimit / 1024 / 1024).toFixed(0);
      return res.status(413).json({ error: `File too large for ${platform}. Maximum: ${limitMB}MB` });
    }
    
    const config = getConfig(1, platform);
    if (!config) {
      return res.status(400).json({ error: `${platform} config not found. Please configure ${platform} first.` });
    }
    
    let platformData;
    
    if (platform === 'discord') {
      platformData = await uploadToDiscord(req.file, config);
    } else if (platform === 'huggingface') {
      platformData = await uploadToHuggingFace(req.file, config);
    } else if (platform === 'telegram') {
      platformData = await uploadToTelegram(req.file, config);
    } else if (platform === 'localdrive') {
      platformData = await uploadToLocalDrive(req.file, config);
    }
    
    const timestamp = Date.now();
    const fileId = `${timestamp}_${req.file.originalname}`;
    
    const metadata = {
      FileName: req.file.originalname,
      FileType: req.file.mimetype || 'application/octet-stream',
      FileSize: (req.file.size / 1024 / 1024).toFixed(2),
      UploadIP: req.ip || 'unknown',
      UploadAddress: '',
      ListType: 'None',
      TimeStamp: timestamp,
      Label: 'None',
      Directory: '',
      Tags: [],
      Channel: platform.charAt(0).toUpperCase() + platform.slice(1),
      ChannelName: '',
      ...platformData
    };
    
    saveFile(
      fileId,
      platform,
      metadata,
      req.file.originalname,
      req.file.mimetype || 'application/octet-stream',
      (req.file.size / 1024 / 1024).toFixed(2),
      req.ip || 'unknown',
      ''
    );

    const accessUrl = `/file/${fileId}`;

    // Local Drive 通道额外返回拼接好的直接下载地址
    const responseData = {
      success: true,
      fileId,
      platform,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      contentType: req.file.mimetype,
      accessUrl
    };

    if (platform === 'localdrive' && platformData.LocalDriveDownloadUrl) {
      responseData.directDownloadUrl = platformData.LocalDriveDownloadUrl;
    }

    res.json(responseData);
  } catch (error) {
    console.error('API upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

router.get('/', authenticateToken, (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const files = listFiles(parseInt(limit), parseInt(offset));
    const total = countFiles();
    res.json({
      files,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

router.get('/:fileId(*)', async (req, res) => {
  try {
    const { fileId } = req.params;
    const decodedFileId = decodeURIComponent(fileId);
    
    const fileRecord = getFile(decodedFileId);
    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const metadata = fileRecord.metadata || {};
    const channel = (fileRecord.channel || '').toLowerCase();
    
    let fileResponse;
    
    // Handle Discord (including any variations, case-insensitive)
    if (channel.startsWith('discord')) {
      const DiscordAPI = require('../api/discordAPI');
      // Use bot token from metadata if available, otherwise try config
      let botToken = metadata.DiscordBotToken;
      if (!botToken) {
        const config = getConfig(1, 'discord');
        if (!config) {
          return res.status(500).json({ error: 'Discord config not found' });
        }
        botToken = config.botToken;
      }
      
      const api = new DiscordAPI(botToken);
      fileResponse = await api.getFileContent(metadata.DiscordChannelId, metadata.DiscordMessageId);
      
    } else if (channel.startsWith('huggingface')) {
      const HuggingFaceAPI = require('../api/huggingfaceAPI');
      // Support both old and new metadata field names
      const repo = metadata.Repo || metadata.HfRepo;
      const filePath = metadata.FilePath || metadata.HfFilePath;
      const token = metadata.HfToken || '';
      const isPrivate = metadata.HfIsPrivate || false;

      if (!repo || !filePath) {
        return res.status(500).json({ error: 'HuggingFace file metadata incomplete' });
      }

      // Use token from metadata if available, otherwise try config
      let hfToken = token;
      if (!hfToken) {
        const config = getConfig(1, 'huggingface');
        if (!config) {
          return res.status(500).json({ error: 'HuggingFace config not found' });
        }
        hfToken = config.token;
      }

      const api = new HuggingFaceAPI(hfToken, repo, isPrivate);
      fileResponse = await api.getFileContent(filePath);
      
    } else if (channel.startsWith('telegram')) {
      const TelegramAPI = require('../api/telegramAPI');
      // Use bot token from metadata if available, otherwise try config
      let botToken = metadata.TgBotToken;
      if (!botToken) {
        const config = getConfig(1, 'telegram');
        if (!config) {
          return res.status(500).json({ error: 'Telegram config not found' });
        }
        botToken = config.botToken;
      }
      
      const api = new TelegramAPI(botToken, '');
      fileResponse = await api.getFileContent(metadata.TgFileId);
    } else if (channel.startsWith('localdrive')) {
      // Local Drive: 从元数据中获取直接下载地址，代理获取文件内容
      const LocalDriveAPI = require('../api/localDriveAPI');
      let serverUrl = metadata.LocalDriveServerUrl;
      let authToken = metadata.LocalDriveAuthToken;
      
      // 元数据中缺失时回退到配置
      if (!serverUrl || !authToken) {
        const config = getConfig(1, 'localdrive');
        if (!config) {
          return res.status(500).json({ error: 'Local Drive config not found' });
        }
        serverUrl = config.serverUrl;
        authToken = config.authToken;
      }
      
      const downloadUrl = metadata.LocalDriveDownloadUrl;
      if (!downloadUrl) {
        return res.status(500).json({ error: 'Local Drive download URL not found in metadata' });
      }
      
      const api = new LocalDriveAPI(serverUrl, authToken, metadata.LocalDriveAgentId || 'default');
      fileResponse = await api.getFileContent(downloadUrl);
    } else {
      return res.status(400).json({ error: `Unsupported channel type: ${channel}` });
    }
    
    if (!fileResponse || !fileResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch file from platform' });
    }
    
    res.setHeader('Content-Type', fileRecord.file_type || 'application/octet-stream');
    
    const fileName = fileRecord.file_name || 'file';
    const encodedFileName = encodeURIComponent(fileName);
    const asciiFileName = fileName.replace(/[^\x00-\x7F]/g, '?');
    res.setHeader('Content-Disposition', `inline; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`);
    
    const buffer = await fileResponse.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: error.message || 'Failed to get file' });
  }
});

router.delete('/:fileId', authenticateToken, (req, res) => {
  try {
    const { fileId } = req.params;
    const decodedFileId = decodeURIComponent(fileId);
    const fileRecord = getFile(decodedFileId);
    
    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    deleteFile(decodedFileId);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
