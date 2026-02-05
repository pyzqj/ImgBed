const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

async function testAPIUpload() {
  console.log('=== Testing API Upload with different API domains ===\n');

  try {
    // 创建测试文件
    const testFilePath = 'data/api_test.jpg';
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

    // 测试不同的API域名
    const apiDomains = [
      'http://localhost:3077',
      'http://193.123.253.134:3077',
      'http://127.0.0.1:3077'
    ];

    const apiKey = 'imgbed-api-key-2024';

    for (const apiDomain of apiDomains) {
      console.log(`\n测试域名: ${apiDomain}`);
      console.log('='.repeat(50));

      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath), { filename: `api_test_${Date.now()}.jpg` });
      formData.append('platform', 'discord');

      const url = new URL(`${apiDomain}/api/files/api-upload`);
      const uploadOptions = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
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

      console.log(`状态码: ${uploadResponse.status}`);

      if (uploadResponse.status === 200) {
        console.log('✓ 上传成功');
        console.log('FileId:', uploadResponse.data.fileId);
        console.log('AccessUrl:', uploadResponse.data.accessUrl);
      } else if (uploadResponse.status === 401 || uploadResponse.status === 403) {
        console.log('✗ 认证失败');
        console.log('错误:', uploadResponse.data);
      } else if (uploadResponse.status === 400) {
        console.log('✗ 请求参数错误');
        console.log('错误:', uploadResponse.data);
      } else {
        console.log('✗ 上传失败');
        console.log('错误:', uploadResponse.data);
      }
    }

    // 清理测试文件
    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error('测试错误:', error);
  }

  console.log('\n' + '='.repeat(50));
  console.log('测试完成');
}

testAPIUpload();
