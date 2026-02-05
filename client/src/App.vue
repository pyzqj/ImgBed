<template>
  <div id="app">
    <!-- 云朵装饰 -->
    <div class="ghibli-cloud ghibli-cloud-1"></div>
    <div class="ghibli-cloud ghibli-cloud-2"></div>
    <div class="ghibli-cloud ghibli-cloud-3"></div>
    <div class="ghibli-cloud ghibli-cloud-4"></div>
    
    <!-- 自然元素装饰 -->
    <div class="ghibli-nature-element ghibli-nature-element-1"></div>
    <div class="ghibli-nature-element ghibli-nature-element-2"></div>
    <div class="ghibli-nature-element ghibli-nature-element-3"></div>
    
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* App.vue 全局样式已被 ghibli-style.css 覆盖 */
/* 这里只保留必要的基础样式 */

#app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(124, 185, 168, 0.1);
  border-radius: var(--ghibli-radius-full);
}

::-webkit-scrollbar-thumb {
  background: var(--ghibli-gradient-primary);
  border-radius: var(--ghibli-radius-full);
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  transform: scale(1.1);
}

/* 选择文本样式 */
::selection {
  background: rgba(124, 185, 168, 0.3);
  color: var(--ghibli-text);
}

/* 禁用文本选择 */
.no-select {
  user-select: none;
}
</style>
