import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入ElementPlus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 引入全局样式
import './styles/index.css'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(router)
app.use(store)
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

// 初始化与后端通信
if (window.phpEnvManager) {
  // 通知后端应用已就绪
  window.phpEnvManager.system.appReady()
  
  // 开发环境下打印可用的后端API
  if (process.env.NODE_ENV === 'development') {
    console.log('可用的后端API:', window.phpEnvManager)
  }
} 