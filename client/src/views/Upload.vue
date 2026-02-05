<template>
  <div class="upload-page">
    <Navbar />
    
    <div class="container">
      <h1>上传文件</h1>
      
      <div class="upload-section ghibli-card">
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
          </div>
        </div>
        
        <div v-if="selectedFile" class="file-info">
          <div class="file-details">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <button @click="clearFile" class="ghibli-button ghibli-button-secondary clear-button">清除</button>
        </div>
        
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
          </div>
        </div>
        
        <button 
          @click="handleUpload" 
          :disabled="!selectedFile || !selectedPlatform || uploading"
          class="ghibli-button ghibli-button-primary upload-button"
        >
          {{ uploading ? '上传中...' : '上传' }}
        </button>
        
        <div v-if="uploadError" class="ghibli-error">
          {{ uploadError }}
        </div>
        
        <div v-if="uploadSuccess" class="ghibli-success">
          <h3>上传成功!</h3>
          <div class="result-info">
            <p><strong>文件 ID:</strong> {{ uploadResult.fileId }}</p>
            <p><strong>平台:</strong> {{ uploadResult.platform }}</p>
            <p><strong>访问地址:</strong></p>
            <div class="url-box">
              <input :value="uploadResult.accessUrl" readonly class="ghibli-input" />
              <button @click="copyUrl" class="ghibli-button ghibli-button-primary copy-button">复制</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Navbar from '@/components/Navbar.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const isDragOver = ref(false);
const selectedFile = ref(null);
const selectedPlatform = ref('discord');
const uploading = ref(false);
const uploadError = ref('');
const uploadSuccess = ref(false);
const uploadResult = ref(null);

function handleDrop(e) {
  isDragOver.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    selectedFile.value = files[0];
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    selectedFile.value = files[0];
  }
}

function clearFile() {
  selectedFile.value = null;
  uploadSuccess.value = false;
  uploadResult.value = null;
  uploadError.value = '';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function handleUpload() {
  if (!selectedFile.value || !selectedPlatform.value) {
    return;
  }
  
  uploading.value = true;
  uploadError.value = '';
  uploadSuccess.value = false;
  
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('platform', selectedPlatform.value);
  
  try {
    const response = await axios.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    uploadSuccess.value = true;
    uploadResult.value = response.data;
  } catch (error) {
    uploadError.value = error.response?.data?.error || error.message || '上传失败';
  }
  
  uploading.value = false;
}

function copyUrl() {
  const url = uploadResult.value.accessUrl;
  
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

.select-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(124, 185, 168, 0.1);
  border-radius: var(--ghibli-radius-md);
  margin-top: 24px;
  border: 1px solid rgba(124, 185, 168, 0.2);
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 600;
  color: var(--ghibli-text);
}

.file-size {
  font-size: 12px;
  color: var(--ghibli-text);
  opacity: 0.7;
}

.clear-button {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

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

.upload-button {
  width: 100%;
  padding: 16px;
  margin-top: 24px;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.success-message {
  padding: 24px;
  border-radius: var(--ghibli-radius-md);
  margin-top: 24px;
  position: relative;
  overflow: hidden;
}

.success-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(100, 255, 100, 0.1) 0%, transparent 70%);
  z-index: 0;
}

.success-message h3 {
  margin-bottom: 16px;
  color: var(--ghibli-text);
  position: relative;
  z-index: 1;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.result-info p {
  margin: 0;
  color: var(--ghibli-text);
}

.url-box {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  position: relative;
  z-index: 1;
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
}

.copy-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--ghibli-shadow);
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
  
  .success-message {
    padding: 20px;
  }
  
  .success-message h3 {
    font-size: 18px;
    margin-bottom: 12px;
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
  
  .file-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }
  
  .clear-button {
    width: 100%;
    padding: 8px;
    font-size: 13px;
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
</style>
