<template>
  <div class="upload-page">
    <Navbar />
    
    <div class="container">
      <h1>上传文件</h1>
      
      <div class="upload-section ghibli-card">
        <!-- 拖拽上传区域 -->
        <div 
          class="drop-zone"
          :class="{ 'drag-over': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
        >
          <input 
            ref="fileInput"
            type="file"
            multiple
            @change="handleFileSelect"
            style="display: none"
          />
          
          <div class="drop-zone-content">
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="17 8 12 3 7 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>拖拽文件到此处或</p>
            <button @click="$refs.fileInput.click()" class="ghibli-button ghibli-button-primary select-button">选择文件</button>
            <p v-if="selectedFiles.length > 0" class="file-count-hint">已选择 {{ selectedFiles.length }} 个文件，可继续添加</p>
          </div>
        </div>
        
        <!-- 文件列表 -->
        <div v-if="selectedFiles.length > 0" class="file-list">
          <div class="file-list-header">
            <span class="file-list-title">文件列表 ({{ selectedFiles.length }})</span>
            <button v-if="!uploading" @click="clearAllFiles" class="ghibli-button ghibli-button-secondary clear-all-button">全部清除</button>
          </div>
          
          <transition-group name="file-list" tag="div">
            <div 
              v-for="(item, index) in selectedFiles" 
              :key="item.uid"
              class="file-item"
              :class="'file-item-' + item.status"
            >
              <div class="file-item-row">
                <div class="file-item-details">
                  <span class="file-item-name">{{ item.file.name }}</span>
                  <span class="file-item-size">{{ formatFileSize(item.file.size) }}</span>
                </div>
                <div class="file-item-actions">
                  <span v-if="item.status === 'uploading'" class="status-badge status-uploading">{{ item.progress }}%</span>
                  <span v-else-if="item.status === 'success'" class="status-badge status-success">✓ 成功</span>
                  <span v-else-if="item.status === 'error'" class="status-badge status-error">✕ 失败</span>
                  <span v-else class="status-badge status-pending">等待中</span>
                  <button v-if="!uploading" @click="removeFile(index)" class="file-remove-btn">移除</button>
                </div>
              </div>
              
              <!-- 单文件上传进度条 -->
              <div v-if="item.status === 'uploading'" class="file-progress-track">
                <div class="file-progress-fill" :style="{ width: item.progress + '%' }"></div>
              </div>
              
              <!-- 错误信息 -->
              <div v-if="item.error" class="file-item-error">{{ item.error }}</div>
              
              <!-- 上传成功后的访问地址 -->
              <div v-if="item.result" class="file-item-result">
                <div class="url-box">
                  <input :value="item.result.accessUrl" readonly class="ghibli-input" />
                  <button @click="copyUrl(index, 'access')" class="ghibli-button ghibli-button-primary copy-button">复制</button>
                </div>
                <!-- Local Drive 通道显示拼接好的直接下载地址 -->
                <template v-if="item.result.directDownloadUrl">
                  <div class="url-box">
                    <input :value="item.result.directDownloadUrl" readonly class="ghibli-input" />
                    <button @click="copyUrl(index, 'direct')" class="ghibli-button ghibli-button-primary copy-button">复制</button>
                  </div>
                </template>
              </div>
            </div>
          </transition-group>
        </div>
        
        <!-- 平台选择 -->
        <div class="platform-select">
          <label>选择上传平台</label>
          <div class="platform-options">
            <label class="platform-option">
              <input type="radio" v-model="selectedPlatform" value="discord" />
              <img src="/discord.svg" alt="Discord" class="platform-icon-img" />
              <span>Discord</span>
            </label>
            
            <label class="platform-option">
              <input type="radio" v-model="selectedPlatform" value="huggingface" />
              <img src="/huggingface.svg" alt="HuggingFace" class="platform-icon-img" />
              <span>HuggingFace</span>
            </label>
            
            <label class="platform-option">
              <input type="radio" v-model="selectedPlatform" value="telegram" />
              <img src="/telegram.svg" alt="Telegram" class="platform-icon-img" />
              <span>Telegram</span>
            </label>
            
            <label class="platform-option">
              <input type="radio" v-model="selectedPlatform" value="localdrive" />
              <img src="/local-drive.svg" alt="Local Drive" class="platform-icon-img" />
              <span>Local Drive</span>
            </label>
          </div>
        </div>
        
        <!-- 上传按钮（叠加整体进度条） -->
        <button 
          @click="handleUpload" 
          :disabled="!canUpload"
          class="ghibli-button ghibli-button-primary upload-button"
          :class="{ 'uploading': uploading }"
        >
          <span class="upload-button-text">{{ uploadButtonText }}</span>
          <div v-if="uploading" class="upload-progress-bar" :style="{ width: overallProgress + '%' }"></div>
          <span v-if="uploading" class="upload-progress-text">{{ overallProgress }}%</span>
        </button>
        
        <!-- 全局错误提示 -->
        <div v-if="uploadError" class="ghibli-error">
          {{ uploadError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import Navbar from '@/components/Navbar.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

/* ========== 可配置参数 ========== */
// 最大并发上传数，控制同时上传的文件数量
const MAX_CONCURRENT_UPLOADS = 3;

/* ========== 响应式状态 ========== */
const isDragOver = ref(false);
// 文件列表，每项结构: { uid, file, progress, status, result, error }
// status 取值: pending | uploading | success | error
const selectedFiles = ref([]);
const selectedPlatform = ref('discord');
const uploading = ref(false);
const uploadError = ref('');

// 文件唯一 ID 生成器（用于 transition-group key）
let fileUidCounter = 0;

/* ========== 计算属性 ========== */

// 是否有可上传的文件（存在 pending 或 error 状态的文件）
const canUpload = computed(() => 
  selectedFiles.value.length > 0 && 
  selectedPlatform.value && 
  !uploading.value &&
  selectedFiles.value.some(f => f.status === 'pending' || f.status === 'error')
);

// 上传按钮文字
const uploadButtonText = computed(() => {
  if (uploading.value) {
    return `上传中 (${uploadCompletedCount.value}/${selectedFiles.value.length})`;
  }
  const hasFailed = selectedFiles.value.some(f => f.status === 'error');
  const hasPending = selectedFiles.value.some(f => f.status === 'pending');
  if (hasFailed && !hasPending) return '重试失败';
  return '上传';
});

// 已完成上传的文件数（成功或失败）
const uploadCompletedCount = computed(() => 
  selectedFiles.value.filter(f => f.status === 'success' || f.status === 'error').length
);

// 整体进度百分比（所有文件进度的平均值）
const overallProgress = computed(() => {
  if (selectedFiles.value.length === 0) return 0;
  const total = selectedFiles.value.reduce((sum, f) => sum + f.progress, 0);
  return Math.round(total / selectedFiles.value.length);
});

/* ========== 文件选择与管理 ========== */

/** 处理拖拽放下事件，支持多文件 */
function handleDrop(e) {
  isDragOver.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    addFiles(files);
  }
}

/** 处理文件选择事件，支持多文件 */
function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    addFiles(files);
  }
  // 清空 input 值，允许重复选择同一文件
  e.target.value = '';
}

/** 将选择的文件添加到列表中 */
function addFiles(files) {
  for (const file of files) {
    selectedFiles.value.push({
      uid: ++fileUidCounter,
      file,
      progress: 0,
      status: 'pending',
      result: null,
      error: ''
    });
  }
}

/** 移除单个文件 */
function removeFile(index) {
  selectedFiles.value.splice(index, 1);
}

/** 清除全部文件 */
function clearAllFiles() {
  selectedFiles.value = [];
  uploadError.value = '';
}

/* ========== 工具函数 ========== */

/** 格式化文件大小 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/* ========== 上传逻辑 ========== */

/**
 * 上传单个文件（含进度回调）
 * 职责：仅处理一个文件的上传和状态更新
 */
async function uploadOne(item) {
  item.status = 'uploading';
  item.progress = 0;
  item.error = '';
  item.result = null;
  
  const formData = new FormData();
  formData.append('file', item.file);
  formData.append('platform', selectedPlatform.value);
  
  try {
    const response = await axios.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authStore.token}`
      },
      // 上传进度回调，实时更新单个文件进度
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          item.progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
        }
      }
    });
    
    item.status = 'success';
    item.result = response.data;
    item.progress = 100;
  } catch (error) {
    item.status = 'error';
    item.error = error.response?.data?.error || error.message || '上传失败';
  }
}

/**
 * 批量上传入口，使用并发池控制最大并发数
 * 职责：调度多个 uploadOne 任务，控制并发上限
 */
async function handleUpload() {
  if (!canUpload.value) return;
  
  uploading.value = true;
  uploadError.value = '';
  
  // 筛选需要上传的文件（pending 或 error 状态）
  const pendingItems = selectedFiles.value.filter(
    f => f.status === 'pending' || f.status === 'error'
  );
  
  // 并发上传池
  const executing = new Set();
  
  for (const item of pendingItems) {
    // 达到并发上限时，等待最快的一个任务完成
    if (executing.size >= MAX_CONCURRENT_UPLOADS) {
      await Promise.race(executing);
    }
    
    // 启动上传任务，完成后自动从池中移除
    const task = uploadOne(item).catch(() => {});
    executing.add(task);
    task.finally(() => executing.delete(task));
  }
  
  // 等待所有剩余任务完成
  await Promise.all(executing);
  uploading.value = false;
}

/* ========== 复制链接 ========== */

/** 复制指定文件的访问地址到剪贴板 */
function copyUrl(index, type = 'access') {
  const item = selectedFiles.value[index];
  if (!item || !item.result) return;
  
  const url = type === 'direct' && item.result.directDownloadUrl
    ? item.result.directDownloadUrl
    : item.result.accessUrl;
  
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

/** 降级复制方案（兼容不支持 Clipboard API 的浏览器） */
function fallbackCopy(url) {
  const textArea = document.createElement('textarea');
  textArea.value = url;
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
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
  background: var(--ghibli-secondary);
  position: relative;
  overflow: hidden;
}

.upload-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 10% 20%, rgba(124, 185, 168, 0.1) 0%, transparent 20%),
              radial-gradient(circle at 90% 80%, rgba(232, 168, 124, 0.1) 0%, transparent 20%);
  z-index: 0;
}

.container {
  max-width: 1000px;
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

.upload-section {
  position: relative;
  z-index: 1;
}

.drop-zone {
  border: 2px dashed var(--ghibli-primary);
  border-radius: var(--ghibli-radius-lg);
  padding: 48px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.drop-zone:hover {
  border-color: var(--ghibli-accent);
  background: rgba(255, 255, 255, 0.9);
}

.drop-zone.drag-over {
  border-color: var(--ghibli-accent);
  background: rgba(232, 168, 124, 0.1);
  transform: scale(1.02);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  width: 64px;
  height: 64px;
  color: var(--ghibli-primary);
  transition: all 0.3s ease;
}

.drop-zone:hover .upload-icon {
  color: var(--ghibli-accent);
  transform: scale(1.1);
}

.drop-zone-content p {
  color: var(--ghibli-text);
  opacity: 0.8;
  font-size: 16px;
  margin: 0;
}

.file-count-hint {
  font-size: 14px !important;
  opacity: 0.6 !important;
  margin-top: 4px !important;
}

.select-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

/* ========== 文件列表样式 ========== */

.file-list {
  margin-top: 24px;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.file-list-title {
  font-weight: 600;
  color: var(--ghibli-text);
  font-size: 16px;
}

.clear-all-button {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.file-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--ghibli-radius-md);
  border: 1px solid rgba(124, 185, 168, 0.2);
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.file-item-success {
  border-color: rgba(76, 175, 80, 0.4);
  background: rgba(76, 175, 80, 0.06);
}

.file-item-error {
  border-color: rgba(244, 67, 54, 0.4);
  background: rgba(244, 67, 54, 0.06);
}

.file-item-uploading {
  border-color: rgba(124, 185, 168, 0.5);
  background: rgba(124, 185, 168, 0.08);
}

.file-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-item-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.file-item-name {
  font-weight: 600;
  color: var(--ghibli-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-item-size {
  font-size: 12px;
  color: var(--ghibli-text);
  opacity: 0.6;
}

.file-item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--ghibli-radius-full);
  white-space: nowrap;
}

.status-pending {
  background: rgba(158, 158, 158, 0.15);
  color: #757575;
}

.status-uploading {
  background: rgba(124, 185, 168, 0.2);
  color: var(--ghibli-primary);
}

.status-success {
  background: rgba(76, 175, 80, 0.15);
  color: #2e7d32;
}

.status-error {
  background: rgba(244, 67, 54, 0.15);
  color: #c62828;
}

.file-remove-btn {
  background: none;
  border: none;
  color: var(--ghibli-text);
  opacity: 0.5;
  cursor: pointer;
  font-size: 13px;
  padding: 2px 8px;
  border-radius: var(--ghibli-radius-sm);
  transition: all 0.2s ease;
}

.file-remove-btn:hover {
  opacity: 1;
  color: #f44336;
  background: rgba(244, 67, 54, 0.08);
}

/* 单文件进度条 */
.file-progress-track {
  height: 4px;
  background: rgba(124, 185, 168, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.file-progress-fill {
  height: 100%;
  background: var(--ghibli-gradient-primary);
  border-radius: 2px;
  transition: width 0.2s ease;
}

.file-item-error {
  font-size: 13px;
  color: #c62828;
  padding: 4px 0;
}

.file-item-result {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.url-box {
  display: flex;
  gap: 8px;
}

.url-box input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--ghibli-primary);
  border-radius: var(--ghibli-radius-md);
  font-size: 14px;
  background: white;
  color: var(--ghibli-text);
  transition: all 0.3s ease;
  min-width: 0;
}

.url-box input:focus {
  outline: none;
  border-color: var(--ghibli-accent);
  box-shadow: 0 0 0 3px rgba(232, 168, 124, 0.1);
}

.copy-button {
  padding: 8px 16px;
  background: var(--ghibli-gradient-primary);
  color: white;
  border: none;
  border-radius: var(--ghibli-radius-full);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--ghibli-shadow-sm);
  flex-shrink: 0;
}

.copy-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--ghibli-shadow);
}

/* ========== 平台选择样式 ========== */

.platform-select {
  margin-top: 24px;
}

.platform-select label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--ghibli-text);
}

.platform-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.platform-option {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  padding: 20px 16px;
  border: 2px solid rgba(124, 185, 168, 0.3);
  border-radius: var(--ghibli-radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  background: rgba(255, 255, 255, 0.8);
  min-width: 100px;
  text-align: center;
}

.platform-option:hover {
  border-color: var(--ghibli-primary);
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.platform-option input[type="radio"] {
  display: none;
}

.platform-icon-img {
  width: 40px;
  height: 40px;
  transition: all 0.3s ease;
  display: block;
  margin: 0 auto;
  flex-shrink: 0;
}

.platform-option:hover .platform-icon-img {
  transform: scale(1.1);
}

.platform-option span {
  font-size: 14px;
  color: var(--ghibli-text);
  font-weight: 500;
  display: block;
  text-align: center;
  margin: 0;
  padding: 0;
}

.platform-option:has(input[type="radio"]:checked) {
  background: rgba(124, 185, 168, 0.2);
  border-color: var(--ghibli-primary);
  transform: translateY(-2px);
}

.platform-option:has(input[type="radio"]:checked) span {
  color: var(--ghibli-primary);
  font-weight: 600;
}

/* ========== 上传按钮样式 ========== */

.upload-button {
  width: 100%;
  padding: 16px;
  margin-top: 24px;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 上传中状态：按钮背景半透明，让进度条可见 */
.upload-button.uploading {
  background: rgba(124, 185, 168, 0.3);
  color: var(--ghibli-text);
}

/* 按钮文字层 */
.upload-button-text {
  position: relative;
  z-index: 2;
}

/* 进度条叠加层，从左到右填充 */
.upload-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--ghibli-gradient-primary);
  transition: width 0.2s ease;
  z-index: 1;
  border-radius: inherit;
}

/* 进度百分比文字 */
.upload-progress-text {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 600;
  color: white;
  z-index: 3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* ========== 文件列表过渡动画 ========== */

.file-list-enter-active,
.file-list-leave-active {
  transition: all 0.3s ease;
}

.file-list-enter-from,
.file-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* ========== 响应式设计 ========== */

@media (max-width: 768px) {
  .container {
    padding: 32px 20px;
  }
  
  h1 {
    font-size: 24px;
    margin-bottom: 24px;
  }
  
  .drop-zone {
    padding: 32px;
  }
  
  .upload-icon {
    width: 56px;
    height: 56px;
  }
  
  .drop-zone-content p {
    font-size: 14px;
  }
  
  .select-button {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .file-item {
    padding: 12px;
  }
  
  .file-item-name {
    font-size: 14px;
  }
  
  .platform-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .platform-option {
    padding: 16px 12px;
    gap: 10px;
    min-width: 80px;
  }
  
  .platform-icon-img {
    width: 36px;
    height: 36px;
    margin: 0 auto;
    flex-shrink: 0;
  }
  
  .platform-option span {
    font-size: 12px;
  }
  
  .upload-button {
    padding: 14px;
    font-size: 16px;
  }
  
  .url-box {
    flex-direction: column;
    gap: 8px;
  }
  
  .copy-button {
    width: 100%;
    padding: 8px;
    font-size: 13px;
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
  
  .drop-zone {
    padding: 24px;
  }
  
  .upload-icon {
    width: 48px;
    height: 48px;
  }
  
  .drop-zone-content p {
    font-size: 13px;
  }
  
  .select-button {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .file-item-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .file-item-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .platform-options {
    gap: 10px;
  }
  
  .platform-option {
    padding: 14px 10px;
    gap: 8px;
    min-width: 70px;
  }
  
  .platform-icon-img {
    width: 32px;
    height: 32px;
    margin: 0 auto;
    flex-shrink: 0;
  }
  
  .platform-option span {
    font-size: 11px;
  }
  
  .upload-button {
    padding: 12px;
    font-size: 14px;
  }
}
</style>
