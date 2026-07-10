import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/upload'
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/Upload.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/files',
    name: 'Files',
    component: () => import('@/views/Files.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/api-docs',
    name: 'ApiDocs',
    component: () => import('@/views/ApiDocs.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

/**
 * 异步路由守卫
 * 首次进入受保护页面前，向服务端验证 token 有效性
 * 防止 localStorage 中存在过期 token 时误入页面
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 验证中时等待完成，避免闪烁
  if (authStore.isVerifying) {
    await new Promise(resolve => {
      const check = () => {
        if (!authStore.isVerifying) resolve();
        else setTimeout(check, 50);
      };
      check();
    });
  }

  // 需要登录的页面：先验证 token
  if (to.meta.requiresAuth) {
    if (!authStore.verified) {
      const isValid = await authStore.verifyToken();
      if (!isValid) {
        return next('/login');
      }
    } else if (!authStore.isAuthenticated) {
      return next('/login');
    }
    next();
  } else if (to.path === '/login') {
    // 已登录用户访问登录页时重定向到上传页
    if (!authStore.verified) {
      const isValid = await authStore.verifyToken();
      if (isValid) {
        return next('/upload');
      }
    } else if (authStore.isAuthenticated) {
      return next('/upload');
    }
    next();
  } else {
    next();
  }
});

export default router;
