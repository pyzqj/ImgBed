# ImgBed - 多平台图床服务

一个支持 Discord、HuggingFace 和 Telegram 的多平台图床服务，使用 Node.js + Vue 3 + SQLite 构建。

## 项目背景

本项目基于 [CloudFlare-ImgBed](https://github.com/MarSeventh/CloudFlare-ImgBed) 进行改造和优化。

### 改进点

原项目使用 Cloudflare Workers KV 存储，在文件数量较多时会出现以下问题：

- **性能问题**：KV 是基于键值对的分布式存储，查询性能随着数据量增加而显著下降
- **查询限制**：KV 不支持复杂查询，文件列表获取需要遍历所有键
- **成本问题**：KV 的读写次数和存储量都有计费限制
- **延迟问题**：KV 的读写延迟较高，不适合高并发场景

本项目的改进：

- **使用 SQLite 数据库**：替换 KV 存储，支持复杂的 SQL 查询
- **索引优化**：为关键字段添加索引，支持 10 万+ 文件快速查询
- **本地部署**：可在任意服务器部署，不受 Cloudflare 平台限制
- **高性能**：数据库本地读写，响应速度快
- **灵活部署**：支持使用 CDN 加速，国内访问速度优异

### 部署建议

推荐部署方案：

1. **服务器选择**：
   - Oracle Cloud 免费层
   - Google Cloud 免费层
   - 其他海外云服务器

2. **CDN 加速**（推荐）：
   - 腾讯云 EdgeOne
   - 阿里云 ESA（边缘安全加速）
   - Cloudflare CDN
   - 其他国内可访问的 CDN 服务

3. **优势**：
   - 文件存储在第三方平台（Discord/HuggingFace/Telegram），无需担心存储空间
   - 数据库部署在海外服务器，合规性更好
   - 使用 CDN 加速后，国内访问速度与本地部署相当
   - 成本低廉，Oracle Cloud 免费层即可满足需求

---

## 功能特性

- **多平台支持**: Discord、HuggingFace、Telegram
- **用户认证**: 默认用户名密码 admin/admin123，支持修改密码
- **配置管理**: 可视化配置各平台的参数
- **文件上传**: 支持拖拽上传，可选择上传平台
- **文件管理**: 查看文件列表、预览、复制链接、删除
- **API 上传**: 支持 API 方式上传文件
- **不存储文件**: 文件全部存储在第三方平台，本地只存储凭证信息
- **中文文件名支持**: 完整支持中文文件名的上传、存储和访问
- **自动数据库初始化**: 首次运行自动创建数据库和默认管理员账户
- **高性能查询**: 使用 SQLite 替代 KV 存储，索引优化，支持 10 万+ 文件快速查询
- **大小写兼容**: 支持 channel 大小写不敏感匹配，兼容旧数据
- **字段映射**: 支持新旧元数据字段格式，向后兼容
- **Ghibli 风格 UI**: 温馨舒适的界面设计
- **CDN 加速友好**: 支持使用腾讯云 EdgeOne、阿里云 ESA 等 CDN 加速，国内访问速度快

## 项目结构

```
ImgBed/
├── server/                 # 后端服务
│   ├── index.js           # Express 服务器入口
│   ├── database.js        # SQLite 数据库模块 (sql.js)，已优化索引
│   ├── init_tables.js     # 数据库表结构初始化
│   ├── middleware.js      # 认证中间件
│   ├── routes/            # API 路由
│   │   ├── auth.js        # 认证路由
│   │   ├── config.js      # 配置路由
│   │   └── files.js       # 文件路由（包含中文文件名处理）
│   └── api/              # 第三方 API 封装
│       ├── discordAPI.js      # Discord API 封装，支持速率限制重试
│       ├── huggingfaceAPI.js  # HuggingFace API 封装，支持 LFS 上传
│       └── telegramAPI.js     # Telegram API 封装，支持代理
├── client/                # 前端 Vue 项目
│   ├── src/
│   │   ├── views/         # 页面组件（Login、Upload、Files、Settings）
│   │   ├── components/    # 公共组件（Navbar）
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── router/        # Vue Router 配置
│   │   └── styles/        # Ghibli 风格样式
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── data/                  # 数据目录（自动创建）
│   └── imgbed.db         # SQLite 数据库
├── package.json
├── .env                  # 环境变量配置（需要创建）
└── .env.example          # 环境变量配置示例
```

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd ImgBed
```

### 2. 安装依赖

```bash
# 一键安装前后端所有依赖
npm run install:all

# 或分别安装
npm install          # 安装后端依赖
cd client && npm install && cd ..  # 安装前端依赖
```

### 3. 配置环境变量

复制示例配置文件并创建 `.env` 文件：

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/macOS
cp .env.example .env
```

编辑 `.env` 文件，修改以下配置：

```env
# 服务器端口（默认 3000）
PORT=3000

# JWT 密钥（用于用户认证）
# ⚠️ 生产环境请务必修改为强密码（至少32个随机字符）
JWT_SECRET=your-secret-key-change-this-in-production

# 运行环境
NODE_ENV=development

# API 密钥（可选，用于 API 上传功能）
# 如果需要使用 API 上传，请取消注释并设置强密码
# API_KEY=ImgB3dSecUr3Key2024#Pr0ducti0n
```

**重要说明**：

- **JWT_SECRET**: 用于签名 JWT token，生产环境必须修改为强密码
- **API_KEY**: 用于 API 上传接口的身份验证，可选配置
  - 建议使用强密码（至少32个字符的随机字符串）
  - 示例：`API_KEY=ImgB3dSecUr3Key2024#Pr0ducti0n`
  - 修改 `.env` 后需要重启服务器才能生效
- **API Key 验证规则**：
  - 请求必须包含 `X-API-Key` 请求头
  - 请求头必须使用小写 `x-api-key`（不是 `X-API-KEY`）
  - API Key 必须与 `.env` 中配置的完全一致

### 4. 启动服务

#### 开发模式（同时启动前后端）：

```bash
npm run dev
```

这将同时启动：
- 后端服务: http://localhost:3000
- 前端服务: http://localhost:5173

#### 分别启动：

```bash
# 终端1 - 启动后端（端口 3000）
npm run server

# 终端2 - 启动前端（端口 5173）
npm run client
```

#### 生产环境：

```bash
# 1. 构建前端
npm run build

# 2. 启动后端（会自动提供构建好的前端静态文件）
npm run server
```

访问 http://localhost:3000 即可使用完整功能。

## 使用说明

### 1. 登录系统

- 默认用户名: `admin`
- 默认密码: `admin123`
- ⚠️ 首次登录后建议立即修改密码

### 2. 配置平台参数

在"设置"页面配置各平台的参数：

#### Discord 配置
- **Bot Token**: Discord Bot 的 Token
- **Channel ID**: 要上传到的频道 ID

**获取方法**：
1. 访问 https://discord.com/developers/applications 创建应用
2. 创建 Bot 并获取 Token
3. 将 Bot 添加到服务器，赋予以下权限：
   - Send Messages
   - Attach Files
   - Read Message History
4. 启用开发者模式，右键频道复制 Channel ID

#### HuggingFace 配置
- **Token**: HuggingFace Access Token
- **Repository**: 仓库格式 `username/repo-name`
- **Path (可选)**: 文件存储路径，如 `images`
- **私有仓库**: 是否为私有仓库

**获取方法**：
1. 访问 https://huggingface.co/settings/tokens 创建 Access Token
2. 创建一个 Dataset 仓库或使用现有仓库
3. 仓库名称格式: `username/repo-name`

**支持的仓库类型**：
- Public Dataset（公开数据集）
- Private Dataset（私有数据集）

#### Telegram 配置
- **Bot Token**: Telegram Bot 的 Token
- **Chat ID**: 要发送到的 Chat ID
- **Proxy URL (可选)**: 代理域名

**获取方法**：
1. 与 @BotFather 对话创建 Bot，获取 Token
2. 将 Bot 添加到群组或私聊
3. 通过 @userinfobot 或其他机器人获取 Chat ID
4. （可选）如果需要使用代理，配置 Proxy URL

**代理配置**：
- 适用于 Telegram API 受限的地区
- 支持标准的 HTTP/HTTPS 代理

### 3. 上传文件

1. 访问"上传"页面
2. 拖拽文件到上传区域或点击选择文件
3. 选择上传平台（Discord/HuggingFace/Telegram）
4. 点击"上传"按钮
5. 上传成功后可复制访问链接

**注意**：
- 支持中文文件名
- 文件 ID 格式为 `时间戳_文件名`，例如：`1770138855551_藏AJB887-1768730510667.jpg`
- 支持的最大文件大小为 100MB
- 可以在 `server/routes/files.js` 中修改 `limits.fileSize` 来调整限制

### 4. 管理文件

在"文件列表"页面可以：
- 查看所有上传的文件（支持分页，显示文件总数）
- 预览图片（点击缩略图）
- 复制文件访问链接
- 删除文件（仅删除本地记录，第三方平台文件仍保留）

## 数据库

### 自动初始化

项目首次运行时，系统会自动：

1. 创建 `data` 目录（如果不存在）
2. 创建数据库文件 `data/imgbed.db`
3. 创建三个表（users、configs、files）
4. 创建默认管理员用户（admin/admin123）

### 数据库结构

详见 [DATABASE.md](./DATABASE.md)，包含以下表：

- **users**: 用户表（存储用户信息和密码）
- **configs**: 配置表（存储各平台配置）
- **files**: 文件表（存储上传文件记录）

### 数据备份

建议定期备份数据库文件：

```bash
# Linux/macOS
cp data/imgbed.db data/imgbed.db.backup.$(date +%Y%m%d)

# Windows PowerShell
Copy-Item data/imgbed.db "data/imgbed.db.backup.$(Get-Date -Format 'yyyyMMdd')"
```

## API 文档

### 认证

#### 登录

**请求：**

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**成功响应（200）：**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

**错误响应（401）：**

```json
{
  "error": "Invalid username or password"
}
```

#### 修改密码

**请求：**

```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "admin",
  "newPassword": "new-password"
}
```

**成功响应（200）：**

```json
{
  "message": "Password changed successfully"
}
```

---

### 文件上传

#### Web 上传（需要登录）

**请求：**

```http
POST /api/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <binary file data>
platform: discord
```

**参数说明：**
- `file` (required): 文件二进制数据，最大 100MB
- `platform` (required): 目标平台，可选值：`discord`、`huggingface`、`telegram`

**成功响应（200）：**

```json
{
  "success": true,
  "fileId": "1770138855551_test.jpg",
  "platform": "discord",
  "fileName": "test.jpg",
  "fileSize": 12345,
  "contentType": "image/jpeg",
  "accessUrl": "http://localhost:3000/file/1770138855551_test.jpg"
}
```

**重要说明：**
- Web 上传返回**完整URL**（包含域名），可以直接使用
- `accessUrl` 格式：`http://your-domain.com/file/{fileId}`
- 前端可以直接使用返回的 accessUrl，无需额外处理
- 如果文件名包含中文，浏览器访问时会自动处理URL编码

---

#### API 上传（需要 API Key）

**请求：**

```http
POST /api/files/api-upload
X-API-Key: {api-key}
Content-Type: multipart/form-data

file: <binary>
platform: discord
```

**参数说明：**
- `file` (required): 文件二进制数据，最大 100MB
- `platform` (required): 目标平台，可选值：`discord`、`huggingface`、`telegram`
- `X-API-Key` (required): API 密钥，从 `.env` 文件配置

**成功响应（200）：**

```json
{
  "success": true,
  "fileId": "1770138855551_test.jpg",
  "platform": "discord",
  "fileName": "test.jpg",
  "fileSize": 12345,
  "contentType": "image/jpeg",
  "accessUrl": "/file/1770138855551_test.jpg"
}
```

**重要说明：**
- API 上传返回**相对路径**（不包含域名）
- `accessUrl` 格式：`/file/{fileId}`
- **需要调用方根据部署域名拼接完整URL**
- 拼接示例：`http://your-domain.com/file/1770138855551_test.jpg`

**错误响应（401）：**

```json
{
  "error": "Invalid API key"
}
```

---

### 文件访问

#### 获取文件

**请求：**

```http
GET /file/{fileId}
```

**示例：**

```http
GET /file/1770138855551_test.jpg
```

**中文文件名示例：**

```http
GET /file/1770138855551_%E8%97%8F%E8%BD%A6%E8%BD%AC%E8%BD%A6.jpg
```

**成功响应（200）：**

```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Disposition: inline; filename="test.jpg"; filename*=UTF-8''test.jpg

<binary file data>
```

**注意：**
- 文件 ID 需要进行 URL 编码，特别是中文文件名
- 使用 RFC 5987 标准编码 HTTP header，现代浏览器正确显示中文
- 文件直接从第三方平台（Discord/HuggingFace/Telegram）获取

---

### 文件列表

#### 获取文件列表

**请求：**

```http
GET /api/files?limit=50&offset=0
Authorization: Bearer {token}
```

**查询参数：**
- `limit` (optional): 每页显示的文件数，默认 50，最大 100
- `offset` (optional): 偏移量，用于分页，默认 0

**成功响应（200）：**

```json
{
  "files": [
    {
      "id": "1770138855551_test.jpg",
      "file_id": "1770138855551_test.jpg",
      "file_name": "test.jpg",
      "file_type": "image/jpeg",
      "content_type": "image/jpeg",
      "file_size": 123456,
      "platform": "discord",
      "channel": "Discord",
      "timestamp": 1770138855551,
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

### 删除文件

#### 删除指定文件

**请求：**

```http
DELETE /api/files/{fileId}
Authorization: Bearer {token}
```

**成功响应（200）：**

```json
{
  "message": "File deleted successfully"
}
```

---

### 配置管理

#### 获取平台配置

**请求：**

```http
GET /api/config/discord
Authorization: Bearer {token}
```

**成功响应（200）：**

```json
{
  "platform": "discord",
  "config": {
    "botToken": "MTQ2Mjc0NDk3MDMwMDQ5MzkzNg.Gi3T-r...",
    "channelId": "1462746034601197638"
  }
}
```

---

#### 保存平台配置

**请求：**

```http
POST /api/config/discord
Authorization: Bearer {token}
Content-Type: application/json

{
  "botToken": "MTQ2Mjc0NDk3MDMwMDQ5MzkzNg.Gi3T-r...",
  "channelId": "1462746034601197638"
}
```

**成功响应（200）：**

```json
{
  "message": "Config saved successfully"
}
```

---

#### 获取所有平台配置

**请求：**

```http
GET /api/config
Authorization: Bearer {token}
```

**成功响应（200）：**

```json
{
  "discord": {
    "botToken": "MTQ2Mjc0NDk3MDMwMDQ5MzkzNg.Gi3T-r...",
    "channelId": "1462746034601197638"
  },
  "huggingface": {
    "token": "hf_...",
    "repo": "username/repo",
    "path": "",
    "isPrivate": false
  },
  "telegram": {
    "botToken": "6129050574:AAGC0VqO...",
    "chatId": "-1001234567890",
    "proxyUrl": ""
  }
}
```

---

## API 调用示例

### cURL 示例

#### 1. 登录获取 Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 响应
# {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","user":{"id":1,"username":"admin"}}
```

#### 2. 上传文件到 Discord

```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/image.jpg" \
  -F "platform=discord"
```

#### 3. 使用 API Key 上传

```bash
curl -X POST http://localhost:3000/api/files/api-upload \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/document.pdf" \
  -F "platform=huggingface"
```

#### 4. 获取文件列表

```bash
curl -X GET "http://localhost:3000/api/files?limit=10&offset=0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 5. 下载文件

```bash
# 普通文件名
curl -X GET http://localhost:3000/file/1770138855551_test.jpg \
  --output test.jpg

# 中文文件名（URL 编码）
curl -X GET "http://localhost:3000/file/1770138855551_%E8%97%8F%E8%BD%A6%E8%BD%AC%E8%BD%A6.jpg" \
  --output test.jpg
```

#### 6. 删除文件

```bash
curl -X DELETE http://localhost:3000/api/files/1770138855551_test.jpg \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Python 示例

```python
import requests

# 1. 登录
login_response = requests.post(
    'http://localhost:3000/api/auth/login',
    json={'username': 'admin', 'password': 'admin123'}
)

token = login_response.json()['token']

# 2. 上传文件
with open('/path/to/image.jpg', 'rb') as f:
    upload_response = requests.post(
        'http://localhost:3000/api/files/upload',
        headers={'Authorization': f'Bearer {token}'},
        files={'file': f},
        data={'platform': 'discord'}
    )

result = upload_response.json()
print(f"上传成功: {result['accessUrl']}")

# 3. 下载文件
download_response = requests.get(result['accessUrl'])
with open('downloaded.jpg', 'wb') as f:
    f.write(download_response.content)
```

---

## 技术栈

### 后端
- Node.js
- Express
- SQLite (sql.js) - 替代 Cloudflare KV，支持高性能查询
- JWT (jsonwebtoken)
- Multer (文件上传)
- Bcrypt (密码加密)
- iconv-lite (中文文件名编码支持)
- form-data (表单数据处理)
- node-fetch (HTTP 请求)

### 前端
- Vue 3
- Vite
- Vue Router
- Pinia
- Axios
- Remixicon (图标库)

### UI 设计
- Ghibli 风格主题
- 响应式设计
- 流畅动画效果
- 温馨配色方案

---

## 常见问题

### 1. 首次启动时数据库创建失败

**解决方案**：
- 确保 `data` 目录有写入权限
- 手动创建 `data` 目录：`mkdir data` (Linux/macOS) 或 `md data` (Windows)
- 重新启动服务器，系统会自动创建数据库

### 2. API 上传失败，提示 "Invalid API key"

**解决方案**：
- 检查 `.env` 文件中是否设置了 `API_KEY`
- 确认请求头使用的是小写 `x-api-key`（不是 `X-API-KEY`）
- 修改 `.env` 后需要重启服务器

### 3. 中文文件名显示乱码

**解决方案**：
- 后端已自动处理 GBK/GB2312/UTF-8 编码
- 前端访问时会自动进行 URL 编码/解码
- 确保浏览器支持 UTF-8 编码

### 4. 文件上传到 Telegram 失败

**解决方案**：
- 如果在受限地区，配置 Proxy URL
- 检查 Bot Token 和 Chat ID 是否正确
- 确保用户或机器人有发送消息的权限

### 5. HuggingFace 上传大文件失败

**解决方案**：
- 大文件使用 LFS 协议分片上传
- 确保 Token 有写权限
- 检查仓库是否存在或权限是否足够

---

## 安全建议

1. **生产环境配置**：
   - 修改默认管理员密码
   - 使用强密码作为 JWT_SECRET
   - 配置 API_KEY 并限制访问
   - 启用 HTTPS

2. **数据备份**：
   - 定期备份 `data/imgbed.db` 数据库文件
   - 备份 `.env` 配置文件

3. **访问控制**：
   - 使用反向代理（Nginx）限制访问
   - 配置防火墙规则
   - 启用 rate limiting

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（token 无效或过期，API Key 无效） |
| 403 | 禁止访问（token 验证失败） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 许可证

MIT License

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

## 致谢

特别感谢以下项目和作者：

- **[CloudFlare-ImgBed](https://github.com/MarSeventh/CloudFlare-ImgBed)** - 本项目基于该项目改造，感谢原作者提供了优秀的多平台图床架构和 API 封装
- **Discord** - 提供稳定的文件存储服务
- **HuggingFace** - 提供免费的数据集仓库和 LFS 支持
- **Telegram** - 提供便捷的文件存储和访问服务

---

## 更新日志

### v1.0.0
- 初始版本发布
- 基于 CloudFlare-ImgBed 改造，将 KV 存储替换为 SQLite 数据库
- 支持 Discord、HuggingFace、Telegram 三个平台
- Ghibli 风格 UI 设计
- 完整的 API 文档
- 自动数据库初始化
- 中文文件名支持
- 高性能数据库查询（支持 10 万+ 文件）
- 支持 CDN 加速部署
