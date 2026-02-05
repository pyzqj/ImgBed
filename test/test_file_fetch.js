const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data/imgbed.db');

async function testFileFetch() {
  console.log('=== Testing File Fetch ===\n');

  const SQL = await initSqlJs();
  const dbData = fs.readFileSync(dbPath);
  const db = new SQL.Database(dbData);

  // 获取一个Discord文件
  const discordFiles = db.exec("SELECT id, file_name, channel FROM files WHERE channel = 'Discord' LIMIT 1");
  
  if (discordFiles.length > 0 && discordFiles[0].values.length > 0) {
    const fileId = discordFiles[0].values[0][0];
    const fileName = discordFiles[0].values[0][1];
    const channel = discordFiles[0].values[0][2];
    
    console.log('Test file:');
    console.log(`- ID: ${fileId}`);
    console.log(`- Name: ${fileName}`);
    console.log(`- Channel: ${channel}`);
    console.log('');

    // 获取完整的metadata
    const fileData = db.exec("SELECT * FROM files WHERE id = ?", [fileId]);
    if (fileData.length > 0) {
      const columns = fileData[0].columns;
      const values = fileData[0].values[0];
      
      const fileRecord = {};
      columns.forEach((col, idx) => {
        fileRecord[col] = values[idx];
      });

      console.log('File record:');
      console.log(JSON.stringify(fileRecord, null, 2));
      console.log('');

      // 检查metadata
      if (fileRecord.metadata) {
        try {
          const metadata = JSON.parse(fileRecord.metadata);
          console.log('Parsed metadata:');
          console.log(JSON.stringify(metadata, null, 2));
          console.log('');

          // 检查Discord相关字段
          console.log('Discord fields:');
          console.log(`- DiscordMessageId: ${metadata.DiscordMessageId || 'missing'}`);
          console.log(`- DiscordChannelId: ${metadata.DiscordChannelId || 'missing'}`);
          console.log(`- DiscordBotToken: ${metadata.DiscordBotToken ? 'present' : 'missing'}`);
        } catch (e) {
          console.log('Failed to parse metadata:', e.message);
        }
      }
    }
  } else {
    console.log('No Discord files found');
  }
}

testFileFetch().catch(console.error);
