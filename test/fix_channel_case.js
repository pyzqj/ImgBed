const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function fixChannelCase() {
  console.log('=== Fixing Channel Case in Database ===\n');

  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'data/imgbed.db');
  const dbData = fs.readFileSync(dbPath);
  const db = new SQL.Database(dbData);

  // 获取所有文件
  const result = db.exec('SELECT id, channel, metadata FROM files');

  if (result.length === 0) {
    console.log('No files found');
    return;
  }

  const columns = result[0].columns;
  const values = result[0].values;

  console.log(`Found ${values.length} files\n`);

  let fixedCount = 0;
  let checkedCount = 0;

  values.forEach(row => {
    const fileId = row[columns.indexOf('id')];
    const channel = row[columns.indexOf('channel')];
    const metadataStr = row[columns.indexOf('metadata')];

    try {
      const metadata = JSON.parse(metadataStr);

      if (metadata.Channel && metadata.Channel !== channel) {
        console.log(`Fixing: ${fileId}`);
        console.log(`  Old channel: ${channel}`);
        console.log(`  New channel: ${metadata.Channel}\n`);

        // 更新channel字段
        db.run('UPDATE files SET channel = ? WHERE id = ?', [metadata.Channel, fileId]);

        fixedCount++;
      }

      checkedCount++;
    } catch (e) {
      console.log(`Error parsing metadata for ${fileId}: ${e.message}`);
    }
  });

  console.log(`\n=== Summary ===`);
  console.log(`Total files checked: ${checkedCount}`);
  console.log(`Files fixed: ${fixedCount}`);

  if (fixedCount > 0) {
    console.log('\nSaving database...');

    // 保存数据库
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);

    console.log('Database saved successfully!');
  } else {
    console.log('\nNo files needed to be fixed.');
  }

  console.log('\n=== Fix Completed ===\n');
}

fixChannelCase().catch(console.error);
