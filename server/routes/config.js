const express = require('express');
const { setConfig, getConfig, getAllConfigs } = require('../database');
const { authenticateToken } = require('../middleware');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const configs = getAllConfigs(req.user.id);
    res.json(configs);
  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({ error: 'Failed to get configs' });
  }
});

router.get('/:platform', authenticateToken, (req, res) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['discord', 'huggingface', 'telegram'];

    if (!validPlatforms.includes(platform)) {
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
    const validPlatforms = ['discord', 'huggingface', 'telegram'];

    if (!validPlatforms.includes(platform)) {
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
    }

    setConfig(req.user.id, platform, config);
    res.json({ message: 'Config saved successfully' });
  } catch (error) {
    console.error('Save config error:', error);
    res.status(500).json({ error: 'Failed to save config' });
  }
});

module.exports = router;
