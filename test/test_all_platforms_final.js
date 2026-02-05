const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3077';

async function testAllPlatforms() {
  console.log('='.repeat(60));
  console.log('All Platforms File Access Test');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. 登录
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    if (!loginResponse.ok) {
      console.log('✗ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };
    console.log('✓ Login successful\n');

    // 2. 获取文件列表
    console.log('2. Getting files list...');
    const listResponse = await fetch(`${API_BASE}/api/files?limit=20`, {
      headers: authHeaders
    });

    if (!listResponse.ok) {
      console.log('✗ Failed to get files list');
      return;
    }

    const listData = await listResponse.json();
    console.log(`✓ Got ${listData.files.length} files (total: ${listData.total})\n`);

    // 3. 按平台分类测试
    const platforms = {
      Discord: [],
      HuggingFace: [],
      Telegram: []
    };

    listData.files.forEach(file => {
      const channel = file.channel || '';
      if (channel.includes('Discord')) {
        platforms.Discord.push(file);
      } else if (channel.includes('HuggingFace')) {
        platforms.HuggingFace.push(file);
      } else if (channel.includes('Telegram')) {
        platforms.Telegram.push(file);
      }
    });

    // 4. 测试Discord文件
    if (platforms.Discord.length > 0) {
      console.log('3. Testing Discord files...');
      const discordFile = platforms.Discord[0];
      console.log(`   Testing: ${discordFile.file_name}`);

      try {
        const fileResponse = await fetch(`${API_BASE}/file/${encodeURIComponent(discordFile.id)}`);

        if (fileResponse.ok) {
          const contentType = fileResponse.headers.get('content-type');
          console.log(`   ✓ Discord file accessible`);
          console.log(`   Status: ${fileResponse.status}`);
          console.log(`   Content-Type: ${contentType}\n`);
        } else {
          console.log(`   ✗ Discord file failed: ${fileResponse.status}\n`);
        }
      } catch (error) {
        console.log(`   ✗ Discord file error: ${error.message}\n`);
      }
    } else {
      console.log('3. No Discord files to test\n');
    }

    // 5. 测试HuggingFace文件
    if (platforms.HuggingFace.length > 0) {
      console.log('4. Testing HuggingFace files...');
      const hfFile = platforms.HuggingFace[0];
      console.log(`   Testing: ${hfFile.file_name}`);

      try {
        const fileResponse = await fetch(`${API_BASE}/file/${encodeURIComponent(hfFile.id)}`);

        if (fileResponse.ok) {
          const contentType = fileResponse.headers.get('content-type');
          console.log(`   ✓ HuggingFace file accessible`);
          console.log(`   Status: ${fileResponse.status}`);
          console.log(`   Content-Type: ${contentType}\n`);
        } else {
          console.log(`   ✗ HuggingFace file failed: ${fileResponse.status}\n`);
        }
      } catch (error) {
        console.log(`   ✗ HuggingFace file error: ${error.message}\n`);
      }
    } else {
      console.log('4. No HuggingFace files to test\n');
    }

    // 6. 测试Telegram文件
    if (platforms.Telegram.length > 0) {
      console.log('5. Testing Telegram files...');
      const tgFile = platforms.Telegram[0];
      console.log(`   Testing: ${tgFile.file_name}`);

      try {
        const fileResponse = await fetch(`${API_BASE}/file/${encodeURIComponent(tgFile.id)}`);

        if (fileResponse.ok) {
          const contentType = fileResponse.headers.get('content-type');
          console.log(`   ✓ Telegram file accessible`);
          console.log(`   Status: ${fileResponse.status}`);
          console.log(`   Content-Type: ${contentType}\n`);
        } else {
          console.log(`   ✗ Telegram file failed: ${fileResponse.status}\n`);
        }
      } catch (error) {
        console.log(`   ✗ Telegram file error: ${error.message}\n`);
      }
    } else {
      console.log('5. No Telegram files to test\n');
    }

    // 7. 总结
    console.log('='.repeat(60));
    console.log('Summary:');
    console.log('='.repeat(60));
    console.log(`Total files in database: ${listData.total}`);
    console.log(`Discord files: ${platforms.Discord.length}`);
    console.log(`HuggingFace files: ${platforms.HuggingFace.length}`);
    console.log(`Telegram files: ${platforms.Telegram.length}`);
    console.log('');

    let testedPlatforms = 0;
    let accessiblePlatforms = 0;

    if (platforms.Discord.length > 0) {
      testedPlatforms++;
    }
    if (platforms.HuggingFace.length > 0) {
      testedPlatforms++;
    }
    if (platforms.Telegram.length > 0) {
      testedPlatforms++;
    }

    console.log(`Platforms with files: ${testedPlatforms}`);
    console.log('\nNote: Discord connectivity may be affected by network/proxy issues.');
    console.log('If Discord files fail to load, check your network environment.');

  } catch (error) {
    console.error('Test error:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

testAllPlatforms();
