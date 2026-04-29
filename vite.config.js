import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      // 所有以 /admin 开头的请求，都会自动转发到后端
      '/admin': {
        target: 'http://127.0.0.1:8090', // 后端地址
        changeOrigin: true, // 允许跨域
      }
    }
  }
})
