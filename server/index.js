const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const configRoutes = require('./routes/config');
const fileRoutes = require('./routes/files');

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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    app.get('*', (req, res) => {
      res.json({ message: 'Frontend not built. Please run "npm run build" first.' });
    });
  }

  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`ImgBed server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
