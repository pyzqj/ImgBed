<template>
  <div class="api-docs-page">
    <Navbar />

    <div class="container">
      <h1>API 使用文档</h1>

      <div class="docs-sections">
        <!-- 概述 -->
        <div class="section ghibli-card">
          <h2>概述</h2>
          <p class="intro-text">
            ImgBed 提供了一套简单的 API 接口，允许你通过 HTTP 请求上传文件。
            所有 API 请求需要提供 <code class="inline-code">X-API-Key</code> 请求头进行身份验证。
          </p>
          <div class="api-key-box" v-if="currentApiKey">
            <span class="label">当前 API Key：</span>
            <code class="api-key-value">{{ apiKeyVisible ? currentApiKey : '••••••••••••••••' }}</code>
            <button @click="apiKeyVisible = !apiKeyVisible" class="ghibli-button ghibli-button-secondary small-button">
              {{ apiKeyVisible ? '隐藏' : '显示' }}
            </button>
            <button @click="copyApiKey" class="ghibli-button ghibli-button-secondary small-button">复制</button>
          </div>
          <div class="api-key-box" v-else>
            <span class="label">当前未设置 API Key，请前往</span>
            <router-link to="/settings" class="settings-link">设置页面</router-link>
            <span class="label">配置。</span>
          </div>
        </div>

        <!-- 上传文件 -->
        <div class="section ghibli-card">
          <h2>上传文件</h2>
          <div class="endpoint">
            <span class="method method-post">POST</span>
            <code class="endpoint-url">{{ baseUrl }}/api/files/api-upload</code>
          </div>

          <h3>请求头</h3>
          <div class="code-block">
            <pre>X-API-Key: {{ apiKeyPlaceholder }}
Content-Type: multipart/form-data</pre>
          </div>

          <h3>请求参数</h3>
          <table class="param-table">
            <thead>
              <tr>
                <th>参数名</th>
                <th>类型</th>
                <th>必填</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>file</code></td>
                <td>binary</td>
                <td>是</td>
                <td>文件二进制数据，最大 100MB</td>
              </tr>
              <tr>
                <td><code>platform</code></td>
                <td>string</td>
                <td>是</td>
                <td>目标平台，可选值：<code>discord</code>、<code>huggingface</code>、<code>telegram</code>、<code>localdrive</code></td>
              </tr>
              <tr>
                <td><code>X-API-Key</code></td>
                <td>header</td>
                <td>是</td>
                <td>API 密钥（注意使用小写 <code>x-api-key</code>）</td>
              </tr>
            </tbody>
          </table>

          <h3>成功响应 (200)</h3>
          <div class="code-block">
            <pre>{
  "success": true,
  "fileId": "1770138855551_test.jpg",
  "platform": "discord",
  "fileName": "test.jpg",
  "fileSize": 12345,
  "contentType": "image/jpeg",
  "accessUrl": "/file/1770138855551_test.jpg"
}</pre>
          </div>

          <div class="tips-block">
            <p><strong>注意：</strong></p>
            <ul>
              <li>API 上传返回<strong>相对路径</strong>（不包含域名）</li>
              <li><code>accessUrl</code> 格式：<code>/file/{fileId}</code></li>
              <li>需要调用方根据部署域名拼接完整 URL</li>
              <li>拼接示例：<code>{{ baseUrl }}/file/1770138855551_test.jpg</code></li>
              <li><strong>Local Drive 通道额外返回 <code>directDownloadUrl</code> 字段</strong>，即拼接好的原通道直接下载地址，可直接使用</li>
            </ul>
          </div>

          <h3>错误响应</h3>
          <table class="param-table">
            <thead>
              <tr>
                <th>状态码</th>
                <th>说明</th>
                <th>响应示例</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>401</td>
                <td>未提供 API Key</td>
                <td><code>{ "error": "API key required" }</code></td>
              </tr>
              <tr>
                <td>403</td>
                <td>API Key 无效</td>
                <td><code>{ "error": "Invalid API key" }</code></td>
              </tr>
              <tr>
                <td>400</td>
                <td>参数错误</td>
                <td><code>{ "error": "Platform is required" }</code></td>
              </tr>
              <tr>
                <td>500</td>
                <td>服务器错误</td>
                <td><code>{ "error": "Upload failed" }</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 访问文件 -->
        <div class="section ghibli-card">
          <h2>访问文件</h2>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <code class="endpoint-url">{{ baseUrl }}/file/{fileId}</code>
          </div>

          <p>上传成功后，拼接完整 URL 即可直接访问文件：</p>
          <div class="code-block">
            <pre>GET {{ baseUrl }}/file/1770138855551_test.jpg</pre>
          </div>

          <div class="tips-block">
            <p><strong>注意：</strong></p>
            <ul>
              <li>文件 ID 需要进行 URL 编码，特别是中文文件名</li>
              <li>文件直接从第三方平台（Discord/HuggingFace/Telegram/Local Drive）获取</li>
              <li>无需 API Key 即可访问文件</li>
            </ul>
          </div>
        </div>

        <!-- 代码示例 -->
        <div class="section ghibli-card">
          <h2>代码示例</h2>

          <div class="tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- cURL -->
          <div v-if="activeTab === 'curl'" class="code-block">
            <pre>curl -X POST "{{ baseUrl }}/api/files/api-upload" \
  -H "x-api-key: {{ apiKeyPlaceholder }}" \
  -F "file=@/path/to/image.jpg" \
  -F "platform=discord"</pre>
          </div>

          <!-- Python -->
          <div v-if="activeTab === 'python'" class="code-block">
            <pre>import requests

# 上传文件
with open('/path/to/image.jpg', 'rb') as f:
    response = requests.post(
        '{{ baseUrl }}/api/files/api-upload',
        headers={'X-API-Key': '{{ apiKeyPlaceholder }}'},
        files={'file': f},
        data={'platform': 'discord'}
    )

result = response.json()
if result.get('success'):
    access_url = '{{ baseUrl }}' + result['accessUrl']
    print(f'上传成功: {access_url}')
else:
    print(f'上传失败: {result.get("error")}')</pre>
          </div>

          <!-- JavaScript -->
          <div v-if="activeTab === 'javascript'" class="code-block">
            <pre>const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('platform', 'discord');

const response = await fetch('{{ baseUrl }}/api/files/api-upload', {
    method: 'POST',
    headers: {
        'X-API-Key': '{{ apiKeyPlaceholder }}'
    },
    body: formData
});

const result = await response.json();
if (result.success) {
    const accessUrl = '{{ baseUrl }}' + result.accessUrl;
    console.log('上传成功:', accessUrl);
} else {
    console.error('上传失败:', result.error);
}</pre>
          </div>

          <!-- Node.js -->
          <div v-if="activeTab === 'nodejs'" class="code-block">
            <pre>const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const formData = new FormData();
formData.append('file', fs.createReadStream('/path/to/image.jpg'));
formData.append('platform', 'discord');

const response = await fetch('{{ baseUrl }}/api/files/api-upload', {
    method: 'POST',
    headers: {
        'x-api-key': '{{ apiKeyPlaceholder }}',
        ...formData.getHeaders()
    },
    body: formData
});

const result = await response.json();
console.log(result.success ? `上传成功: {{ baseUrl }}${result.accessUrl}` : `失败: ${result.error}`);</pre>
          </div>
        </div>

        <!-- 平台说明 -->
        <div class="section ghibli-card">
          <h2>平台说明</h2>
          <table class="param-table">
            <thead>
              <tr>
                <th>平台</th>
                <th>配置要求</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>discord</code></td>
                <td>Bot Token + Channel ID</td>
                <td>文件存储在 Discord 频道消息附件中</td>
              </tr>
              <tr>
                <td><code>huggingface</code></td>
                <td>Token + Repository</td>
                <td>文件通过 LFS 协议上传到 HuggingFace 数据集仓库</td>
              </tr>
              <tr>
                <td><code>telegram</code></td>
                <td>Bot Token + Chat ID</td>
                <td>文件通过 Bot 发送到指定聊天</td>
              </tr>
              <tr>
                <td><code>localdrive</code></td>
                <td>服务器地址 + 认证令牌</td>
                <td>文件上传到 Local Drive 服务器，额外返回直接下载地址</td>
              </tr>
            </tbody>
          </table>
          <div class="tips-block">
            <p>使用 API 上传前，请确保已在<a href="/settings" class="settings-link">设置页面</a>配置对应平台的参数。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import Navbar from '@/components/Navbar.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const currentApiKey = ref('');
const apiKeyVisible = ref(false);
const activeTab = ref('curl');

const tabs = [
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'nodejs', label: 'Node.js' }
];

// 根据当前页面 location 动态获取 baseUrl
const baseUrl = computed(() => {
  return window.location.origin;
});

// API Key 占位符，用于代码示例
const apiKeyPlaceholder = computed(() => {
  return currentApiKey.value || 'your-api-key';
});

/**
 * 加载当前 API Key
 */
async function loadApiKey() {
  try {
    const response = await axios.get('/api/config/api-key', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    currentApiKey.value = response.data.apiKey || '';
  } catch (error) {
    console.error('Failed to load API key:', error);
  }
}

/**
 * 复制 API Key 到剪贴板
 */
function copyApiKey() {
  const url = currentApiKey.value;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert('已复制到剪贴板');
    }).catch(() => {
      fallbackCopy(url);
    });
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    alert('已复制到剪贴板');
  } catch (err) {
    alert('复制失败，请手动复制');
  }
  document.body.removeChild(textArea);
}

onMounted(() => {
  loadApiKey();
});
</script>

<style scoped>
.api-docs-page {
  min-height: 100vh;
  background: var(--ghibli-secondary);
  position: relative;
  overflow: hidden;
}

.api-docs-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 40%, rgba(124, 185, 168, 0.1) 0%, transparent 30%),
              radial-gradient(circle at 70% 60%, rgba(232, 168, 124, 0.1) 0%, transparent 30%);
  z-index: 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
  position: relative;
  z-index: 1;
}

h1 {
  margin-bottom: 32px;
  color: var(--ghibli-text);
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.docs-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.section {
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.section:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

h2 {
  margin-bottom: 24px;
  color: var(--ghibli-text);
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  padding-bottom: 8px;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--ghibli-gradient-primary);
  border-radius: var(--ghibli-radius-full);
}

h3 {
  margin: 20px 0 12px;
  color: var(--ghibli-text);
  font-size: 16px;
  font-weight: 600;
}

.intro-text {
  color: var(--ghibli-text);
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 16px;
}

.inline-code {
  background: rgba(124, 185, 168, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--ghibli-sage);
}

/* API Key 展示框 */
.api-key-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(133, 205, 202, 0.1);
  border-radius: var(--ghibli-radius-md);
  padding: 12px 16px;
  flex-wrap: wrap;
}

.api-key-box .label {
  font-size: 14px;
  color: var(--ghibli-text);
  font-weight: 500;
}

.api-key-value {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  color: var(--ghibli-sage);
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 12px;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
  word-break: break-all;
}

.small-button {
  padding: 6px 14px;
  font-size: 13px;
  white-space: nowrap;
}

.settings-link {
  color: var(--ghibli-sage);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.settings-link:hover {
  color: var(--ghibli-coral);
  text-decoration: underline;
}

/* 端点展示 */
.endpoint {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.method {
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 13px;
  color: white;
}

.method-post {
  background: #e8a87c;
}

.method-get {
  background: #7cb9a8;
}

.endpoint-url {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  color: var(--ghibli-text);
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 12px;
  border-radius: 4px;
  word-break: break-all;
}

/* 代码块 */
.code-block {
  background: #2d2d2d;
  border-radius: var(--ghibli-radius-md);
  padding: 20px;
  margin: 12px 0;
  overflow-x: auto;
}

.code-block pre {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #e0e0e0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 参数表格 */
.param-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 14px;
}

.param-table th {
  background: rgba(124, 185, 168, 0.15);
  color: var(--ghibli-text);
  font-weight: 600;
  text-align: left;
  padding: 10px 16px;
  border-radius: 8px 8px 0 0;
}

.param-table td {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: var(--ghibli-text);
}

.param-table td code {
  background: rgba(124, 185, 168, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--ghibli-sage);
}

.param-table tr:last-child td {
  border-bottom: none;
}

/* 提示块 */
.tips-block {
  background: rgba(133, 205, 202, 0.1);
  border-radius: var(--ghibli-radius-md);
  padding: 16px 20px;
  margin: 16px 0;
}

.tips-block p {
  font-size: 14px;
  color: var(--ghibli-text);
  margin: 0 0 8px;
}

.tips-block p:last-child {
  margin-bottom: 0;
}

.tips-block ul {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}

.tips-block ul li {
  font-size: 14px;
  color: var(--ghibli-text);
  padding: 4px 0;
  padding-left: 20px;
  position: relative;
  line-height: 1.6;
}

.tips-block ul li::before {
  content: '•';
  position: absolute;
  left: 4px;
  color: var(--ghibli-sage);
  font-weight: bold;
}

.tips-block ul li code {
  background: rgba(124, 185, 168, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--ghibli-sage);
}

/* 代码示例标签页 */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 8px 20px;
  border: 2px solid var(--ghibli-sage);
  border-radius: var(--ghibli-radius-full);
  background: transparent;
  color: var(--ghibli-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: rgba(124, 185, 168, 0.1);
  transform: translateY(-2px);
}

.tab-button.active {
  background: var(--ghibli-gradient-primary);
  color: white;
  border-color: transparent;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 32px 20px;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .docs-sections {
    gap: 20px;
  }

  .section {
    padding: 24px;
  }

  h2 {
    font-size: 18px;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 15px;
  }

  .code-block {
    padding: 16px;
  }

  .code-block pre {
    font-size: 12px;
  }

  .param-table {
    font-size: 13px;
  }

  .param-table th,
  .param-table td {
    padding: 8px 12px;
  }

  .api-key-input-group {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 20px 16px;
  }

  h1 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .docs-sections {
    gap: 16px;
  }

  .section {
    padding: 20px;
  }

  h2 {
    font-size: 16px;
    margin-bottom: 16px;
  }

  h2::after {
    width: 40px;
    height: 2px;
  }

  .code-block {
    padding: 12px;
  }

  .code-block pre {
    font-size: 11px;
  }

  .tab-button {
    padding: 6px 14px;
    font-size: 13px;
  }
}
</style>
