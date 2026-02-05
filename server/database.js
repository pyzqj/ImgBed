const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { createTables, createDefaultUser } = require('./init_tables');

const dbPath = path.join(__dirname, '../data/imgbed.db');
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;
let SQL;

async function initDatabase() {
  SQL = await initSqlJs();
  
  let dbData;
  if (fs.existsSync(dbPath)) {
    dbData = fs.readFileSync(dbPath);
    db = new SQL.Database(dbData);
    
    // 检查是否需要创建表
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    if (tables.length === 0 || !tables[0].values.some(row => row[0] === 'users')) {
      console.log('检测到新数据库，正在创建表结构...');
      createTables(db);
      createDefaultUser(db);
      saveDatabase();
      console.log('✓ 数据库表结构创建完成');
    }
  } else {
    console.log('创建新数据库文件...');
    db = new SQL.Database();
    console.log('正在创建表结构...');
    createTables(db);
    createDefaultUser(db);
    saveDatabase();
    console.log('✓ 数据库初始化完成');
  }
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function getUser(username) {
  const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
  if (result.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const user = {};
  columns.forEach((col, index) => {
    user[col] = values[index];
  });
  return user;
}

function updateUserPassword(userId, newPassword) {
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
  saveDatabase();
}

function setConfig(userId, platform, config) {
  db.run(`
    INSERT INTO configs (user_id, platform, config)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, platform) DO UPDATE SET
      config = excluded.config,
      updated_at = CURRENT_TIMESTAMP
  `, [userId, platform, JSON.stringify(config)]);
  saveDatabase();
}

function getConfig(userId, platform) {
  const result = db.exec('SELECT config FROM configs WHERE user_id = ? AND platform = ?', [userId, platform]);
  if (result.length === 0) return null;
  return JSON.parse(result[0].values[0][0]);
}

function getAllConfigs(userId) {
  const result = db.exec('SELECT platform, config FROM configs WHERE user_id = ?', [userId]);
  const configs = {};
  if (result.length > 0) {
    result[0].values.forEach(row => {
      configs[row[0]] = JSON.parse(row[1]);
    });
  }
  return configs;
}

function saveFile(fileId, platform, metadata, fileName, fileType, fileSize, uploadIp, uploadAddress) {
  const timestamp = Date.now();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  // Use the Channel name from metadata if available, otherwise capitalize platform
  const channelName = metadata.Channel || (platform.charAt(0).toUpperCase() + platform.slice(1));
  
  db.run(`
    INSERT INTO files (id, value, metadata, file_name, file_type, file_size, upload_ip, upload_address, list_type, timestamp, label, directory, channel, channel_name, tg_file_id, tg_chat_id, tg_bot_token, is_chunked, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    fileId,
    '',
    JSON.stringify(metadata),
    fileName,
    fileType,
    fileSize,
    uploadIp,
    uploadAddress,
    'None',
    timestamp,
    'None',
    '',
    channelName,
    '',
    null,
    null,
    null,
    0,
    '[]',
    createdAt,
    updatedAt
  ]);
  saveDatabase();
}

function getFile(fileId) {
  const result = db.exec('SELECT * FROM files WHERE id = ?', [fileId]);
  if (result.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const file = {};
  columns.forEach((col, index) => {
    file[col] = values[index];
  });
  
  // Map field names to match frontend expectations
  file.file_id = file.id;
  file.content_type = file.file_type;
  file.platform = file.channel;
  
  if (file.metadata) {
    try {
      file.metadata = JSON.parse(file.metadata);
    } catch (e) {
      file.metadata = {};
    }
  }
  
  if (file.tags) {
    try {
      file.tags = JSON.parse(file.tags);
    } catch (e) {
      file.tags = [];
    }
  }
  
  return file;
}

function listFiles(limit = 50, offset = 0) {
  const result = db.exec(`
    SELECT id, file_name, file_type, file_size, timestamp, channel, created_at, updated_at
    FROM files
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  const files = result[0].values.map(row => {
    const file = {};
    columns.forEach((col, index) => {
      file[col] = row[index];
    });
    
    // Map field names to match frontend expectations
    file.file_id = file.id;
    file.content_type = file.file_type;
    file.platform = file.channel;
    
    if (file.file_size) {
      const sizeMB = parseFloat(file.file_size);
      if (!isNaN(sizeMB)) {
        file.file_size = Math.round(sizeMB * 1024 * 1024);
      }
    }
    
    return file;
  });
  
  return files;
}

function countFiles() {
  const result = db.exec('SELECT COUNT(*) as total FROM files');
  
  if (result.length === 0) return 0;
  return result[0].values[0][0];
}

function deleteFile(fileId) {
  db.run('DELETE FROM files WHERE id = ?', [fileId]);
  saveDatabase();
}

module.exports = {
  initDatabase,
  getUser,
  updateUserPassword,
  setConfig,
  getConfig,
  getAllConfigs,
  saveFile,
  getFile,
  listFiles,
  countFiles,
  deleteFile,
  db
};
