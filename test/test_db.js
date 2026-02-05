const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data/imgbed.db');

async function testDatabase() {
  const SQL = await initSqlJs();
  
  let dbData;
  if (fs.existsSync(dbPath)) {
    dbData = fs.readFileSync(dbPath);
    const db = new SQL.Database(dbData);
    
    console.log('=== Database Schema ===');
    const tables = db.exec("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name");
    tables[0].values.forEach(table => {
      console.log(`\nTable: ${table[0]}`);
      console.log(table[1]);
    });
    
    console.log('\n=== Files Table Columns ===');
    const columns = db.exec("PRAGMA table_info(files)");
    console.log(JSON.stringify(columns[0].values, null, 2));
    
    console.log('\n=== Files Count ===');
    const count = db.exec("SELECT COUNT(*) as count FROM files");
    console.log(`Total files: ${count[0].values[0][0]}`);
    
    console.log('\n=== Sample Files (first 5) ===');
    const files = db.exec("SELECT id, file_name, channel, created_at FROM files LIMIT 5");
    if (files.length > 0) {
      const cols = files[0].columns;
      files[0].values.forEach(row => {
        console.log('---');
        cols.forEach((col, idx) => {
          console.log(`${col}: ${row[idx]}`);
        });
      });
    }
    
    console.log('\n=== Test INSERT ===');
    const testId = `test_${Date.now()}`;
    const testMetadata = JSON.stringify({
      FileName: 'test.jpg',
      FileType: 'image/jpeg',
      FileSize: '0.10',
      UploadIP: '127.0.0.1',
      UploadAddress: 'Local',
      ListType: 'None',
      TimeStamp: Date.now(),
      Label: 'None',
      Directory: '',
      Tags: [],
      Channel: 'Test',
      ChannelName: 'TestChannel'
    });
    
    try {
      db.run(`
        INSERT INTO files (id, value, metadata, file_name, file_type, file_size, upload_ip, upload_address, list_type, timestamp, label, directory, channel, channel_name, tg_file_id, tg_chat_id, tg_bot_token, is_chunked, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        testId,
        '',
        testMetadata,
        'test.jpg',
        'image/jpeg',
        '0.10',
        '127.0.0.1',
        'Local',
        'None',
        Date.now(),
        'None',
        '',
        'Test',
        'TestChannel',
        null,
        null,
        null,
        0,
        '[]',
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      
      console.log('Test INSERT successful!');
      
      const inserted = db.exec(`SELECT * FROM files WHERE id = ?`, [testId]);
      if (inserted.length > 0) {
        console.log('Test record found in database');
      }
      
      // Clean up test record
      db.run(`DELETE FROM files WHERE id = ?`, [testId]);
      console.log('Test record cleaned up');
      
      // Save changes
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
      console.log('Database saved');
      
    } catch (error) {
      console.error('Test INSERT failed:', error.message);
      console.error('Error details:', error);
    }
    
  } else {
    console.log('Database file not found!');
  }
}

testDatabase().catch(console.error);
