const SQL = require('sql.js');

/**
 * 创建数据库表结构
 * @param {Object} db - SQL.js Database 实例
 */
function createTables(db) {
  // 创建 users 表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建 configs 表
  db.run(`
    CREATE TABLE IF NOT EXISTS configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      config TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, platform)
    )
  `);

  // 创建 files 表
  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      value TEXT,
      metadata TEXT NOT NULL,
      file_name TEXT,
      file_type TEXT,
      file_size TEXT,
      upload_ip TEXT,
      upload_address TEXT,
      list_type TEXT,
      timestamp INTEGER,
      label TEXT,
      directory TEXT,
      channel TEXT,
      channel_name TEXT,
      tg_file_id TEXT,
      tg_chat_id TEXT,
      tg_bot_token TEXT,
      is_chunked INTEGER DEFAULT 0,
      tags TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `);
}

/**
 * 创建默认管理员用户（如果不存在）
 * @param {Object} db - SQL.js Database 实例
 */
function createDefaultUser(db) {
  // 检查是否已有用户
  const result = db.exec('SELECT COUNT(*) as count FROM users');
  
  if (result.length > 0 && result[0].values[0][0] === 0) {
    // 创建默认用户 admin/admin123
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    db.run(`
      INSERT INTO users (username, password, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, ['admin', hashedPassword]);
    
    console.log('✓ 已创建默认管理员用户: admin / admin123');
  }
}

module.exports = {
  createTables,
  createDefaultUser
};
