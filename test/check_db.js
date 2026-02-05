const initSqlJs = require('sql.js');
const fs = require('fs');

async function checkDatabase() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('data/imgbed.db'));

  const result = db.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='files'");
  console.log('Files table schema:');
  console.log(JSON.stringify(result, null, 2));

  const columns = db.exec("PRAGMA table_info(files)");
  console.log('\nFiles table columns:');
  console.log(JSON.stringify(columns, null, 2));

  const sample = db.exec("SELECT * FROM files LIMIT 1");
  console.log('\nSample data:');
  console.log(JSON.stringify(sample, null, 2));
}

checkDatabase().catch(console.error);
