<template>
  <div class="settings-page">
    <Navbar />
    
    <div class="container">
      <h1>设置</h1>
      
      <div class="settings-sections">
        <div class="section ghibli-card">
          <h2>修改密码</h2>
          <form @submit.prevent="handleChangePassword" class="password-form">
            <div class="form-group">
              <label>当前密码</label>
              <input 
                v-model="passwordForm.oldPassword" 
                type="password" 
                placeholder="请输入当前密�?
                required
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>新密�?/label>
              <input 
                v-model="passwordForm.newPassword" 
                type="password" 
                placeholder="请输入新密码（至�?位）"
                required
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>确认新密�?/label>
              <input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入新密码"
                required
                class="ghibli-input"
              />
            </div>
            
            <div v-if="passwordError" class="ghibli-error">
              {{ passwordError }}
            </div>
            
            <div v-if="passwordSuccess" class="ghibli-success">
              密码修改成功
            </div>
            
            <button type="submit" :disabled="passwordLoading" class="ghibli-button ghibli-button-primary submit-button">
              {{ passwordLoading ? '修改�?..' : '修改密码' }}
            </button>
          </form>
        </div>
        
        <div class="section ghibli-card">
          <h2>API Key 管理</h2>
          <div class="api-key-section">
            <div class="form-group">
              <label>API Key</label>
              <div class="api-key-input-group">
                <input
                  v-model="apiKeyForm.apiKey"
                  :type="apiKeyVisible ? 'text' : 'password'"
                  placeholder="请输�?API Key"
                  class="ghibli-input api-key-input"
                />
                <button type="button" @click="apiKeyVisible = !apiKeyVisible" class="ghibli-button ghibli-button-secondary toggle-button">
                  {{ apiKeyVisible ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>

            <div v-if="apiKeySource" class="api-key-source">
              <span class="source-badge" :class="apiKeySourceClass">
                {{ apiKeySourceText }}
              </span>
            </div>

            <div class="api-key-tips">
              <p>API Key 用于通过 API 接口上传文件，修改后立即生效无需重启服务器�?/p>
              <p>如需查看 API 使用方法，请访问 <router-link to="/api-docs" class="api-docs-link">API 文档</router-link> 页面�?/p>
            </div>

            <div v-if="apiKeyError" class="ghibli-error">
              {{ apiKeyError }}
            </div>

            <div v-if="apiKeySuccess" class="ghibli-success">
              API Key 保存成功
            </div>

            <div class="api-key-actions">
              <button type="button" @click="saveApiKey" :disabled="apiKeyLoading" class="ghibli-button ghibli-button-primary submit-button">
                {{ apiKeyLoading ? '保存�?..' : '保存 API Key' }}
              </button>
              <button type="button" @click="generateApiKey" class="ghibli-button ghibli-button-secondary generate-button">
                随机生成
              </button>
            </div>
          </div>
        </div>
        
        <div class="section ghibli-card">
          <h2>Discord 配置</h2>
          <form @submit.prevent="saveDiscordConfig" class="config-form">
            <div class="form-group">
              <label>Bot Token</label>
              <input 
                v-model="discordConfig.botToken" 
                type="text" 
                placeholder="请输�?Discord Bot Token"
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>Channel ID</label>
              <input 
                v-model="discordConfig.channelId" 
                type="text" 
                placeholder="请输入频�?ID"
                class="ghibli-input"
              />
            </div>
            
            <button type="submit" :disabled="discordLoading" class="ghibli-button ghibli-button-primary submit-button">
              {{ discordLoading ? '保存�?..' : '保存 Discord 配置' }}
            </button>
          </form>
        </div>
        
        <div class="section ghibli-card">
          <h2>HuggingFace 配置</h2>
          <form @submit.prevent="saveHuggingFaceConfig" class="config-form">
            <div class="form-group">
              <label>Token</label>
              <input 
                v-model="huggingfaceConfig.token" 
                type="text" 
                placeholder="请输�?HuggingFace Token"
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>Repository</label>
              <input 
                v-model="huggingfaceConfig.repo" 
                type="text" 
                placeholder="格式: username/repo-name"
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>Path (可�?</label>
              <input 
                v-model="huggingfaceConfig.path" 
                type="text" 
                placeholder="文件存储路径（如: images�?
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group checkbox">
              <label>
                <input 
                  v-model="huggingfaceConfig.isPrivate" 
                  type="checkbox"
                />
                私有仓库
              </label>
            </div>
            
            <button type="submit" :disabled="huggingfaceLoading" class="ghibli-button ghibli-button-primary submit-button">
              {{ huggingfaceLoading ? '保存�?..' : '保存 HuggingFace 配置' }}
            </button>
          </form>
        </div>
        
        <div class="section ghibli-card">
          <h2>Telegram 配置</h2>
          <form @submit.prevent="saveTelegramConfig" class="config-form">
            <div class="form-group">
              <label>Bot Token</label>
              <input 
                v-model="telegramConfig.botToken" 
                type="text" 
                placeholder="请输�?Telegram Bot Token"
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>Chat ID</label>
              <input 
                v-model="telegramConfig.chatId" 
                type="text" 
                placeholder="请输�?Chat ID"
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>Proxy URL (可�?</label>
              <input 
                v-model="telegramConfig.proxyUrl" 
                type="text" 
                placeholder="代理域名（如: api.telegram.org�?
                class="ghibli-input"
              />
            </div>
            
            <button type="submit" :disabled="telegramLoading" class="ghibli-button ghibli-button-primary submit-button">
              {{ telegramLoading ? '保存�?..' : '保存 Telegram 配置' }}
            </button>
          </form>
        </div>
        
        <div class="section ghibli-card">
          <h2>Local Drive 配置</h2>
          <form @submit.prevent="saveLocalDriveConfig" class="config-form">
            <div class="form-group">
              <label>服务器地址</label>
              <input 
                v-model="localDriveConfig.serverUrl" 
                type="text" 
                placeholder="请输�?Local Drive 服务器地址（如: http://your-server:port�?
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>认证令牌 (Authorization Token)</label>
              <input 
                v-model="localDriveConfig.authToken" 
                type="text" 
                placeholder="请输�?Bearer 认证令牌"
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>Agent ID (可�?</label>
              <input 
                v-model="localDriveConfig.agentId" 
                type="text" 
                placeholder="智能�?ID（默�? default�?
                class="ghibli-input"
              />
            </div>
            
            <div class="api-key-tips">
              <p>Local Drive 通道会将文件上传到指定的 Local Drive 服务器，上传成功后会返回拼接好的直接下载地址�?/p>
              <p>认证方式: Bearer Token，请求头格式 <code>Authorization: Bearer {token}</code></p>
            </div>
            
            <button type="submit" :disabled="localDriveLoading" class="ghibli-button ghibli-button-primary submit-button">
              {{ localDriveLoading ? '保存�?..' : '保存 Local Drive 配置' }}
            </button>
          </form>
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

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const passwordLoading = ref(false);
const passwordError = ref('');
const passwordSuccess = ref(false);

const discordConfig = ref({
  botToken: '',
  channelId: ''
});
const discordLoading = ref(false);

const huggingfaceConfig = ref({
  token: '',
  repo: '',
  path: '',
  isPrivate: false
});
const huggingfaceLoading = ref(false);

const telegramConfig = ref({
  botToken: '',
  chatId: '',
  proxyUrl: ''
});
const telegramLoading = ref(false);

// Local Drive 配置
const localDriveConfig = ref({
  serverUrl: 'http://your-server:port',
  authToken: '',
  agentId: 'default'
});
const localDriveLoading = ref(false);

// API Key 管理相关状�?
const apiKeyForm = ref({ apiKey: '' });
const apiKeyVisible = ref(false);
const apiKeyLoading = ref(false);
const apiKeyError = ref('');
const apiKeySuccess = ref(false);
const apiKeySource = ref('');

async function loadConfigs() {
  try {
    const response = await axios.get('/api/config', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    
    if (response.data.discord) {
      discordConfig.value = response.data.discord;
    }
    if (response.data.huggingface) {
      huggingfaceConfig.value = response.data.huggingface;
    }
    if (response.data.telegram) {
      telegramConfig.value = response.data.telegram;
    }
    if (response.data.localdrive) {
      localDriveConfig.value = response.data.localdrive;
    }
  } catch (error) {
    console.error('Failed to load configs:', error);
  }
}

/**
 * 加载 API Key，优先从数据库获取，未设置时回退到环境变�?
 */
async function loadApiKey() {
  try {
    const response = await axios.get('/api/config/api-key', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    apiKeyForm.value.apiKey = response.data.apiKey || '';
    apiKeySource.value = response.data.source || 'none';
  } catch (error) {
    console.error('Failed to load API key:', error);
  }
}

/**
 * 保存 API Key 到数据库，修改后立即生效
 */
async function saveApiKey() {
  apiKeyLoading.value = true;
  apiKeyError.value = '';
  apiKeySuccess.value = false;

  if (!apiKeyForm.value.apiKey) {
    apiKeyError.value = 'API Key 不能为空';
    apiKeyLoading.value = false;
    return;
  }

  if (apiKeyForm.value.apiKey.length < 8) {
    apiKeyError.value = 'API Key 至少需�?8 个字�?;
    apiKeyLoading.value = false;
    return;
  }

  try {
    await axios.post('/api/config/api-key', { apiKey: apiKeyForm.value.apiKey }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    apiKeySuccess.value = true;
    apiKeySource.value = 'database';
    setTimeout(() => {
      apiKeySuccess.value = false;
    }, 3000);
  } catch (error) {
    apiKeyError.value = error.response?.data?.error || error.message || '保存失败';
  }

  apiKeyLoading.value = false;
}

/**
 * 随机生成一个强 API Key
 */
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [];
  // 生成 4 段，每段 8 个字符，�?- 分隔
  for (let s = 0; s < 4; s++) {
    let segment = '';
    for (let i = 0; i < 8; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  apiKeyForm.value.apiKey = segments.join('-');
  apiKeyVisible.value = true;
}

const apiKeySourceText = computed(() => {
  switch (apiKeySource.value) {
    case 'database': return '当前来源：数据库（页面修改）';
    case 'env': return '当前来源：环境变量（.env 文件�?;
    default: return '未设�?;
  }
});

const apiKeySourceClass = computed(() => {
  switch (apiKeySource.value) {
    case 'database': return 'source-database';
    case 'env': return 'source-env';
    default: return 'source-none';
  }
});

async function handleChangePassword() {
  passwordLoading.value = true;
  passwordError.value = '';
  passwordSuccess.value = false;
  
  // 验证两次输入的新密码是否一�?
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '两次输入的新密码不一致，请重新输�?;
    passwordLoading.value = false;
    return;
  }
  
  const result = await authStore.changePassword(
    passwordForm.value.oldPassword,
    passwordForm.value.newPassword
  );
  
  if (result.success) {
    passwordSuccess.value = true;
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
    setTimeout(() => {
      passwordSuccess.value = false;
    }, 3000);
  } else {
    passwordError.value = result.error;
  }
  
  passwordLoading.value = false;
}

async function saveDiscordConfig() {
  discordLoading.value = true;
  
  try {
    await axios.post('/api/config/discord', discordConfig.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert('Discord 配置保存成功');
  } catch (error) {
    alert('保存失败: ' + (error.response?.data?.error || error.message));
  }
  
  discordLoading.value = false;
}

async function saveHuggingFaceConfig() {
  huggingfaceLoading.value = true;
  
  try {
    await axios.post('/api/config/huggingface', huggingfaceConfig.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert('HuggingFace 配置保存成功');
  } catch (error) {
    alert('保存失败: ' + (error.response?.data?.error || error.message));
  }
  
  huggingfaceLoading.value = false;
}

async function saveTelegramConfig() {
  telegramLoading.value = true;
  
  try {
    await axios.post('/api/config/telegram', telegramConfig.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert('Telegram 配置保存成功');
  } catch (error) {
    alert('保存失败: ' + (error.response?.data?.error || error.message));
  }
  
  telegramLoading.value = false;
}

/**
 * 保存 Local Drive 配置到数据库
 */
async function saveLocalDriveConfig() {
  localDriveLoading.value = true;
  
  try {
    await axios.post('/api/config/localdrive', localDriveConfig.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert('Local Drive 配置保存成功');
  } catch (error) {
    alert('保存失败: ' + (error.response?.data?.error || error.message));
  }
  
  localDriveLoading.value = false;
}

onMounted(() => {
  loadConfigs();
  loadApiKey();
});
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--ghibli-secondary);
  position: relative;
  overflow: hidden;
}

.settings-page::before {
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
  max-width: 800px;
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

.settings-sections {
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

.form-group {
  margin-bottom: 20px;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.form-group.checkbox label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: var(--ghibli-text);
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: var(--ghibli-radius-md);
  background: rgba(255, 255, 255, 0.8);
}

.form-group.checkbox label:hover {
  background: rgba(124, 185, 168, 0.1);
  transform: translateY(-2px);
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--ghibli-text);
  font-weight: 500;
  font-size: 14px;
}

input[type="checkbox"] {
  width: auto;
  cursor: pointer;
  transform: scale(1.2);
  accent-color: var(--ghibli-primary);
  transition: all 0.3s ease;
}

input[type="checkbox"]:hover {
  transform: scale(1.3);
}

.submit-button {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 8px;
}

/* API Key 管理区块样式 */
.api-key-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.api-key-input-group {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.api-key-input {
  flex: 1;
}

.toggle-button {
  white-space: nowrap;
  padding: 10px 20px;
  font-size: 14px;
}

.api-key-source {
  margin-bottom: 12px;
}

.source-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--ghibli-radius-full);
  font-size: 12px;
  font-weight: 600;
}

.source-database {
  background: rgba(124, 185, 168, 0.15);
  color: var(--ghibli-sage);
}

.source-env {
  background: rgba(232, 168, 124, 0.15);
  color: var(--ghibli-coral);
}

.source-none {
  background: rgba(255, 100, 100, 0.1);
  color: #c33;
}

.api-key-tips {
  background: rgba(133, 205, 202, 0.1);
  border-radius: var(--ghibli-radius-md);
  padding: 12px 16px;
  margin: 12px 0;
}

.api-key-tips p {
  font-size: 13px;
  color: var(--ghibli-text);
  line-height: 1.8;
  margin: 0;
}

.api-key-tips code {
  background: rgba(124, 185, 168, 0.15);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: var(--ghibli-sage);
}

.api-docs-link {
  color: var(--ghibli-sage);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.api-docs-link:hover {
  color: var(--ghibli-coral);
  text-decoration: underline;
}

.api-key-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.api-key-actions .submit-button {
  flex: 1;
  margin-top: 0;
}

.generate-button {
  white-space: nowrap;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
}

/* 响应式设�?*/
@media (max-width: 768px) {
  .container {
    padding: 32px 20px;
  }
  
  h1 {
    font-size: 24px;
    margin-bottom: 24px;
  }
  
  .settings-sections {
    gap: 20px;
  }
  
  .section {
    padding: 24px;
  }
  
  h2 {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group.checkbox {
    margin-bottom: 20px;
  }
  
  .form-group.checkbox label {
    gap: 8px;
    padding: 6px 12px;
  }
  
  input[type="checkbox"] {
    transform: scale(1.1);
  }
  
  .submit-button {
    padding: 12px;
    font-size: 14px;
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
  
  .settings-sections {
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
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group.checkbox {
    margin-bottom: 16px;
  }
  
  label {
    font-size: 13px;
    margin-bottom: 6px;
  }
  
  .submit-button {
    padding: 10px;
    font-size: 13px;
  }
}
</style>
