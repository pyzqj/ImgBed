<template>
  <div class="files-page">
    <Navbar />
    
    <div class="container">
      <h1>文件列表 <span v-if="totalFiles > 0" class="file-count">({{ totalFiles }})</span></h1>
      
      <div v-if="loading" class="loading">
        加载中...
      </div>
      
      <div v-else-if="files.length === 0" class="empty">
        <p>暂无文件</p>
        <router-link to="/upload" class="ghibli-button ghibli-button-primary upload-link">去上传</router-link>
      </div>
      
      <div v-else class="files-grid">
        <div v-for="file in files" :key="file.id" class="file-card ghibli-card">
          <div class="file-preview" @click="openPreview(file)">
            <img v-if="isImage(file.file_type)" :src="getFileUrl(file.id)" :alt="file.file_name" />
            <div v-else class="file-icon">
              {{ getFileExtension(file.file_name) }}
            </div>
          </div>
          
          <div class="file-info">
            <div class="file-name" :title="file.file_name">{{ file.file_name }}</div>
            <div class="file-meta">
              <span class="platform-badge" :class="file.channel">{{ file.channel }}</span>
              <span class="file-size">{{ formatFileSize(file.file_size) }}</span>
            </div>
            <div class="file-date">{{ formatDate(file.created_at) }}</div>
          </div>
          
          <div class="file-actions">
            <button @click="copyUrl(file.id)" class="ghibli-button ghibli-button-secondary action-button copy">
              复制链接
            </button>
            <button @click="deleteFile(file.id)" class="ghibli-button ghibli-button-secondary action-button delete">
              删除
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="goToPrevPage" 
          :disabled="currentPage === 1"
          class="ghibli-button ghibli-button-primary pagination-button"
        >
          上一页
        </button>
        
        <!-- 页码按钮 -->
        <div class="pagination-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :disabled="page === '...'"
            :class="['ghibli-button', 'ghibli-button-secondary', 'pagination-number', { active: currentPage === page }]"
          >
            {{ page }}
          </button>
        </div>
        
        <!-- 页面输入 -->
        <div class="pagination-input">
          <input 
            v-model="pageInput" 
            type="number" 
            min="1" 
            :max="totalPages"
            @keyup.enter="goToPageByInput"
            class="ghibli-input page-input"
          />
          <button @click="goToPageByInput" class="ghibli-button ghibli-button-primary page-go-button">
            跳转
          </button>
        </div>
        
        <button 
          @click="goToNextPage" 
          :disabled="currentPage === totalPages"
          class="ghibli-button ghibli-button-primary pagination-button"
        >
          下一页
        </button>
      </div>
    </div>
    
    <div v-if="showPreview" class="preview-modal" @click="closePreview">
      <div class="preview-content ghibli-card" @click.stop>
        <button @click="closePreview" class="ghibli-button ghibli-button-secondary close-button">&times;</button>
        <img v-if="isImage(previewFile.content_type)" :src="getFileUrl(previewFile.file_id)" :alt="previewFile.file_name" />
        <div v-else class="file-icon-large">
          {{ getFileExtension(previewFile.file_name) }}
        </div>
        <div class="preview-info">
          <p><strong>文件名:</strong> {{ previewFile.file_name }}</p>
          <p><strong>大小:</strong> {{ formatFileSize(previewFile.file_size) }}</p>
          <p><strong>类型:</strong> {{ previewFile.content_type }}</p>
          <p><strong>平台:</strong> {{ previewFile.platform }}</p>
          <p><strong>上传时间:</strong> {{ formatDate(previewFile.created_at) }}</p>
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

const loading = ref(true);
const files = ref([]);
const totalFiles = ref(0);
const currentPage = ref(1);
const pageSize = ref(21);
const showPreview = ref(false);
const previewFile = ref(null);
const pageInput = ref('');

// 计算当前可见的页码
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  // 总是显示第一页
  if (total >= 1) {
    pages.push(1);
  }
  
  // 显示当前页附近的页码
  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);
  
  // 添加省略号
  if (start > 2) {
    pages.push('...');
  }
  
  // 添加中间的页码
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  // 添加省略号
  if (end < total - 1) {
    pages.push('...');
  }
  
  // 总是显示最后一页
  if (total > 1) {
    pages.push(total);
  }
  
  return pages;
});

// 通过输入跳转页面
function goToPageByInput() {
  const page = parseInt(pageInput.value);
  if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
    goToPage(page);
    pageInput.value = '';
  }
}

async function loadFiles(page = 1) {
  loading.value = true;
  currentPage.value = page;
  
  try {
    const offset = (page - 1) * pageSize.value;
    const response = await axios.get('/api/files', {
      headers: { Authorization: `Bearer ${authStore.token}` },
      params: {
        limit: pageSize.value,
        offset: offset
      }
    });
    files.value = response.data.files;
    totalFiles.value = response.data.total || 0;
  } catch (error) {
    console.error('Failed to load files:', error);
  }
  
  loading.value = false;
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return;
  loadFiles(page);
}

function goToPrevPage() {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
}

const totalPages = computed(() => Math.ceil(totalFiles.value / pageSize.value));

function isImage(contentType) {
  return contentType && contentType.startsWith('image/');
}

function getFileExtension(fileName) {
  if (!fileName) return 'FILE';
  const ext = fileName.split('.').pop().toUpperCase();
  return ext || 'FILE';
}

function formatFileSize(size) {
  if (!size) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  if (typeof size === 'string') {
    const sizeMB = parseFloat(size);
    if (!isNaN(sizeMB)) {
      return sizeMB + ' MB';
    }
  }
  
  const i = Math.floor(Math.log(size) / Math.log(k));
  return Math.round(size / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
}

function getFileUrl(fileId) {
  return `${window.location.origin}/file/${encodeURIComponent(fileId)}`;
}

function copyUrl(fileId) {
  const url = getFileUrl(fileId);
  
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

async function deleteFile(fileId) {
  if (!confirm('确定要删除这个文件吗？')) {
    return;
  }
  
  try {
    await axios.delete(`/api/files/${encodeURIComponent(fileId)}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    
    alert('删除成功');
    
    const remainingFiles = files.value.filter(f => f.file_id !== fileId);
    if (remainingFiles.length === 0 && currentPage.value > 1) {
      loadFiles(currentPage.value - 1);
    } else {
      loadFiles(currentPage.value);
    }
  } catch (error) {
    alert('删除失败: ' + (error.response?.data?.error || error.message));
  }
}

function openPreview(file) {
  previewFile.value = file;
  showPreview.value = true;
}

function closePreview() {
  showPreview.value = false;
  previewFile.value = null;
}

onMounted(() => {
  loadFiles();
});
</script>

<style scoped>
.files-page {
  min-height: 100vh;
  background: var(--ghibli-secondary);
  position: relative;
  overflow: hidden;
}

.files-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 30%, rgba(124, 185, 168, 0.1) 0%, transparent 30%),
              radial-gradient(circle at 80% 70%, rgba(232, 168, 124, 0.1) 0%, transparent 30%);
  z-index: 0;
}

.container {
  max-width: 1200px;
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

.file-count {
  font-size: 18px;
  opacity: 0.8;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 24px;
  color: var(--ghibli-text);
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--ghibli-radius-lg);
  box-shadow: var(--ghibli-shadow);
  margin: 24px 0;
}

.upload-link {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin: 24px 0;
}

.file-card {
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.file-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.file-preview {
  width: 100%;
  height: 200px;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  border-top-left-radius: var(--ghibli-radius-lg);
  border-top-right-radius: var(--ghibli-radius-lg);
  transition: all 0.3s ease;
}

.file-card:hover .file-preview {
  background: rgba(255, 255, 255, 0.9);
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.file-card:hover .file-preview img {
  transform: scale(1.05);
}

.file-icon {
  width: 80px;
  height: 80px;
  background: var(--ghibli-gradient-primary);
  color: white;
  border-radius: var(--ghibli-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  box-shadow: var(--ghibli-shadow);
  transition: all 0.3s ease;
}

.file-card:hover .file-icon {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(124, 185, 168, 0.3);
}

.file-info {
  padding: 20px;
  background: var(--ghibli-light);
  border-bottom-left-radius: var(--ghibli-radius-lg);
  border-bottom-right-radius: var(--ghibli-radius-lg);
}

.file-name {
  font-weight: 600;
  color: var(--ghibli-text);
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.platform-badge {
  padding: 6px 12px;
  border-radius: var(--ghibli-radius-full);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  box-shadow: var(--ghibli-shadow-sm);
  transition: all 0.3s ease;
}

.platform-badge:hover {
  transform: translateY(-2px);
  box-shadow: var(--ghibli-shadow);
}

.platform-badge.discord {
  background: #5865F2;
  color: white;
}

.platform-badge.huggingface {
  background: #FFD21E;
  color: #333;
}

.platform-badge.telegram {
  background: #0088cc;
  color: white;
}

.file-size {
  font-size: 12px;
  color: var(--ghibli-text);
  opacity: 0.7;
}

.file-date {
  font-size: 12px;
  color: var(--ghibli-text);
  opacity: 0.7;
}

.file-actions {
  display: flex;
  border-top: 1px solid rgba(124, 185, 168, 0.2);
  margin-top: 16px;
  padding-top: 16px;
}

.action-button {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  margin: 0 4px;
  border-radius: var(--ghibli-radius-md);
}

.action-button.copy {
  margin-right: 8px;
  color: var(--ghibli-primary);
}

.action-button.copy:hover {
  background: rgba(124, 185, 168, 0.1);
  transform: translateY(-2px);
}

.action-button.delete {
  margin-left: 8px;
  color: var(--ghibli-text);
}

.action-button.delete:hover {
  background: rgba(255, 100, 100, 0.1);
  transform: translateY(-2px);
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.preview-content {
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  position: relative;
  background: var(--ghibli-light);
  border-radius: var(--ghibli-radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--ghibli-text);
  border: none;
  font-size: 24px;
  cursor: pointer;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: var(--ghibli-shadow);
}

.close-button:hover {
  background: var(--ghibli-light);
  transform: scale(1.1);
  box-shadow: var(--ghibli-shadow);
}

.preview-content img {
  max-width: 100%;
  max-height: 70vh;
  display: block;
  margin: 0 auto;
  border-radius: var(--ghibli-radius-md);
}

.file-icon-large {
  width: 200px;
  height: 200px;
  background: var(--ghibli-gradient-primary);
  color: white;
  border-radius: var(--ghibli-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  margin: 40px auto;
  box-shadow: var(--ghibli-shadow);
}

.preview-info {
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(124, 185, 168, 0.2);
}

.preview-info p {
  margin: 12px 0;
  color: var(--ghibli-text);
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--ghibli-radius-lg);
  box-shadow: var(--ghibli-shadow);
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
}

.pagination-button {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  border-radius: var(--ghibli-radius-md);
}

.pagination-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--ghibli-shadow);
}

.pagination-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 页码按钮 */
.pagination-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-number {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: var(--ghibli-radius-md);
  min-width: 36px;
  text-align: center;
}

.pagination-number:hover {
  transform: translateY(-2px);
  box-shadow: var(--ghibli-shadow);
}

.pagination-number.active {
  background: var(--ghibli-gradient-primary);
  color: var(--ghibli-light);
  transform: translateY(-2px);
  box-shadow: var(--ghibli-shadow);
}

/* 页面输入 */
.pagination-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-input {
  width: 80px;
  padding: 8px 12px;
  font-size: 13px;
  text-align: center;
}

.page-go-button {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: var(--ghibli-radius-md);
}

.page-go-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--ghibli-shadow);
}

/* 省略号样式 */
.pagination-number:disabled {
  background: transparent;
  color: var(--ghibli-text);
  opacity: 0.7;
  cursor: default;
  transform: none;
  box-shadow: none;
}

.pagination-number:disabled:hover {
  transform: none;
  box-shadow: none;
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
  
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
  
  .file-card {
    margin-bottom: 0;
  }
  
  .file-info {
    padding: 16px;
  }
  
  .file-name {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .file-meta {
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .platform-badge {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .action-button {
    padding: 10px;
    font-size: 13px;
  }
  
  .preview-content {
    max-width: 95%;
    max-height: 95%;
  }
  
  .file-icon-large {
    width: 160px;
    height: 160px;
    font-size: 36px;
    margin: 32px auto;
  }
  
  .preview-info {
    padding: 20px;
  }
  
  .pagination {
    padding: 20px;
    gap: 12px;
  }
  
  .pagination-button {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .pagination-info {
    padding: 8px 16px;
    min-width: 70px;
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
  
  .file-count {
    font-size: 14px;
  }
  
  .loading,
  .empty {
    padding: 40px 16px;
    margin: 16px 0;
  }
  
  .upload-link {
    padding: 10px 20px;
    font-size: 14px;
    margin-top: 12px;
  }
  
  .files-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin: 16px 0;
  }
  
  .file-preview {
    height: 180px;
  }
  
  .file-icon {
    width: 64px;
    height: 64px;
    font-size: 20px;
  }
  
  .file-info {
    padding: 12px;
  }
  
  .file-name {
    font-size: 13px;
  }
  
  .action-button {
    padding: 8px;
    font-size: 12px;
  }
  
  .preview-modal {
    padding: 16px;
  }
  
  .file-icon-large {
    width: 120px;
    height: 120px;
    font-size: 28px;
    margin: 24px auto;
  }
  
  .preview-info {
    padding: 16px;
  }
  
  .preview-info p {
    margin: 8px 0;
    font-size: 13px;
  }
  
  .pagination {
    padding: 16px;
    gap: 8px;
  }
  
  .pagination-button {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .pagination-info {
    padding: 6px 12px;
    min-width: 60px;
    font-size: 12px;
  }
}
</style>
