/**
 * Local Drive API 封装类
 * 用于与外部 Local Drive 文件存储服务交互
 */
const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('fs');

class LocalDriveAPI {
    /**
     * @param {string} serverUrl - Local Drive 服务地址（如 http://your-server:port）
     * @param {string} authToken - Bearer 认证令牌
     * @param {string} agentId - 智能体 ID（默认: default）
     */
    constructor(serverUrl, authToken, agentId = 'default') {
        this.serverUrl = serverUrl.replace(/\/+$/, '');
        this.authToken = authToken;
        this.agentId = agentId || 'default';
    }

    /**
     * 上传文件到 Local Drive 服务
     * 支持磁盘存储（file.path）和内存存储（file.buffer）两种模式
     * 磁盘模式下使用流式传输，避免大文件撑爆内存
     * @param {Object} file - multer 文件对象
     * @returns {Promise<Object>} 上传响应数据，包含 download_url 等信息
     */
    async uploadFile(file) {
        const formData = new FormData();

        const fileName = file.originalname || `file_${Date.now()}`;

        // 磁盘存储：使用流式读取，避免大文件撑爆内存
        // 内存存储：使用 Buffer
        let fileData;
        let knownSize;
        if (file.path) {
            fileData = fs.createReadStream(file.path);
            knownSize = file.size;
        } else if (file.buffer) {
            fileData = file.buffer;
            knownSize = file.size;
        } else if (file._buf) {
            fileData = file._buf;
            knownSize = file._buf.length;
        }

        // 传入文件大小信息，让 form-data 正确设置 Content-Length
        const options = { filename: fileName };
        if (knownSize) {
            options.knownLength = knownSize;
        }
        formData.append('file', fileData, options);
        formData.append('agent_id', this.agentId);

        // file_path 可选，默认使用文件名
        formData.append('file_path', fileName);

        const uploadUrl = `${this.serverUrl}/api/local-drive/upload`;
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                ...formData.getHeaders()
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Local Drive API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const responseData = await response.json();
        return responseData;
    }

    /**
     * 拼接完整的直接下载地址
     * @param {string} downloadUrl - Local Drive 返回的相对下载路径
     * @returns {string} 完整的直接下载 URL
     */
    buildDirectDownloadUrl(downloadUrl) {
        if (!downloadUrl) return '';
        // 如果已经是完整 URL 则直接返回
        if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) {
            return downloadUrl;
        }
        // 拼接 serverUrl + 相对路径
        return `${this.serverUrl}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
    }

    /**
     * 获取文件内容（用于文件代理访问）
     * @param {string} directDownloadUrl - 完整的直接下载地址
     * @returns {Promise<Response>} fetch 响应对象
     */
    async getFileContent(directDownloadUrl) {
        const response = await fetch(directDownloadUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.authToken}`
            }
        });

        return response;
    }
}

module.exports = LocalDriveAPI;
