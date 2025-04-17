import { defineConfig } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  main: {
    // 主进程配置
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'main.js')
        }
      }
    }
  },
  preload: {
    // 预加载脚本配置
    build: {
      rollupOptions: {
        input: {
          preload: resolve(__dirname, 'preload.js')
        }
      }
    }
  },
  renderer: {
    // 渲染进程配置
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    plugins: [vue()],
    root: '.',
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        }
      }
    },
    server: {
      port: 5173,
      strictPort: false
    }
  }
}); 