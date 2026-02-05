<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-container">
        <img src="/image.svg" alt="ImgBed Logo" class="logo" />
      </div>
      <h1>ImgBed</h1>
      <p class="subtitle">多平台图床服务</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入用户名"
            required
            class="ghibli-input"
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="请输入密码"
            required
            class="ghibli-input"
          />
        </div>
        
        <div v-if="error" class="ghibli-error">
          {{ error }}
        </div>
        
        <button type="submit" :disabled="loading" class="ghibli-button ghibli-button-primary login-button">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <p class="hint">默认账号: admin / admin</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';
  
  const result = await authStore.login(username.value, password.value);
  
  if (result.success) {
    router.push('/upload');
  } else {
    error.value = result.error;
  }
  
  loading.value = false;
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ghibli-gradient-secondary);
  padding: 20px;
}

.login-box {
  background: var(--ghibli-light);
  padding: 40px;
  border-radius: var(--ghibli-radius-lg);
  box-shadow: var(--ghibli-shadow);
  width: 100%;
  max-width: 400px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.login-box::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(124, 185, 168, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(5%, 5%) rotate(180deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.logo {
  width: 120px;
  height: auto;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

h1 {
  text-align: center;
  color: var(--ghibli-text);
  margin-bottom: 8px;
  font-size: 32px;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.subtitle {
  text-align: center;
  color: var(--ghibli-text);
  opacity: 0.8;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--ghibli-text);
  font-weight: 500;
  text-align: left;
}

.login-button {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
  position: relative;
  z-index: 1;
}

.hint {
  text-align: center;
  color: var(--ghibli-text);
  opacity: 0.7;
  font-size: 12px;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-box {
    padding: 32px;
  }
  
  h1 {
    font-size: 28px;
  }
  
  .subtitle {
    margin-bottom: 24px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  .login-box {
    padding: 24px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .subtitle {
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .login-button {
    padding: 12px;
    font-size: 14px;
  }
  
  .hint {
    margin-top: 16px;
    font-size: 11px;
  }
}
</style>
