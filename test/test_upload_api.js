const fs = require('fs');
const FormData = require('form-data');
const http = require('http');

const testFilePath = 'data/test_upload.jpg';

// Create a minimal test JPEG file
function createTestFile() {
  const jpegSignature = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9
  ]);

  fs.writeFileSync(testFilePath, jpegSignature);
  return testFilePath;
}

async function testUpload() {
  console.log('=== Testing File Upload ===\n');

  try {
    // 1. 登录获取token
    console.log('1. Logging in...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3077,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
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
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });

    if (loginResponse.status !== 200 || !loginResponse.data.token) {
      console.log('✗ Login failed');
      console.log(loginResponse);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✓ Login successful\n');

    // 2. 上传文件
    console.log('2. Uploading test file...');
    const testFile = createTestFile();
    const fileBuffer = fs.readFileSync(testFile);

    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: 'test_upload.jpg' });
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

    if (uploadResponse.status !== 200) {
      console.log('✗ Upload failed');
      console.log('Status:', uploadResponse.status);
      console.log('Response:', uploadResponse.data);
      return;
    }

    console.log('✓ Upload successful');
    console.log('Response:', uploadResponse.data);

    const fileId = uploadResponse.data.fileId;
    console.log('\n3. Checking file in database...');

    // 3. 检查数据库中的channel字段
    const initSqlJs = require('sql.js');
    const dbData = fs.readFileSync('data/imgbed.db');
    const SQL = await initSqlJs();
    const db = new SQL.Database(dbData);

    const result = db.exec('SELECT id, channel, metadata FROM files WHERE id = ?', [fileId]);

    if (result.length > 0 && result[0].values.length > 0) {
      const channel = result[0].values[0][1];
      const metadata = JSON.parse(result[0].values[0][2]);

      console.log(`✓ File found in database`);
      console.log(`   channel: ${channel}`);
      console.log(`   metadata.Channel: ${metadata.Channel}`);
      console.log(`   Channel matches: ${channel === metadata.Channel ? 'Yes ✓' : 'No ✗'}`);

      // 4. 测试文件访问
      console.log('\n4. Testing file access...');
      const accessUrl = uploadResponse.data.accessUrl;

      const accessResponse = await new Promise((resolve, reject) => {
        const url = new URL(accessUrl);
        const options = {
          hostname: url.hostname,
          port: url.port || 80,
          path: url.pathname,
          method: 'GET'
        };

        const req = http.request(options, (res) => {
          resolve({ status: res.statusCode, contentType: res.headers['content-type'] });
        });
        req.on('error', reject);
        req.end();
      });

      if (accessResponse.status === 200) {
        console.log('✓ File accessible');
        console.log(`   Status: ${accessResponse.status}`);
        console.log(`   Content-Type: ${accessResponse.contentType}`);
      } else {
        console.log('✗ File access failed');
        console.log(`   Status: ${accessResponse.status}`);
      }
    } else {
      console.log('✗ File not found in database');
    }

    // 清理测试文件
    fs.unlinkSync(testFile);

  } catch (error) {
    console.error('Test error:', error);
  }

  console.log('\n=== Test Completed ===\n');
}

testUpload();
