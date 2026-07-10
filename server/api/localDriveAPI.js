/**
 * Local Drive API 封装类
 * 用于与外部 Local Drive 文件存储服务交互
 */
const FormData = require('form-data');
const fetch = require('node-fetch');

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
     * @param {Object} file - multer 文件对象
     * @returns {Promise<Object>} 上传响应数据，包含 download_url 等信息
     */
    async uploadFile(file) {
        const formData = new FormData();

        // 提取文件 Buffer，兼容 multer 文件对象和原生 Buffer
        let fileBuffer = file.buffer;
        if (!fileBuffer && file._buf) {
            fileBuffer = file._buf;
        }

        const fileName = file.originalname || `file_${Date.now()}`;
        formData.append('file', fileBuffer, { filename: fileName });
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
