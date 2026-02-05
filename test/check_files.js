const initSqlJs = require('sql.js');
const fs = require('fs');

async function checkDatabase() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('data/imgbed.db'));

  const result = db.exec("SELECT id, file_name, file_type, file_size, channel FROM files LIMIT 5");
  console.log('Files data:');
  console.log(JSON.stringify(result, null, 2));
}

checkDatabase().catch(console.error);
