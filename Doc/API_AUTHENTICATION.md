# API 上传认证问题说明

## 问题现象

当从远程域名（如 `http://193.123.253.134:3077`）调用 API 上传时，返回403错误：

```
错误类型: ERR_BAD_REQUEST
状态码: 403
错误信息: Invalid API key
```

## 问题原因

### 1. .env 配置
当前 `.env` 文件中的 API Key 配置：
```env
API_KEY=imgbed-api-key-2024
```

### 2. 中间件验证逻辑
`server/middleware.js` 中的 `authenticateAPI` 函数：
```javascript
function authenticateAPI(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // 这里只检查 API Key 是否匹配，不检查来源域名
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
}
```

### 3. 可能的失败原因

#### 原因1：客户端未正确发送 API Key
客户端调用时必须包含正确的 `X-API-Key` 请求头：

```javascript
// ✅ 正确
headers: {
  'X-API-Key': 'imgbed-api-key-2024',
  'Content-Type': 'multipart/form-data'
}

// ❌ 错误 - 缺少 API Key
headers: {
  'Content-Type': 'multipart/form-data'
}

// ❌ 错误 - API Key 不正确
headers: {
  'X-API-Key': 'wrong-api-key',
  'Content-Type': 'multipart/form-data'
}
```

#### 原因2：服务器未重启加载新配置
如果修改了 `.env` 文件但未重启服务器，新的 API Key 不会生效。

#### 原因3：请求头格式问题
某些 HTTP 客户端在发送请求时可能将 `x-api-key` 转换为大写：
```javascript
// ❌ 错误 - 大写不匹配
headers: { 'X-API-KEY': 'imgbed-api-key-2024' }

// ✅ 正确 - 小写
headers: { 'X-API-Key': 'imgbed-api-key-2024' }
```

## 解决方案

### 方案1：检查 .env 配置

确保 `.env` 文件中配置了正确的 API Key：

```env
PORT=3077
JWT_SECRET=287691005
NODE_ENV=development
API_KEY=imgbed-api-key-2024  # 确保这行存在
```

### 方案2：重启服务器

修改 `.env` 后必须重启服务器：

```bash
# 停止服务器
taskkill /F /IM node.exe  # Windows
# 或
pkill node  # Linux/Mac

# 重新启动
npm run server
```

### 方案3：客户端正确发送 API Key

#### JavaScript 示例
```javascript
const formData = new FormData();
formData.append('file', fileData);
formData.append('platform', 'discord');

const response = await fetch('http://193.123.253.134:3077/api/files/api-upload', {
  method: 'POST',
  headers: {
    'X-API-Key': 'imgbed-api-key-2024',  // 必须包含正确的 API Key
    ...formData.getHeaders()
  },
  body: formData
});
```

#### cURL 示例
```bash
curl -X POST http://193.123.253.134:3077/api/files/api-upload \
  -H "X-API-Key: imgbed-api-key-2024" \
  -F "file=@/path/to/image.jpg" \
  -F "platform=discord"
```

#### Python 示例
```python
import requests

response = requests.post(
    'http://193.123.253.134:3077/api/files/api-upload',
    headers={
        'X-API-Key': 'imgbed-api-key-2024',  # 必须包含正确的 API Key
    },
    files={'file': open('/path/to/image.jpg', 'rb')},
    data={'platform': 'discord'}
)
```

### 方案4：调试 API Key 验证

添加日志来帮助调试：

#### 修改 middleware.js
```javascript
function authenticateAPI(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    console.log('API upload: No API key provided');
    return res.status(401).json({ error: 'API key required' });
  }

  // 添加调试日志
  const envApiKey = process.env.API_KEY;
  console.log(`API upload: Client Key = ${apiKey}`);
  console.log(`API upload: Env Key = ${envApiKey}`);
  console.log(`API upload: Match = ${apiKey === envApiKey ? 'Yes' : 'No'}`);

  if (apiKey !== process.env.API_KEY) {
    console.log('API upload: Invalid API key - 403');
    return res.status(403).json({ error: 'Invalid API key' });
  }

  console.log('API upload: API key valid - 200');
  next();
}
```

### 方案5：使用更强的 API Key

建议使用更强的 API Key，避免猜测：

```env
# 弱 API Key（不推荐）
API_KEY=imgbed-api-key-2024

# 强 API Key（推荐）
API_KEY=ImgB3dSecUr3Key!2024#Pr0ducti0n
# 或
API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## 测试步骤

### 1. 测试本地 API
```bash
curl -X POST http://localhost:3077/api/files/api-upload \
  -H "X-API-Key: imgbed-api-key-2024" \
  -F "file=@/path/to/image.jpg" \
  -F "platform=discord"
```

**期望结果**：200 OK

### 2. 测试远程 API
```bash
curl -X POST http://193.123.253.134:3077/api/files/api-upload \
  -H "X-API-Key: imgbed-api-key-2024" \
  -F "file=@/path/to/image.jpg" \
  -F "platform=discord"
```

**期望结果**：200 OK

### 3. 验证响应
成功响应应该包含：
```json
{
  "success": true,
  "fileId": "1770194324422_test.jpg",
  "platform": "discord",
  "fileName": "test.jpg",
  "fileSize": 12345,
  "contentType": "image/jpeg",
  "accessUrl": "/file/1770194324422_test.jpg"
}
```

## 常见错误

### 401 Unauthorized
```
错误: API key required
```
**原因**：请求头中缺少 `X-API-Key`

**解决**：添加 `X-API-Key` 请求头

### 403 Forbidden
```
错误: Invalid API key
```
**原因**：
1. API Key 不正确
2. .env 中未配置 API_KEY
3. 服务器未重启加载新配置

**解决**：
1. 确保 `.env` 中配置了正确的 API_KEY
2. 重启服务器
3. 确保客户端发送的 API Key 与配置一致

### 400 Bad Request
```
错误: 平台未配置 / Invalid platform
```
**原因**：
1. 平台未配置
2. platform 参数错误

**解决**：
1. 在设置页面配置平台参数
2. 确保使用正确的 platform 值（discord/huggingface/telegram）

## 安全建议

1. **不要在代码中硬编码 API Key**：
   ```javascript
   // ❌ 错误
   const API_KEY = 'imgbed-api-key-2024';

   // ✅ 正确 - 使用环境变量
   const API_KEY = process.env.API_KEY || 'your-default-key';
   ```

2. **定期更换 API Key**：
   - 定期更换 API Key 提高安全性
   - 特别是在生产环境中

3. **使用强 API Key**：
   - 使用至少32个字符的随机字符串
   - 包含大小写字母、数字和特殊字符

4. **限制 API Key 访问**：
   - 考虑为不同客户端使用不同的 API Key
   - 可以记录 API Key 的使用日志

5. **启用 HTTPS**：
   - 生产环境强制使用 HTTPS
   - 避免在请求中泄露 API Key

## 总结

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 403 Invalid API key | API Key 不匹配 | 检查 .env 配置和客户端发送的 API Key |
| 403 Invalid API key | 服务器未重启 | 修改 .env 后重启服务器 |
| 401 API key required | 缺少 X-API-Key 请求头 | 在请求中添加 X-API-Key 请求头 |
| 403 Invalid API key | 请求头大小写错误 | 使用小写的 x-api-key |

---

**最后更新**: 2026-02-04
