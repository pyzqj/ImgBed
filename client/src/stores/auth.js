import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  // 是否正在验证 token（页面加载时进行一次服务端验证）
  const isVerifying = ref(false);
  // token 是否已通过服务端验证（避免每次路由跳转都验证）
  const verified = ref(false);

  const isAuthenticated = computed(() => !!token.value);

  /**
   * 向服务端验证当前 token 是否有效
   * 解决 localStorage 中存在过期/无效 token 时路由守卫误判的问题
   * @returns {Promise<boolean>} token 是否有效
   */
  async function verifyToken() {
    // 没有 token 不需要验证
    if (!token.value) {
      verified.value = true;
      return false;
    }

    // 已验证过则直接返回缓存结果
    if (verified.value) {
      return true;
    }

    isVerifying.value = true;
    try {
      await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      verified.value = true;
      return true;
    } catch {
      // token 已过期或无效，清除本地凭证
      token.value = '';
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      verified.value = true;
      return false;
    } finally {
      isVerifying.value = false;
    }
  }

  async function login(username, password) {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      verified.value = true;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || '登录失败' 
      };
    }
  }

  async function logout() {
    token.value = '';
    user.value = null;
    verified.value = false;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async function changePassword(oldPassword, newPassword) {
    try {
      await axios.post('/api/auth/change-password', { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || '修改密码失败' 
      };
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    isVerifying,
    verified,
    verifyToken,
    login,
    logout,
    changePassword
  };
});
