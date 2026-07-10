const express = require('express');
const { setConfig, getConfig, getAllConfigs } = require('../database');
const { authenticateToken } = require('../middleware');

const router = express.Router();

// 有效的平台配置列表
const VALID_PLATFORMS = ['discord', 'huggingface', 'telegram', 'localdrive'];

// API Key 最小长度限制
const API_KEY_MIN_LENGTH = 8;

router.get('/', authenticateToken, (req, res) => {
  try {
    const configs = getAllConfigs(req.user.id);
    res.json(configs);
  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({ error: 'Failed to get configs' });
  }
});

/**
 * 获取 API Key
 * 优先返回数据库中存储的 API Key，未设置时返回环境变量中的 API_KEY
 */
router.get('/api-key', authenticateToken, (req, res) => {
  try {
    const dbApiKeyConfig = getConfig(req.user.id, 'api_key');
    const envApiKey = process.env.API_KEY || '';

    if (dbApiKeyConfig && dbApiKeyConfig.apiKey) {
      res.json({
        apiKey: dbApiKeyConfig.apiKey,
        source: 'database'
      });
    } else if (envApiKey) {
      res.json({
        apiKey: envApiKey,
        source: 'env'
      });
    } else {
      res.json({
        apiKey: '',
        source: 'none'
      });
    }
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({ error: 'Failed to get API key' });
  }
});

/**
 * 设置 API Key
 * 将 API Key 存储到数据库，修改后立即生效无需重启服务器
 */
router.post('/api-key', authenticateToken, (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (apiKey.length < API_KEY_MIN_LENGTH) {
      return res.status(400).json({ error: `API key must be at least ${API_KEY_MIN_LENGTH} characters` });
    }

    setConfig(req.user.id, 'api_key', { apiKey });
    res.json({ message: 'API key saved successfully' });
  } catch (error) {
    console.error('Save API key error:', error);
    res.status(500).json({ error: 'Failed to save API key' });
  }
});

router.get('/:platform', authenticateToken, (req, res) => {
  try {
    const { platform } = req.params;

    if (!VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const config = getConfig(req.user.id, platform);
    res.json(config || {});
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
});

router.post('/:platform', authenticateToken, (req, res) => {
  try {
    const { platform } = req.params;
    const config = req.body;

    if (!VALID_PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Invalid config data' });
    }

    if (platform === 'discord') {
      if (!config.botToken || !config.channelId) {
        return res.status(400).json({ error: 'botToken and channelId are required for Discord' });
      }
    } else if (platform === 'huggingface') {
      if (!config.token || !config.repo) {
        return res.status(400).json({ error: 'token and repo are required for HuggingFace' });
      }
    } else if (platform === 'telegram') {
      if (!config.botToken || !config.chatId) {
        return res.status(400).json({ error: 'botToken and chatId are required for Telegram' });
      }
    } else if (platform === 'localdrive') {
      if (!config.serverUrl || !config.authToken) {
        return res.status(400).json({ error: 'serverUrl and authToken are required for Local Drive' });
      }
    }

    setConfig(req.user.id, platform, config);
    res.json({ message: 'Config saved successfully' });
  } catch (error) {
    console.error('Save config error:', error);
    res.status(500).json({ error: 'Failed to save config' });
  }
});

module.exports = router;
