const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

async function testUrlFormat() {
  console.log('=== Testing URL Format ===\n');

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

    // 2. 上传测试文件
    console.log('2. Uploading test file...');
    const testFilePath = 'data/test_upload.jpg';

    // 创建测试图片
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

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath), { filename: 'test_url_format.jpg' });
    formData.append('platform', 'discord');

    const uploadOptions = {
      hostname: 'localhost',
      port: 3077,
      path: '/api/files/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    };

    const uploadResponse = await new Promise((resolve, reject) => {
      const req = http.request(uploadOptions, (res) => {
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
      formData.pipe(req);
    });

    console.log(`Upload status: ${uploadResponse.status}`);

    if (uploadResponse.status !== 200) {
      console.log('Upload failed:', uploadResponse.data);
      return;
    }

    console.log('✓ Upload successful\n');

    const result = uploadResponse.data;

    // 3. 检查 accessUrl 格式
    console.log('3. Checking accessUrl format...');
    console.log('Response:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\naccessUrl:', result.accessUrl);

    // 验证格式
    if (result.accessUrl.startsWith('/file/')) {
      console.log('✓ Correct format (relative path)');
      console.log('  Starts with /file/');
      console.log('  Example: /file/1770138855551_test.jpg');
    } else if (result.accessUrl.startsWith('http://') || result.accessUrl.startsWith('https://')) {
      console.log('✗ Wrong format (absolute URL)');
      console.log('  Should be: /file/1770138855551_test.jpg');
      console.log('  Is: ', result.accessUrl);
    } else {
      console.log('? Unknown format');
    }

    // 清理测试文件
    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error('Test error:', error);
  }

  console.log('\n=== Test Completed ===\n');
}

testUrlFormat();
