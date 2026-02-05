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
                placeholder="请输入当前密码"
                required
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>新密码</label>
              <input 
                v-model="passwordForm.newPassword" 
                type="password" 
                placeholder="请输入新密码（至少6位）"
                required
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>确认新密码</label>
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
              {{ passwordLoading ? '修改中...' : '修改密码' }}
            </button>
          </form>
        </div>
        
        <div class="section ghibli-card">
          <h2>Discord 配置</h2>
          <form @submit.prevent="saveDiscordConfig" class="config-form">
            <div class="form-group">
              <label>Bot Token</label>
              <input 
                v-model="discordConfig.botToken" 
                type="text" 
                placeholder="请输入 Discord Bot Token"
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>Channel ID</label>
              <input 
                v-model="discordConfig.channelId" 
                type="text" 
                placeholder="请输入频道 ID"
                class="ghibli-input"
              />
            </div>
            
            <button type="submit" :disabled="discordLoading" class="ghibli-button ghibli-button-primary submit-button">
              {{ discordLoading ? '保存中...' : '保存 Discord 配置' }}
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
                placeholder="请输入 HuggingFace Token"
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
              <label>Path (可选)</label>
              <input 
                v-model="huggingfaceConfig.path" 
                type="text" 
                placeholder="文件存储路径（如: images）"
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
              {{ huggingfaceLoading ? '保存中...' : '保存 HuggingFace 配置' }}
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
                placeholder="请输入 Telegram Bot Token"
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>Chat ID</label>
              <input 
                v-model="telegramConfig.chatId" 
                type="text" 
                placeholder="请输入 Chat ID"
                class="ghibli-input"
              />
            </div>
            
            <div class="form-group">
              <label>Proxy URL (可选)</label>
              <input 
                v-model="telegramConfig.proxyUrl" 
                type="text" 
                placeholder="代理域名（如: api.telegram.org）"
                class="ghibli-input"
              />
            </div>
            
            <button type="submit" :disabled="telegramLoading" class="ghibli-button ghibli-button-primary submit-button">
              {{ telegramLoading ? '保存中...' : '保存 Telegram 配置' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
  } catch (error) {
    console.error('Failed to load configs:', error);
  }
}

async function handleChangePassword() {
  passwordLoading.value = true;
  passwordError.value = '';
  passwordSuccess.value = false;
  
  // 验证两次输入的新密码是否一致
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '两次输入的新密码不一致，请重新输入';
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

onMounted(() => {
  loadConfigs();
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

/* 响应式设计 */
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
