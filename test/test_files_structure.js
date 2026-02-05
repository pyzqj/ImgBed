const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3077';

async function testFilesStructure() {
  console.log('=== Testing Files API Response Structure ===\n');

  try {
    // 1. 登录获取token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed. Please create admin user first.');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };
    console.log('Login successful!\n');

    // 2. 获取文件列表
    console.log('2. Fetching files list...');
    const listResponse = await fetch(`${API_BASE}/api/files?limit=2`, {
      headers: authHeaders
    });
    
    if (!listResponse.ok) {
      const errorData = await listResponse.json();
      console.log('List files failed:', errorData);
      return;
    }
    
    const listData = await listResponse.json();
    console.log(`Total files: ${listData.total}`);
    console.log(`Returned ${listData.files.length} files\n`);

    // 3. 检查第一个文件的结构
    if (listData.files.length > 0) {
      const firstFile = listData.files[0];
      console.log('3. First file structure:');
      console.log(JSON.stringify(firstFile, null, 2));
      console.log('');

      // 4. 验证字段
      console.log('4. Field validation:');
      console.log(`- Has 'id': ${firstFile.id !== undefined ? '✓' : '✗'}`);
      console.log(`- Has 'file_id': ${firstFile.file_id !== undefined ? '✓' : '✗'}`);
      console.log(`- Has 'file_name': ${firstFile.file_name !== undefined ? '✓' : '✗'}`);
      console.log(`- Has 'file_type': ${firstFile.file_type !== undefined ? '✓' : '✗'}`);
      console.log(`- Has 'content_type': ${firstFile.content_type !== undefined ? '✓' : '✗'}`);
      console.log(`- Has 'channel': ${firstFile.channel !== undefined ? '✓' : '✗'}`);
      console.log(`- Has 'platform': ${firstFile.platform !== undefined ? '✓' : '✗'}`);
      console.log(`- Has 'file_size': ${firstFile.file_size !== undefined ? '✓' : '✗'}`);
      console.log(`- Has 'created_at': ${firstFile.created_at !== undefined ? '✓' : '✗'}`);
      console.log('');

      // 5. 验证字段映射
      console.log('5. Field mapping validation:');
      console.log(`- id === file_id: ${firstFile.id === firstFile.file_id ? '✓' : '✗'}`);
      console.log(`- file_type === content_type: ${firstFile.file_type === firstFile.content_type ? '✓' : '✗'}`);
      console.log(`- channel === platform: ${firstFile.channel === firstFile.platform ? '✓' : '✗'}`);
      console.log('');

      // 6. 测试获取单个文件
      console.log('6. Testing getFile API...');
      const getFileResponse = await fetch(`${API_BASE}/api/files/${encodeURIComponent(firstFile.id)}`, {
        headers: authHeaders
      });

      if (getFileResponse.ok) {
        console.log('Note: This endpoint expects GET, but returns file content for display');
        console.log('File ID used:', firstFile.id);
      } else {
        console.log('Get file failed:', getFileResponse.status);
      }
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testFilesStructure();
