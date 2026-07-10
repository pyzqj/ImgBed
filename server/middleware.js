const jwt = require('jsonwebtoken');
const { getUser, getConfig } = require('./database');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

/**
 * API Key 认证中间件
 * 优先从数据库读取 API Key（设置页面可修改），如果数据库未设置则回退到环境变量 API_KEY
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 */
function authenticateAPI(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // 优先从数据库获取 API Key（userId=1 为管理员），未设置时回退到环境变量
  const dbApiKeyConfig = getConfig(1, 'api_key');
  const effectiveApiKey = (dbApiKeyConfig && dbApiKeyConfig.apiKey) ? dbApiKeyConfig.apiKey : process.env.API_KEY;

  if (!effectiveApiKey) {
    return res.status(500).json({ error: 'API key not configured. Please set API_KEY in .env or configure it in Settings.' });
  }

  if (apiKey !== effectiveApiKey) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
}

module.exports = { authenticateToken, authenticateAPI };
