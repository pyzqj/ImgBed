const initSqlJs = require('sql.js');
const fs = require('fs');

async function checkNewFile() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('data/imgbed.db'));

  const fileId = '1770186769652_4d898948d7be7ae7f0e1ba99f7af6189279815.jpg';

  const result = db.exec('SELECT * FROM files WHERE id = ?', [fileId]);

  if (result.length > 0 && result[0].values.length > 0) {
    const columns = result[0].columns;
    const values = result[0].values[0];

    console.log('File record:');
    columns.forEach((col, idx) => {
      console.log(`  ${col}: ${values[idx]}`);
    });

    console.log('\nMetadata:');
    try {
      const metadata = JSON.parse(values[2]); // metadata is column index 2
      console.log(JSON.stringify(metadata, null, 2));
    } catch (e) {
      console.log('Failed to parse metadata:', e.message);
    }
  } else {
    console.log('File not found');
  }
}

checkNewFile().catch(console.error);
