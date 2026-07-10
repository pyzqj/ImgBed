import { createApp } from 'vue';
import { createPinia } from 'pinia';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import './styles/ghibli-style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

/**
 * 全局 axios 响应拦截器
 * 捕获 401/403 响应，自动清除过期凭证并跳转登录页
 * 解决 CDN 缓存导致页面已加载但 token 已过期的问题
 */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // 401 = 未授权（token 不存在/过期），403 = token 无效
    if (status === 401 || status === 403) {
      const authStore = useAuthStore();
      // 避免在登录接口报 401 时重复跳转
      const isLoginRequest = error.config?.url?.includes('/api/auth/login');
      if (!isLoginRequest && authStore.isAuthenticated) {
        authStore.logout();
        router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);

app.mount('#app');
