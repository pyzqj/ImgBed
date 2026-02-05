const initSqlJs = require('sql.js');
const fs = require('fs');

async function checkHuggingFaceFiles() {
  console.log('=== Checking HuggingFace Files in Database ===\n');

  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('data/imgbed.db'));

  // 查看所有包含HuggingFace的channel
  const channels = db.exec(`
    SELECT DISTINCT channel, COUNT(*) as count
    FROM files
    WHERE channel LIKE '%HuggingFace%'
    GROUP BY channel
  `);

  if (channels.length > 0) {
    console.log('HuggingFace channels found:');
    channels[0].values.forEach(row => {
      console.log(`- ${row[0]}: ${row[1]} files`);
    });
  } else {
    console.log('No HuggingFace channels found');
    return;
  }

  console.log('\n');

  // 获取前5个HuggingFace文件的详细信息
  const files = db.exec(`
    SELECT id, file_name, channel, metadata
    FROM files
    WHERE channel LIKE '%HuggingFace%'
    LIMIT 5
  `);

  if (files.length > 0) {
    console.log('Sample HuggingFace files:\n');

    files[0].values.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row[1]}`);
      console.log(`   ID: ${row[0]}`);
      console.log(`   Channel: ${row[2]}`);

      try {
        const metadata = JSON.parse(row[3]);
        console.log('   Metadata keys:', Object.keys(metadata));
        console.log('   Has Repo:', metadata.Repo ? 'Yes' : 'No');
        console.log('   Has FilePath:', metadata.FilePath ? 'Yes' : 'No');
        console.log('   Has FileUrl:', metadata.FileUrl ? 'Yes' : 'No');
        console.log('   Has Oid:', metadata.Oid ? 'Yes' : 'No');
      } catch (e) {
        console.log('   Failed to parse metadata:', e.message);
      }

      console.log('');
    });
  }

  // 查看一个完整的metadata示例
  if (files.length > 0) {
    console.log('\nComplete metadata example:');
    console.log(JSON.stringify(JSON.parse(files[0].values[0][3]), null, 2));
  }
}

checkHuggingFaceFiles().catch(console.error);
