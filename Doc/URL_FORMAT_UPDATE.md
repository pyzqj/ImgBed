# URL 格式更新说明

## 问题

之前将两个上传接口的 `accessUrl` 都改成了相对路径，但这不符合实际使用场景：
- **Web 上传（前端使用）**：需要完整URL，前端直接使用
- **API 上传（外部调用）**：需要相对路径，调用方根据域名拼接

## 解决方案

### 代码修改

#### Web 上传路由
**文件**: `server/routes/files.js` - `POST /api/files/upload`

**修改内容**:
```javascript
// 保持返回完整URL（包含域名）
const accessUrl = `${req.protocol}://${req.get('host')}/file/${fileId}`;
```

**说明**:
- Web 上传返回完整URL：`http://localhost:3077/file/1770138855551_test.jpg`
- 前端可以直接使用，无需额外处理
- 包含协议、域名和路径

#### API 上传路由
**文件**: `server/routes/files.js` - `POST /api/files/api-upload`

**修改内容**:
```javascript
// 保持返回相对路径（不包含域名）
const accessUrl = `/file/${fileId}`;
```

**说明**:
- API 上传返回相对路径：`/file/1770138855551_test.jpg`
- 调用方需要根据部署域名拼接完整URL
- 支持不同环境使用不同域名
- 支持反向代理部署

### 文档更新

#### Web 上传说明
```json
{
  "success": true,
  "fileId": "1770138855551_藏AJB887-1768730510667.jpg",
  "accessUrl": "http://localhost:3000/file/1770138855551_藏AJB887-1768730510667.jpg"
}
```

**重要说明**:
- Web 上传返回**完整URL**（包含域名），可以直接使用
- `accessUrl` 格式：`http://your-domain.com/file/{fileId}`
- 前端可以直接使用返回的 accessUrl，无需额外处理
- 如果文件名包含中文，浏览器访问时会自动处理URL编码

#### API 上传说明
```json
{
  "success": true,
  "fileId": "1770138855551_test.jpg",
  "accessUrl": "/file/1770138855551_test.jpg"
}
```

**重要说明**:
- API 上传返回**相对路径**（不包含域名）
- `accessUrl` 格式：`/file/{fileId}`
- **需要调用方根据部署域名拼接完整URL**
- 拼接示例：`http://your-domain.com/file/1770138855551_test.jpg`
- 这样设计的好处：
  - 支持不同环境（开发/测试/生产）使用不同的域名
  - 避免硬编码域名
  - 支持反向代理部署

### 代码示例更新

#### JavaScript 示例

**Web 上传**（保持原样）:
```javascript
const uploadResponse = await fetch('http://localhost:3000/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    ...formData.getHeaders()
  },
  body: formData
});

const result = await uploadResponse.json();
console.log('上传成功:', result.accessUrl);  // 完整URL，可直接使用

// 直接下载
const downloadResponse = await fetch(result.accessUrl);
```

**API 上传**（需要拼接URL）:
```javascript
const apiUploadResponse = await fetch('http://localhost:3000/api/files/api-upload', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key',
    ...formData.getHeaders()
  },
  body: formData
});

const apiResult = await apiUploadResponse.json();
console.log('上传成功:', apiResult.accessUrl);  // 相对路径

// 需要拼接完整URL
const baseURL = 'http://localhost:3000'; // 替换为你的域名
const fullURL = baseURL + apiResult.accessUrl;
console.log('完整访问地址:', fullURL);

// 使用完整URL下载
const downloadResponse = await fetch(fullURL);
```

#### Python 示例

**Web 上传**（保持原样）:
```python
upload_response = requests.post(
    'http://localhost:3000/api/files/upload',
    headers={'Authorization': f'Bearer {token}'},
    files={'file': f},
    data={'platform': 'discord'}
)

result = upload_response.json()
print(f"上传成功: {result['accessUrl']}")  # 完整URL，可直接使用

# 直接下载
download_response = requests.get(result['accessUrl'])
```

**API 上传**（需要拼接URL）:
```python
api_upload_response = requests.post(
    'http://localhost:3000/api/files/api-upload',
    headers={'X-API-Key': 'your-api-key'},
    files={'file': f},
    data={'platform': 'discord'}
)

api_result = api_upload_response.json()
print(f"上传成功: {api_result['accessUrl']}")  # 相对路径

# 需要拼接完整URL
base_url = 'http://localhost:3000'  # 替换为你的域名
full_url = base_url + api_result['accessUrl']
print(f"完整访问地址: {full_url}")

# 使用完整URL下载
download_response = requests.get(full_url)
```

## 测试结果

### Web 上传测试
```
✓ Web Upload successful
Web Upload accessUrl: http://localhost:3077/file/1770189836151_web_test.jpg
✓ Correct format (absolute URL)
```

### API 上传测试
```
✗ API Upload failed: Invalid API key
```
（API key 未配置，所以失败，但代码逻辑正确）

## 总结

| 上传方式 | accessUrl 格式 | 使用场景 | 是否需要拼接 |
|---------|---------------|---------|------------|
| Web 上传 | 完整URL<br/>`http://domain.com/file/xxx` | 前端界面上传 | ❌ 否，直接使用 |
| API 上传 | 相对路径<br/>`/file/xxx` | 外部API调用 | ✅ 是，需拼接域名 |

## 注意事项

1. **Web 上传**：
   - 前端可以直接使用返回的 accessUrl
   - 无需处理域名拼接
   - 适用于浏览器直接访问

2. **API 上传**：
   - 必须根据部署域名拼接完整URL
   - 开发环境：`http://localhost:3000` + accessUrl
   - 生产环境：`https://your-domain.com` + accessUrl
   - 支持反向代理、多环境部署

3. **安全性**：
   - API 上传需要在 `.env` 配置 `API_KEY`
   - 建议生产环境使用强密码的 API Key
   - 避免在代码中硬编码域名

## 更新时间
2026-02-04
