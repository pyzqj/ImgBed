# 数据库文档

## 数据库结构

项目使用 SQLite 数据库（文件位置：`data/imgbed.db`），包含三个主要表。

### 1. users 表（用户表）

存储系统用户信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 用户 ID，自增主键 |
| username | TEXT | UNIQUE NOT NULL | 用户名，唯一且不能为空 |
| password | TEXT | NOT NULL | 密码（bcrypt 加密后的哈希值） |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**说明**：
- 默认创建管理员用户：`admin` / `admin123`
- 密码使用 bcrypt 加密存储

### 2. configs 表（配置表）

存储各个平台的配置信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 配置 ID，自增主键 |
| user_id | INTEGER | NOT NULL, FOREIGN KEY | 关联的用户 ID |
| platform | TEXT | NOT NULL | 平台名称（discord、huggingface、telegram） |
| config | TEXT | NOT NULL | 配置信息（JSON 格式字符串） |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**说明**：
- `user_id` 外键关联到 `users(id)`
- `platform` 和 `user_id` 组合唯一约束（UNIQUE）
- `config` 字段存储的是 JSON 格式的配置对象

### 3. files 表（文件表）

存储上传的文件信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | TEXT | PRIMARY KEY | 文件 ID |
| value | TEXT | - | 文件值（保留字段） |
| metadata | TEXT | NOT NULL | 元数据（JSON 格式） |
| file_name | TEXT | - | 原始文件名 |
| file_type | TEXT | - | 文件类型（MIME type） |
| file_size | TEXT | - | 文件大小（MB） |
| upload_ip | TEXT | - | 上传者 IP 地址 |
| upload_address | TEXT | - | 上传地址 |
| list_type | TEXT | - | 列表类型 |
| timestamp | INTEGER | - | 时间戳 |
| label | TEXT | - | 标签 |
| directory | TEXT | - | 目录 |
| channel | TEXT | - | 频道（平台名称） |
| channel_name | TEXT | - | 频道名称 |
| tg_file_id | TEXT | - | Telegram 文件 ID |
| tg_chat_id | TEXT | - | Telegram 聊天 ID |
| tg_bot_token | TEXT | - | Telegram 机器人 Token |
| is_chunked | INTEGER | DEFAULT 0 | 是否分块上传 |
| tags | TEXT | - | 标签（JSON 数组格式） |
| created_at | TEXT | - | 创建时间 |
| updated_at | TEXT | - | 更新时间 |

**说明**：
- `channel` 字段存储上传平台（discord、huggingface、telegram）
- `metadata` 和 `tags` 字段存储 JSON 格式数据
- `file_size` 存储的是 MB 单位的大小

## 数据库初始化

### 自动初始化

项目首次运行时，如果数据库文件不存在，系统会自动：

1. 创建数据库文件 `data/imgbed.db`
2. 创建所需的三个表（users、configs、files）
3. 创建默认管理员用户（admin/admin123）

### 初始化流程

数据库初始化代码位于 `server/database.js` 的 `initDatabase()` 函数：

```javascript
async function initDatabase() {
  SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    // 加载现有数据库
    dbData = fs.readFileSync(dbPath);
    db = new SQL.Database(dbData);
    
    // 检查是否需要创建表
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    if (tables.length === 0 || !tables[0].values.some(row => row[0] === 'users')) {
      createTables(db);
      createDefaultUser(db);
      saveDatabase();
    }
  } else {
    // 创建新数据库
    db = new SQL.Database();
    createTables(db);
    createDefaultUser(db);
    saveDatabase();
  }
}
```

### 表结构定义

表结构定义位于 `server/init_tables.js`：

```javascript
function createTables(db) {
  // 创建 users 表
  db.run(`CREATE TABLE IF NOT EXISTS users (...)`);
  
  // 创建 configs 表
  db.run(`CREATE TABLE IF NOT EXISTS configs (...)`);
  
  // 创建 files 表
  db.run(`CREATE TABLE IF NOT EXISTS files (...)`);
}
```

## 测试数据库初始化

可以运行测试脚本来验证数据库初始化功能：

```bash
node test_init_db.js
```

测试脚本会：
1. 备份现有数据库
2. 删除现有数据库
3. 运行初始化流程
4. 验证表结构和默认用户
5. 显示测试结果

## 数据库操作

### 读取数据库结构

运行以下命令可以查看数据库的完整结构：

```bash
node read_db_structure.js
```

这会显示：
- 所有表的名称
- 每个表的字段信息（字段名、类型、是否为空）
- 索引信息
- 外键信息
- 完整的 CREATE TABLE 语句

## 注意事项

1. **数据库文件位置**：`data/imgbed.db`
2. **默认管理员账户**：用户名 `admin`，密码 `admin123`
3. **首次登录后**：建议立即修改默认密码
4. **数据目录**：首次运行时会自动创建 `data` 目录
5. **备份建议**：定期备份 `data/imgbed.db` 文件以防数据丢失
6. **并发访问**：由于使用 sql.js，不支持多进程并发写入
