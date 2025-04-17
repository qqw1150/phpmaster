import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/index.css'
import './assets/base.css'

// 引入ElementPlus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(router)
app.use(createPinia())
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default'
})

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err, info)
  // 可以在此添加错误上报逻辑
}

// 全局属性
app.config.globalProperties.$isDev = process.env.NODE_ENV === 'development'

// 挂载应用
app.mount('#app')

// 确定运行环境
const isElectron = window?.phpEnvManager && typeof window?.phpEnvManager?.system?.appReady === 'function';
console.log(`应用运行环境: ${isElectron ? 'Electron' : '浏览器'}`);

// 初始化应用
try {
  if (isElectron) {
    // Electron环境
    window.phpEnvManager.system.appReady()
      .then(response => {
        if (response && response.success) {
          console.log('后端服务初始化成功');
        } else {
          console.warn('后端服务初始化可能存在问题:', response);
        }
      })
      .catch(error => {
        console.error('后端服务初始化失败:', error);
      });
  } else {
    // 浏览器环境
    console.log('在浏览器环境中运行，使用模拟后端');
  }
} catch (error) {
  console.error('应用初始化过程中出现错误:', error);
} 