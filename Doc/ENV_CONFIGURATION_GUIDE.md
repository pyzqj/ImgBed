# ImgBed 环境变量配置说明

## 配置文件位置
文件路径：`d:\GitHub\ImgBed\.env`

## 当前配置

```env
PORT=3077
JWT_SECRET=287691005
NODE_ENV=development
API_KEY=imgbed-api-key-2024
```

---

## 各配置项详解

### 1. PORT

**配置项**：`PORT`

**当前值**：`3077`

**作用**：
- 设置服务器监听的端口号
- 决定通过哪个端口访问 ImgBed 服务

**使用场景**：
```bash
# 如果配置为 3077
http://localhost:3077           # 访问前端界面
http://localhost:3077/api/health  # API健康检查
http://localhost:3077/api/auth/login  # 用户登录
http://localhost:3077/api/files/upload  # 文件上传
http://localhost:3077/file/xxx.jpg   # 文件访问
```

**常用端口**：
- `3000` - 常用开发端口
- `3001`, `3002`, ... - 避免冲突的端口
- `8080` - 备用端口
- `3077` - 当前使用的端口

**注意事项**：
- 端口不能被其他程序占用
- 端口号范围：1-65535
- 生产环境建议使用 80 或 443（需要 root 权限）

**修改方法**：
```env
# 修改为其他端口
PORT=8080
```

修改后需要重启服务器：
```bash
npm run server
```

**访问示例**：
```bash
# 端口 3077
curl http://localhost:3077/api/health

# 端口 8080（修改后）
curl http://localhost:8080/api/health
```

---

### 2. JWT_SECRET

**配置项**：`JWT_SECRET`

**当前值**：`287691005`

**作用**：
- 用于加密和验证 JWT (JSON Web Token) 的密钥
- 保护用户登录会话的安全性
- 验证请求头中的 `Authorization: Bearer {token}` 是否有效

**工作原理**：

#### 1. 用户登录流程
```javascript
// 1. 用户提交用户名密码
POST /api/auth/login
{ "username": "admin", "password": "admin" }

// 2. 服务器验证成功后，使用 JWT_SECRET 生成 Token
const token = jwt.sign(
  { id: 1, username: "admin" },
  JWT_SECRET,  // ← 使用这个密钥加密
  { expiresIn: '24h' }
);

// 3. 返回 Token 给客户端
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. 用户访问受保护资源流程
```javascript
// 1. 客户端在请求头中携带 Token
GET /api/files
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 2. 服务器使用 JWT_SECRET 验证 Token
jwt.verify(
  token,
  JWT_SECRET,  // ← 使用相同的密钥验证
  (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // 验证成功，允许访问
    next();
  }
);
```

**重要性**：
- ⚠️ **非常重要** - 这是系统安全的关键
- 如果泄露，任何人可以伪造 Token 冒充任意用户
- 如果修改，所有已登录的用户需要重新登录

**安全建议**：

#### 生产环境（推荐）
```env
# 使用强随机字符串，至少32位
JWT_SECRET=Kj#8mP2@vL5xW9nQ$r7HsT3yM6zF!d4Yq

# 或使用在线生成器生成
# https://randomkeygen.com/ (选择 256-bit)
```

#### 开发环境（当前）
```env
# 可以使用简单的密钥，便于开发
JWT_SECRET=287691005
```

**修改影响**：
- ❌ 修改后，所有已登录的 Token 立即失效
- ❌ 所有用户需要重新登录
- ✅ 提高了系统安全性（如果使用更强的密钥）

**修改方法**：
```env
# 1. 修改配置文件
JWT_SECRET=new-secret-key-here

# 2. 重启服务器
npm run server

# 3. 所有用户重新登录
# Web界面登录 / 调用 /api/auth/login 获取新 Token
```

---

### 3. NODE_ENV

**配置项**：`NODE_ENV`

**当前值**：`development`

**作用**：
- 设置运行环境：开发环境或生产环境
- 影响日志输出、错误处理、优化级别

**可选值**：

#### development（开发环境，当前）
```env
NODE_ENV=development
```

**特点**：
- 详细的错误堆栈信息
- 完整的调试日志
- 更友好的错误提示
- 不进行性能优化
- 热重载（如果使用 nodemon）

**适用场景**：
- 本地开发
- 功能测试
- 调试问题

#### production（生产环境）
```env
NODE_ENV=production
```

**特点**：
- 简化的错误信息（不泄露敏感信息）
- 关闭调试日志
- 性能优化
- 安全性增强
- 缓存启用

**适用场景**：
- 正式部署上线
- 生产服务器
- 公网访问

**代码中使用示例**：
```javascript
// 在代码中根据环境做不同处理
if (process.env.NODE_ENV === 'production') {
  // 生产环境
  console.error('Server error');  // 不泄露详细信息
} else {
  // 开发环境
  console.error(error);  // 显示完整错误堆栈
}
```

**修改方法**：
```env
# 开发环境
NODE_ENV=development

# 生产环境
NODE_ENV=production
```

修改后需要重启服务器：
```bash
npm run server
```

---

### 4. API_KEY

**配置项**：`API_KEY`

**当前值**：`imgbed-api-key-2024`

**作用**：
- 用于 API 上传接口的身份验证密钥
- 验证外部客户端是否有权限使用 API 上传功能
- 区分 Web 上传和 API 上传两种访问方式

**使用场景对比**：

#### 场景1：Web 上传（无需 API_KEY）
```javascript
// 前端界面使用，需要登录
POST /api/files/upload
Authorization: Bearer {jwt_token}  // ← 使用 JWT token
Content-Type: multipart/form-data
```

**验证方式**：`authenticateToken` 中间件
- 从请求头的 `Authorization: Bearer {token}` 获取 JWT Token
- 使用 `JWT_SECRET` 验证 Token 有效性
- 通过后允许访问

**安全等级**：🔴 高安全性
- 需要用户名密码登录
- Token 有过期时间
- 每个用户的 Token 独立

---

#### 场景2：API 上传（需要 API_KEY）
```javascript
// 外部程序调用，不需要登录
POST /api/files/api-upload
X-API-Key: {api_key}  // ← 使用 API Key
Content-Type: multipart/form-data
```

**验证方式**：`authenticateAPI` 中间件
- 从请求头的 `X-API-Key` 获取 API Key
- 检查是否与 `.env` 中的 `API_KEY` 一致
- 通过后允许访问

**安全等级**：🟡 中安全性
- 使用固定的 API Key
- 无过期时间
- 所有客户端共享同一个 Key
- 适合自动化脚本、第三方集成

**工作原理**：

```javascript
// 1. 中间件验证逻辑（server/middleware.js）
function authenticateAPI(req, res, next) {
  const apiKey = req.headers['x-api-key'];  // ← 读取请求头

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  if (apiKey !== process.env.API_KEY) {  // ← 与配置的 API_KEY 比较
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();  // 验证通过，继续处理请求
}
```

**请求头要求**：
```javascript
// ✅ 正确
headers: {
  'X-API-Key': 'imgbed-api-key-2024',  // 注意是小写 x-api-key
  'Content-Type': 'multipart/form-data'
}

// ❌ 错误 - 大写不匹配
headers: {
  'X-API-KEY': 'imgbed-api-key-2024',  // 大写 X-API-KEY 会被忽略
  'Content-Type': 'multipart/form-data'
}
```

**完整调用示例**：

##### JavaScript
```javascript
const FormData = require('form-data');
const fs = require('fs');

// 1. 准备上传数据
const formData = new FormData();
formData.append('file', fs.createReadStream('/path/to/image.jpg'));
formData.append('platform', 'discord');

// 2. 发送请求（包含 X-API-Key）
const response = await fetch('http://193.123.253.134:3077/api/files/api-upload', {
  method: 'POST',
  headers: {
    'X-API-Key': 'imgbed-api-key-2024',  // ← API Key
    ...formData.getHeaders()
  },
  body: formData
});

// 3. 处理响应
const result = await response.json();
// 拼接完整 URL（API上传返回相对路径）
const baseURL = 'http://193.123.253.134:3077';
const fullURL = baseURL + result.accessUrl;
console.log('文件地址:', fullURL);
```

##### cURL
```bash
curl -X POST http://193.123.253.134:3077/api/files/api-upload \
  -H "X-API-Key: imgbed-api-key-2024" \
  -F "file=@/path/to/image.jpg" \
  -F "platform=discord"
```

##### Python
```python
import requests

response = requests.post(
    'http://193.123.253.134:3077/api/files/api-upload',
    headers={
        'X-API-Key': 'imgbed-api-key-2024',  # ← API Key
    },
    files={'file': open('/path/to/image.jpg', 'rb')},
    data={'platform': 'discord'}
)

result = response.json()
# 拼接完整 URL
base_url = 'http://193.123.253.134:3077'
full_url = base_url + result['accessUrl']
print(f'文件地址: {full_url}')
```

**安全建议**：

#### 生产环境（推荐）
```env
# 使用强随机字符串，至少32位
API_KEY=ImgB3dSecUr3Key2024#Pr0ducti0n
# 或
API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

#### 开发环境（当前）
```env
# 可以使用简单的密钥，便于开发和测试
API_KEY=imgbed-api-key-2024
```

**修改影响**：
- ❌ 修改后，所有使用旧 API Key 的调用立即失败
- ❌ 需要更新所有调用方的 API Key
- ✅ 提高了 API 安全性（如果使用更强的密钥）

**修改方法**：
```env
# 1. 修改配置文件
API_KEY=new-api-key-here

# 2. 重启服务器
npm run server

# 3. 更新所有调用方的 API Key
# 在所有调用代码/脚本中更新 X-API-Key 请求头
```

**常见错误**：

#### 401 Unauthorized
```json
{
  "error": "API key required"
}
```
**原因**：请求中缺少 `X-API-Key` 请求头
**解决**：添加 `X-API-Key: imgbed-api-key-2024` 请求头

#### 403 Forbidden
```json
{
  "error": "Invalid API key"
}
```
**原因**：
1. API Key 不正确
2. 请求头使用了大写 `X-API-KEY`
3. `.env` 中未配置 `API_KEY`
4. 修改 `.env` 后未重启服务器
**解决**：
1. 检查 `.env` 中的 API_KEY 配置
2. 确保使用小写的 `x-api-key` 请求头
3. 确保客户端和服务端配置一致
4. 修改配置后重启服务器

---

## 配置优先级

配置项的加载顺序：
```javascript
// 1. 加载 .env 文件
require('dotenv').config();

// 2. 读取环境变量
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;
const API_KEY = process.env.API_KEY;
```

**默认值处理**：
```javascript
// 如果 .env 中没有配置，使用默认值
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_KEY = process.env.API_KEY || null;  // API Key 必须配置
```

---

## 配置文件示例

### 最小配置（仅端口）
```env
PORT=3077
```

### 开发环境配置
```env
PORT=3077
JWT_SECRET=dev-secret-123
NODE_ENV=development
API_KEY=dev-api-key-2024
```

### 生产环境配置
```env
PORT=3000
JWT_SECRET=Kj#8mP2@vL5xW9nQ$r7HsT3yM6zF!d4Yq
NODE_ENV=production
API_KEY=ImgB3dSecUr3Key2024#Pr0ducti0n
```

---

## 安全性检查清单

部署前请确保：

- [ ] JWT_SECRET 已修改为强随机字符串（不是默认值）
- [ ] API_KEY 已设置（如果需要 API 上传功能）
- [ ] API_KEY 使用强随机字符串
- [ ] NODE_ENV 设置为 `production`（生产环境）
- [ ] PORT 未使用常用默认端口（如 3000）
- [ ] .env 文件权限正确（仅管理员可读）
- [ ] 代码库中没有提交 .env 文件（已在 .gitignore 中）

---

## 修改配置的步骤

### 1. 编辑 .env 文件
```bash
# Windows
notepad .env

# Linux/Mac
nano .env
# 或
vim .env
```

### 2. 重启服务器
```bash
# 停止当前服务器
taskkill /F /IM node.exe  # Windows
# 或
pkill node  # Linux/Mac

# 重新启动
npm run server
```

### 3. 验证配置
```bash
# 检查健康检查
curl http://localhost:3077/api/health

# 应该返回
# {"status":"ok","timestamp":"..."}
```

---

## 常见问题

### Q1: 修改 .env 后不生效？
**A**: 修改环境变量后必须重启服务器才能生效。

### Q2: API 上传返回 403 错误？
**A**: 检查以下几点：
1. `.env` 中是否配置了 `API_KEY`
2. 客户端请求头是否使用了 `X-API-Key`（小写）
3. 客户端的 API Key 是否与服务端配置一致
4. 是否重启了服务器

### Q3: 登录后立即失效？
**A**: 修改 `JWT_SECRET` 后，所有已生成的 Token 会失效，需要重新登录。

### Q4: 生产环境推荐配置？
**A**:
```env
PORT=3000
JWT_SECRET=使用至少32位的强随机字符串
NODE_ENV=production
API_KEY=使用至少32位的强随机字符串
```

### Q5: 如何生成强随机字符串？
**A**: 使用在线工具：
- https://randomkeygen.com/ (选择 256-bit)
- https://www.random.org/strings/

或使用命令行：
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | % {[char][int](97+ (random 26))})) -join "")
```

---

## 总结

| 配置项 | 作用 | 重要性 | 修改影响 | 重启要求 |
|--------|------|--------|---------|---------|
| **PORT** | 服务器端口 | 🟢 普通 | 访问端口改变 | ✅ 必须重启 |
| **JWT_SECRET** | JWT加密密钥 | 🔴 非常重要 | 所有登录失效 | ✅ 必须重启 |
| **NODE_ENV** | 运行环境 | 🟢 普通 | 日志级别改变 | ✅ 必须重启 |
| **API_KEY** | API验证密钥 | 🔴 重要（API功能） | API调用失败 | ✅ 必须重启 |

---

**文档版本**: v1.0
**最后更新**: 2026-02-04
**适用于版本**: ImgBed v1.0+
