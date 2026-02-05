<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/upload" class="brand-link">
          <img src="/image.svg" alt="ImgBed Logo" class="brand-logo" />
          <span>ImgBed</span>
        </router-link>
      </div>
      
      <div class="nav-links">
        <router-link to="/upload" class="nav-link">上传</router-link>
        <router-link to="/files" class="nav-link">文件列表</router-link>
        <router-link to="/settings" class="nav-link">设置</router-link>
        <button @click="handleLogout" class="ghibli-button ghibli-button-secondary logout-button">退出</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.navbar {
  background: var(--ghibli-light);
  box-shadow: var(--ghibli-shadow);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom-left-radius: var(--ghibli-radius-lg);
  border-bottom-right-radius: var(--ghibli-radius-lg);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: var(--ghibli-primary);
  text-decoration: none;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brand-link:hover {
  color: var(--ghibli-accent);
  transform: scale(1.05);
}

.brand-logo {
  width: 48px;
  height: 48px;
  transition: all 0.3s ease;
}

.brand-link:hover .brand-logo {
  transform: rotate(5deg) scale(1.1);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: var(--ghibli-text);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: var(--ghibli-radius-full);
  position: relative;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--ghibli-primary);
  background: rgba(124, 185, 168, 0.1);
  transform: translateY(-2px);
}

.logout-button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 20px;
    height: 60px;
  }
  
  .brand-link {
    font-size: 20px;
    gap: 10px;
  }
  
  .brand-logo {
    width: 44px;
    height: 44px;
  }
  
  .nav-links {
    gap: 16px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .logout-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 16px;
    height: 56px;
  }
  
  .brand-link {
    font-size: 18px;
    gap: 8px;
  }
  
  .brand-logo {
    width: 40px;
    height: 40px;
  }
  
  .nav-links {
    gap: 12px;
  }
  
  .nav-link {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .logout-button {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>
