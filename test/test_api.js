const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3077';

// 创建一个测试图片
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test_image.jpg');
  const testData = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12, 0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9]);
  fs.writeFileSync(testImagePath, testData);
  return testImagePath;
}

async function testAPI() {
  console.log('=== Testing ImgBed API ===\n');

  try {
    // 1. 测试健康检查
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    console.log('');

    // 2. 测试登录获取token
    console.log('2. Testing login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('Login failed:', errorData);
      console.log('Note: You may need to create admin user first');
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful, token:', loginData.token ? 'received' : 'missing');
    console.log('');

    const token = loginData.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // 3. 测试列出文件
    console.log('3. Testing list files...');
    const listResponse = await fetch(`${API_BASE}/api/files?limit=5`, {
      headers: authHeaders
    });
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log(`Total files: ${listData.total}`);
      console.log(`Showing ${listData.files.length} files:`);
      listData.files.forEach((file, idx) => {
        console.log(`  ${idx + 1}. ${file.file_name} (${file.channel})`);
      });
    } else {
      const errorData = await listResponse.json();
      console.log('List files failed:', errorData);
    }
    console.log('');

    // 4. 测试获取配置
    console.log('4. Testing get configs...');
    ['discord', 'huggingface', 'telegram'].forEach(async (platform) => {
      const configResponse = await fetch(`${API_BASE}/api/config/${platform}`, {
        headers: authHeaders
      });
      
      if (configResponse.ok) {
        const configData = await configResponse.json();
        console.log(`${platform} config: ${configData.config ? 'configured' : 'not configured'}`);
      } else {
        console.log(`${platform} config: ${configResponse.status}`);
      }
    });
    console.log('');

    // 5. 测试文件上传（如果有配置）
    console.log('5. Testing file upload...');
    const testImagePath = createTestImage();
    
    // 首先检查是否有配置的platform
    let uploadPlatform = null;
    for (const platform of ['discord', 'huggingface', 'telegram']) {
      const configResponse = await fetch(`${API_BASE}/api/config/${platform}`, {
        headers: authHeaders
      });
      if (configResponse.ok) {
        const configData = await configResponse.json();
        if (configData.config) {
          uploadPlatform = platform;
          break;
        }
      }
    }
    
    if (uploadPlatform) {
      console.log(`Uploading test file to ${uploadPlatform}...`);
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testImagePath), 'test_upload.jpg');
      formData.append('platform', uploadPlatform);
      
      // 注意：这里需要使用 node-fetch 的 form-data 支持
      // 由于我们使用的是全局fetch，可能需要调整
      console.log('Note: File upload test requires proper form-data handling');
      console.log('Please test upload through the web interface');
    } else {
      console.log('No platform configured. Cannot test upload.');
      console.log('Please configure at least one platform first.');
    }

    // 清理测试文件
    fs.unlinkSync(testImagePath);

  } catch (error) {
    console.error('API test error:', error);
  }
}

testAPI();
