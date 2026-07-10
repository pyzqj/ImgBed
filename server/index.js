const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config();

const { initDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const configRoutes = require('./routes/config');
const fileRoutes = require('./routes/files');

// 服务器超时配置（通过环境变量可调）
// 默认 0 表示不超时，适合大文件上传场景
const SERVER_TIMEOUT = parseInt(process.env.SERVER_TIMEOUT) || 0;
const KEEP_ALIVE_TIMEOUT = parseInt(process.env.KEEP_ALIVE_TIMEOUT) || 0;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  await initDatabase();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/file', fileRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const distPath = path.join(__dirname, '../client/dist');
  if (fs.existsSync(distPath)) {
    // 静态资源（带 hash 的 JS/CSS）可长缓存，CDN 友好
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '30d',
      immutable: true
    }));
    // 其他静态文件（svg 等）短缓存
    app.use(express.static(distPath, {
      maxAge: '1h'
    }));
    // index.html 禁止缓存，确保 CDN 每次回源获取最新页面
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    app.get('*', (req, res) => {
      res.json({ message: 'Frontend not built. Please run "npm run build" first.' });
    });
  }

  app.use((err, req, res, next) => {
    console.error('Error:', err);
    // Multer 文件大小超限错误
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: '文件大小超过服务器限制' });
    }
    res.status(500).json({ error: 'Internal server error' });
  });

  const server = app.listen(PORT, () => {
    console.log(`ImgBed server running on http://localhost:${PORT}`);
  });

  // 设置服务器超时，0 表示不超时（大文件上传场景）
  server.timeout = SERVER_TIMEOUT;
  server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT;
  server.requestTimeout = SERVER_TIMEOUT;
  server.headersTimeout = SERVER_TIMEOUT;
}

startServer().catch(console.error);
