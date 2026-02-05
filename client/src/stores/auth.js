import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  const isAuthenticated = computed(() => !!token.value);

  async function login(username, password) {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
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
    login,
    logout,
    changePassword
  };
});
