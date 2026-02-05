const DiscordAPI = require('../server/api/discordAPI');
const HuggingFaceAPI = require('../server/api/huggingfaceAPI');
const TelegramAPI = require('../server/api/telegramAPI');
const { getConfig } = require('./server/database');

async function initDatabase() {
  const initSqlJs = require('sql.js');
  const fs = require('fs');
  const SQL = await initSqlJs();
  const dbData = fs.readFileSync('data/imgbed.db');
  const db = new SQL.Database(dbData);

  // Override getConfig to use local db
  const originalGetConfig = require('./server/database').getConfig;
  require('./server/database').getConfig = (userId, platform) => {
    const result = db.exec('SELECT config FROM configs WHERE user_id = ? AND platform = ?', [userId, platform]);
    if (result.length === 0) return null;
    return JSON.parse(result[0].values[0][0]);
  };
}

async function testDiscord() {
  console.log('=== Testing Discord API ===\n');

  try {
    // 获取一个Discord文件的信息
    const initSqlJs = require('sql.js');
    const fs = require('fs');
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync('data/imgbed.db'));

    const discordFiles = db.exec(`
      SELECT id, file_name, metadata
      FROM files
      WHERE channel LIKE 'Discord%'
      LIMIT 1
    `);

    if (discordFiles.length > 0 && discordFiles[0].values.length > 0) {
      const fileId = discordFiles[0].values[0][0];
      const fileName = discordFiles[0].values[0][1];
      const metadataStr = discordFiles[0].values[0][2];

      console.log(`Test file: ${fileName}`);
      console.log(`File ID: ${fileId}\n`);

      const metadata = JSON.parse(metadataStr);
      console.log('Metadata:');
      console.log(`- DiscordChannelId: ${metadata.DiscordChannelId}`);
      console.log(`- DiscordMessageId: ${metadata.DiscordMessageId}`);
      console.log(`- DiscordBotToken: ${metadata.DiscordBotToken ? 'Present' : 'Missing'}\n`);

      if (metadata.DiscordBotToken) {
        console.log('Testing Discord API connection...');

        const discordAPI = new DiscordAPI(metadata.DiscordBotToken);

        // 测试1: 获取消息
        console.log('\n1. Testing getMessage()...');
        try {
          const message = await discordAPI.getMessage(
            metadata.DiscordChannelId,
            metadata.DiscordMessageId
          );

          if (message) {
            console.log('✓ getMessage() successful');
            console.log(`  Message ID: ${message.id}`);
            console.log(`  Content: ${message.content ? message.content.substring(0, 50) : 'No text'}`);
            console.log(`  Attachments: ${message.attachments ? message.attachments.length : 0}`);

            if (message.attachments && message.attachments.length > 0) {
              const attachment = message.attachments[0];
              console.log(`  File URL: ${attachment.url}`);
              console.log(`  File Size: ${attachment.size} bytes`);
            }
          } else {
            console.log('✗ getMessage() failed - returned null');
          }
        } catch (error) {
          console.log(`✗ getMessage() failed: ${error.message}`);
        }

        // 测试2: 获取文件URL
        console.log('\n2. Testing getFileURL()...');
        try {
          const fileURL = await discordAPI.getFileURL(
            metadata.DiscordChannelId,
            metadata.DiscordMessageId
          );

          if (fileURL) {
            console.log('✓ getFileURL() successful');
            console.log(`  File URL: ${fileURL}`);
          } else {
            console.log('✗ getFileURL() failed - returned null');
          }
        } catch (error) {
          console.log(`✗ getFileURL() failed: ${error.message}`);
        }

        // 测试3: 获取文件内容
        console.log('\n3. Testing getFileContent()...');
        try {
          const fileResponse = await discordAPI.getFileContent(
            metadata.DiscordChannelId,
            metadata.DiscordMessageId
          );

          if (fileResponse && fileResponse.ok) {
            console.log('✓ getFileContent() successful');
            console.log(`  Status: ${fileResponse.status}`);
            console.log(`  Content-Type: ${fileResponse.headers.get('content-type')}`);
          } else {
            console.log(`✗ getFileContent() failed - Status: ${fileResponse?.status}`);
          }
        } catch (error) {
          console.log(`✗ getFileContent() failed: ${error.message}`);
          if (error.cause) {
            console.log(`  Cause: ${error.cause.message}`);
          }
        }
      } else {
        console.log('✗ No bot token in metadata, cannot test');
      }
    } else {
      console.log('✗ No Discord files found in database');
    }

  } catch (error) {
    console.error('Discord test error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

async function testHuggingFace() {
  console.log('=== Testing HuggingFace API ===\n');

  try {
    // 获取一个HuggingFace文件的信息
    const initSqlJs = require('sql.js');
    const fs = require('fs');
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync('data/imgbed.db'));

    const hfFiles = db.exec(`
      SELECT id, file_name, metadata
      FROM files
      WHERE channel LIKE 'HuggingFace%'
      LIMIT 1
    `);

    if (hfFiles.length > 0 && hfFiles[0].values.length > 0) {
      const fileId = hfFiles[0].values[0][0];
      const fileName = hfFiles[0].values[0][1];
      const metadataStr = hfFiles[0].values[0][2];

      console.log(`Test file: ${fileName}`);
      console.log(`File ID: ${fileId}\n`);

      const metadata = JSON.parse(metadataStr);
      console.log('Metadata:');
      console.log(`- Repo: ${metadata.Repo}`);
      console.log(`- FilePath: ${metadata.FilePath}`);
      console.log(`- FileUrl: ${metadata.FileUrl}\n`);

      if (metadata.Repo && metadata.FilePath) {
        console.log('Testing HuggingFace API connection...');

        // 尝试从config获取token
        const config = require('./server/database').getConfig(1, 'huggingface');
        const token = config?.token || '';

        const hfAPI = new HuggingFaceAPI(token, metadata.Repo, false);

        // 测试1: 获取文件内容
        console.log('\n1. Testing getFileContent()...');
        try {
          const fileResponse = await hfAPI.getFileContent(metadata.FilePath);

          if (fileResponse && fileResponse.ok) {
            console.log('✓ getFileContent() successful');
            console.log(`  Status: ${fileResponse.status}`);
            console.log(`  Content-Type: ${fileResponse.headers.get('content-type')}`);
            console.log(`  Content-Length: ${fileResponse.headers.get('content-length')}`);
          } else {
            console.log(`✗ getFileContent() failed - Status: ${fileResponse?.status}`);
            if (fileResponse) {
              const text = await fileResponse.text();
              console.log(`  Response: ${text.substring(0, 200)}`);
            }
          }
        } catch (error) {
          console.log(`✗ getFileContent() failed: ${error.message}`);
          if (error.cause) {
            console.log(`  Cause: ${error.cause.message}`);
            if (error.cause.code) {
              console.log(`  Code: ${error.cause.code}`);
            }
          }
        }
      } else {
        console.log('✗ Missing Repo or FilePath in metadata, cannot test');
      }
    } else {
      console.log('✗ No HuggingFace files found in database');
    }

  } catch (error) {
    console.error('HuggingFace test error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

async function testTelegram() {
  console.log('=== Testing Telegram API ===\n');

  try {
    // 获取一个Telegram文件的信息
    const initSqlJs = require('sql.js');
    const fs = require('fs');
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync('data/imgbed.db'));

    const tgFiles = db.exec(`
      SELECT id, file_name, metadata
      FROM files
      WHERE channel LIKE 'Telegram%'
      LIMIT 1
    `);

    if (tgFiles.length > 0 && tgFiles[0].values.length > 0) {
      const fileId = tgFiles[0].values[0][0];
      const fileName = tgFiles[0].values[0][1];
      const metadataStr = tgFiles[0].values[0][2];

      console.log(`Test file: ${fileName}`);
      console.log(`File ID: ${fileId}\n`);

      const metadata = JSON.parse(metadataStr);
      console.log('Metadata:');
      console.log(`- TgFileId: ${metadata.TgFileId}`);
      console.log(`- TgChatId: ${metadata.TgChatId}`);
      console.log(`- TgBotToken: ${metadata.TgBotToken ? 'Present' : 'Missing'}\n`);

      if (metadata.TgFileId && metadata.TgBotToken) {
        console.log('Testing Telegram API connection...');

        const tgAPI = new TelegramAPI(metadata.TgBotToken, '');

        // 测试1: 获取文件内容
        console.log('\n1. Testing getFileContent()...');
        try {
          const fileResponse = await tgAPI.getFileContent(metadata.TgFileId);

          if (fileResponse && fileResponse.ok) {
            console.log('✓ getFileContent() successful');
            console.log(`  Status: ${fileResponse.status}`);
            console.log(`  Content-Type: ${fileResponse.headers.get('content-type')}`);
            console.log(`  Content-Length: ${fileResponse.headers.get('content-length')}`);
          } else {
            console.log(`✗ getFileContent() failed - Status: ${fileResponse?.status}`);
          }
        } catch (error) {
          console.log(`✗ getFileContent() failed: ${error.message}`);
        }
      } else {
        console.log('✗ Missing TgFileId or TgBotToken in metadata, cannot test');
      }
    } else {
      console.log('✗ No Telegram files found in database');
    }

  } catch (error) {
    console.error('Telegram test error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log('Platform API Connectivity Test');
  console.log('='.repeat(50) + '\n');

  await testDiscord();
  await testHuggingFace();
  await testTelegram();

  console.log('All tests completed!\n');
}

runTests().catch(console.error);
