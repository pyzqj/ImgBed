const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

// ========== 配置区域 ==========

/**
 * CloudFlare-ImgBed KV 数据目录
 *
 * Docker 部署路径示例：
 * /path/to/cloudflare-imgbed/data/v3/kv/img_url/blobs
 *
 * 手动部署路径示例：
 * /www/wwwroot/cloudflare-imgbed/data/v3/kv/img_url/blobs
 */
const KV_BLOBS_DIR = '/path/to/cloudflare-imgbed/data/v3/kv/img_url/blobs';

/**
 * CloudFlare-ImgBed KV 数据库文件
 *
 * 通常是 miniflare 模拟 KV 使用的 SQLite 文件
 * 在 data/v3/kv/ 目录下查找类似这样的文件：
 * miniflare-KVNamespaceObject/6699e4548d20e062cd70a4a42a819647c54d02f5941ab268cd686295d1c288e5.sqlite
 *
 * Docker 部署路径示例：
 * /path/to/cloudflare-imgbed/data/v3/kv/miniflare-KVNamespaceObject/6699e4548d20e062cd70a4a42a819647c54d02f5941ab268cd686295d1c288e5.sqlite
 *
 * 手动部署路径示例：
 * /www/wwwroot/cloudflare-imgbed/data/v3/kv/miniflare-KVNamespaceObject/6699e4548d20e062cd70a4a42a819647c54d02f5941ab268cd686295d1c288e5.sqlite
 */
const KV_DB_PATH = '/path/to/cloudflare-imgbed/data/v3/kv/miniflare-KVNamespaceObject/6699e4548d20e062cd70a4a42a819647c54d02f5941ab268cd686295d1c288e5.sqlite';

/**
 * ImgBed SQLite 数据库文件路径
 *
 * 这是目标数据库，转换后的数据将写入此文件
 *
 * 相对路径示例（推荐）：
 * ./data/imgbed.db
 *
 * 绝对路径示例：
 * /www/wwwroot/imgbed/data/imgbed.db
 */
const SQLITE_DB_PATH = './data/imgbed.db';

// ========== 配置区域结束 ==========

const BATCH_SIZE = 100;
const LOG_INTERVAL = 10;

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''") + "'";
}

function escapeSqlNumber(num) {
    if (num === null || num === undefined) return 'NULL';
    return String(num);
}

function readBlobFile(blobId) {
    const blobPath = path.join(KV_BLOBS_DIR, blobId);
    if (!fs.existsSync(blobPath)) {
        log(`警告：blob文件不存在: ${blobId}`);
        return null;
    }
    
    try {
        const content = fs.readFileSync(blobPath, 'utf8');
        return content;
    } catch (error) {
        log(`读取blob文件失败 ${blobId}: ${error.message}`);
        return null;
    }
}

async function convertKvToSqlite() {
    log('开始转换KV数据到SQLite...');
    
    if (!fs.existsSync(KV_DB_PATH)) {
        log(`错误：KV数据库文件不存在: ${KV_DB_PATH}`);
        process.exit(1);
    }
    
    if (!fs.existsSync(SQLITE_DB_PATH)) {
        log(`错误：目标数据库文件不存在: ${SQLITE_DB_PATH}`);
        process.exit(1);
    }
    
    log('正在加载KV数据库...');
    const kvDbBuffer = fs.readFileSync(KV_DB_PATH);
    const SQL = await initSqlJs();
    const kvDb = new SQL.Database(kvDbBuffer);
    
    log('正在加载目标数据库...');
    const targetDbBuffer = fs.readFileSync(SQLITE_DB_PATH);
    const targetDb = new SQL.Database(targetDbBuffer);
    
    log('正在重建目标表...');
    targetDb.run('DROP TABLE IF EXISTS files');
    
    targetDb.run(`
        CREATE TABLE files (
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
    
    targetDb.run('CREATE INDEX idx_files_timestamp ON files(timestamp DESC)');
    targetDb.run('CREATE INDEX idx_files_directory ON files(directory)');
    targetDb.run('CREATE INDEX idx_files_channel ON files(channel)');
    targetDb.run('CREATE INDEX idx_files_file_type ON files(file_type)');
    targetDb.run('CREATE INDEX idx_files_upload_ip ON files(upload_ip)');
    targetDb.run('CREATE INDEX idx_files_created_at ON files(created_at DESC)');
    targetDb.run('CREATE INDEX idx_files_tags ON files(tags)');
    
    log('表重建完成');
    
    try {
        log('正在读取KV数据...');
        const entries = kvDb.exec('SELECT key, blob_id, expiration, metadata FROM _mf_entries');
        
        if (entries.length === 0 || entries[0].values.length === 0) {
            log('警告：KV数据库中没有数据');
            kvDb.close();
            targetDb.close();
            return;
        }
        
        const kvData = entries[0].values;
        log(`找到 ${kvData.length} 条KV记录`);
        
        const validRecords = [];
        let processedCount = 0;
        let skippedCount = 0;
        
        for (const [key, blobId, expiration, metadata] of kvData) {
            try {
                let metadataObj = null;
                
                if (metadata) {
                    metadataObj = JSON.parse(metadata);
                } else {
                    const blobContent = readBlobFile(blobId);
                    if (blobContent) {
                        const parsed = JSON.parse(blobContent);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            metadataObj = parsed[0].metadata || null;
                        } else if (parsed.metadata) {
                            metadataObj = parsed.metadata;
                        }
                    }
                }
                
                if (metadataObj) {
                    const record = {
                        id: key,
                        value: '',
                        metadata: JSON.stringify(metadataObj),
                        file_name: metadataObj.FileName || null,
                        file_type: metadataObj.FileType || null,
                        file_size: metadataObj.FileSize || null,
                        upload_ip: metadataObj.UploadIP || null,
                        upload_address: metadataObj.UploadAddress || null,
                        list_type: metadataObj.ListType || 'None',
                        timestamp: metadataObj.TimeStamp || Date.now(),
                        label: metadataObj.Label || 'None',
                        directory: metadataObj.Directory || '',
                        channel: metadataObj.Channel || null,
                        channel_name: metadataObj.ChannelName || null,
                        tg_file_id: metadataObj.TgFileId || null,
                        tg_chat_id: metadataObj.TgChatId || null,
                        tg_bot_token: metadataObj.TgBotToken || null,
                        is_chunked: metadataObj.is_chunked ? 1 : 0,
                        tags: metadataObj.Tags ? JSON.stringify(metadataObj.Tags) : '[]',
                        created_at: new Date(metadataObj.TimeStamp || Date.now()).toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    validRecords.push(record);
                } else {
                    skippedCount++;
                    log(`跳过记录 (无有效metadata): ${key}`);
                }
                
                processedCount++;
                if (processedCount % LOG_INTERVAL === 0) {
                    log(`已处理 ${processedCount}/${kvData.length} 条记录，有效: ${validRecords.length}`);
                }
                
            } catch (error) {
                skippedCount++;
                log(`处理记录失败 ${key}: ${error.message}`);
            }
        }
        
        log(`处理完成: 共 ${kvData.length} 条记录，有效 ${validRecords.length} 条，跳过 ${skippedCount} 条`);
        
        if (validRecords.length === 0) {
            log('警告：没有找到有效的文件记录');
            kvDb.close();
            targetDb.close();
            return;
        }
        
        log('开始批量插入数据...');
        const totalBatches = Math.ceil(validRecords.length / BATCH_SIZE);
        let insertedCount = 0;
        
        for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
            const batch = validRecords.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            
            try {
                for (const record of batch) {
                    const insertSql = `
                        INSERT INTO files (
                            id, value, metadata, file_name, file_type, file_size,
                            upload_ip, upload_address, list_type, timestamp, label,
                            directory, channel, channel_name, tg_file_id, tg_chat_id,
                            tg_bot_token, is_chunked, tags, created_at, updated_at
                        ) VALUES (
                            ${escapeSql(record.id)}, 
                            ${escapeSql(record.value)}, 
                            ${escapeSql(record.metadata)}, 
                            ${escapeSql(record.file_name)}, 
                            ${escapeSql(record.file_type)}, 
                            ${escapeSql(record.file_size)}, 
                            ${escapeSql(record.upload_ip)}, 
                            ${escapeSql(record.upload_address)}, 
                            ${escapeSql(record.list_type)}, 
                            ${escapeSqlNumber(record.timestamp)}, 
                            ${escapeSql(record.label)}, 
                            ${escapeSql(record.directory)}, 
                            ${escapeSql(record.channel)}, 
                            ${escapeSql(record.channel_name)}, 
                            ${escapeSql(record.tg_file_id)}, 
                            ${escapeSql(record.tg_chat_id)}, 
                            ${escapeSql(record.tg_bot_token)}, 
                            ${escapeSqlNumber(record.is_chunked)}, 
                            ${escapeSql(record.tags)}, 
                            ${escapeSql(record.created_at)}, 
                            ${escapeSql(record.updated_at)}
                        )
                    `;
                    targetDb.run(insertSql);
                }
                
                insertedCount += batch.length;
                
                if (batchNum % 10 === 0 || batchNum === totalBatches) {
                    log(`批次 ${batchNum}/${totalBatches} 完成，已插入 ${insertedCount}/${validRecords.length} 条记录`);
                }
            } catch (error) {
                log(`批次 ${batchNum} 插入失败: ${error.message}`);
            }
        }
        
        const countResult = targetDb.exec('SELECT COUNT(*) as count FROM files');
        const finalCount = countResult.length > 0 && countResult[0].values.length > 0 
            ? countResult[0].values[0][0] 
            : 0;
        
        log('转换完成！');
        log(`总计处理: ${kvData.length} 条KV记录`);
        log(`有效记录: ${validRecords.length} 条`);
        log(`成功插入: ${insertedCount} 条`);
        log(`数据库总记录数: ${finalCount} 条`);
        
        log('正在保存数据库...');
        const data = targetDb.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(SQLITE_DB_PATH, buffer);
        log('数据库已保存');
        
    } catch (error) {
        log(`转换过程中发生错误: ${error.message}`);
        console.error(error);
    } finally {
        kvDb.close();
        targetDb.close();
        log('数据库连接已关闭');
    }
}

convertKvToSqlite().catch(error => {
    log(`程序异常退出: ${error.message}`);
    console.error(error);
    process.exit(1);
});
