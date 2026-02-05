const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

async function testBothAPIs() {
  console.log('=== Testing Web Upload and API Upload ===\n');

  try {
    // 1. 登录
    console.log('1. Logging in...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3077,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const loginData = JSON.stringify({ username: 'admin', password: 'admin' });

    const loginResponse = await new Promise((resolve, reject) => {
      const req = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });

    console.log(`Login status: ${loginResponse.status}`);

    if (loginResponse.status !== 200 || !loginResponse.data.token) {
      console.log('Login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✓ Login successful\n');

    // 创建测试文件
    const testFilePath = 'data/test_both.jpg';
    const jpegData = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19,
      0x12, 0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C,
      0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C,
      0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
      0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9
    ]);
    fs.writeFileSync(testFilePath, jpegData);

    // 2. 测试 Web 上传
    console.log('2. Testing Web Upload (requires login token)...');
    const webFormData = new FormData();
    webFormData.append('file', fs.createReadStream(testFilePath), { filename: 'web_test.jpg' });
    webFormData.append('platform', 'discord');

    const webUploadOptions = {
      hostname: 'localhost',
      port: 3077,
      path: '/api/files/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...webFormData.getHeaders()
      }
    };

    const webUploadResponse = await new Promise((resolve, reject) => {
      const req = http.request(webUploadOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      req.on('error', reject);
      webFormData.pipe(req);
    });

    console.log(`Web Upload status: ${webUploadResponse.status}`);

    if (webUploadResponse.status !== 200) {
      console.log('Web Upload failed:', webUploadResponse.data);
      fs.unlinkSync(testFilePath);
      return;
    }

    console.log('✓ Web Upload successful');
    console.log('Web Response:');
    console.log(JSON.stringify(webUploadResponse.data, null, 2));
    console.log('');

    const webAccessUrl = webUploadResponse.data.accessUrl;
    console.log('Web Upload accessUrl:', webAccessUrl);

    // 验证 Web Upload 的 URL 格式
    if (webAccessUrl.startsWith('http://') || webAccessUrl.startsWith('https://')) {
      console.log('✓ Correct format (absolute URL)');
    } else {
      console.log('✗ Wrong format (should be absolute URL)');
    }

    console.log('');

    // 3. 测试 API 上传
    console.log('3. Testing API Upload (requires API key)...');
    const apiFormData = new FormData();
    apiFormData.append('file', fs.createReadStream(testFilePath), { filename: 'api_test.jpg' });
    apiFormData.append('platform', 'discord');

    const apiUploadOptions = {
      hostname: 'localhost',
      port: 3077,
      path: '/api/files/api-upload',
      method: 'POST',
      headers: {
        'X-API-Key': 'test-api-key', // 注意：这需要在 .env 中配置
        ...apiFormData.getHeaders()
      }
    };

    const apiUploadResponse = await new Promise((resolve, reject) => {
      const req = http.request(apiUploadOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      req.on('error', reject);
      apiFormData.pipe(req);
    });

    console.log(`API Upload status: ${apiUploadResponse.status}`);

    if (apiUploadResponse.status !== 200) {
      console.log('API Upload failed:', apiUploadResponse.data);
      // 清理测试文件
      fs.unlinkSync(testFilePath);
      return;
    }

    console.log('✓ API Upload successful');
    console.log('API Response:');
    console.log(JSON.stringify(apiUploadResponse.data, null, 2));
    console.log('');

    const apiAccessUrl = apiUploadResponse.data.accessUrl;
    console.log('API Upload accessUrl:', apiAccessUrl);

    // 验证 API Upload 的 URL 格式
    if (apiAccessUrl.startsWith('/file/')) {
      console.log('✓ Correct format (relative path)');
    } else {
      console.log('✗ Wrong format (should be relative path)');
    }

    // 清理测试文件
    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error('Test error:', error);
  }

  console.log('\n=== Test Completed ===');
  console.log('\nSummary:');
  console.log('- Web Upload: Returns absolute URL (with domain)');
  console.log('- API Upload: Returns relative path (without domain)');
  console.log('');
}

testBothAPIs();
