import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

// 获取当前文件所在目录
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 从父目录的 .env 文件中读取服务器端口
 * @returns {number} 服务器端口号，默认 3000
 */
function getServerPort() {
  try {
    const envPath = resolve(__dirname, '../.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^PORT=(\d+)/m);
    return match ? parseInt(match[1], 10) : 3000;
  } catch {
    return 3000;
  }
}

const serverPort = getServerPort();

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${serverPort}`,
        changeOrigin: true
      },
      '/file': {
        target: `http://localhost:${serverPort}`,
        changeOrigin: true
      }
    }
  }
});
