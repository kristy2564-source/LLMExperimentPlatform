import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 🔥 新增：为 api 目录添加别名
      '@api': fileURLToPath(new URL('./api', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        // 🔥 关键修改：排除工具文件和源码文件
        bypass(req, res, options) {
          const url = req.url || ''

          // 如果是请求源码文件（.ts, .js, .vue），不代理
          if (url.match(/\.(ts|js|vue|jsx|tsx)$/)) {
            return url
          }

          // 如果是请求 utils 目录下的文件，不代理
          if (url.includes('/api/utils/')) {
            return url
          }

          // 其他 /api/ 请求正常代理到后端
          return null
        },
      },
    },
  },
  preview: {
    port: 5000,
  },
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
