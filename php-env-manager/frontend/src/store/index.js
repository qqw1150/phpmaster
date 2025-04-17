import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

// 模块导入
import services from './modules/services'
import sites from './modules/sites'
import php from './modules/php'
import database from './modules/database'
import settings from './modules/settings'
import system from './modules/system'

// 创建状态存储
const store = createStore({
  // 启用严格模式以检测不规范的状态变更
  strict: process.env.NODE_ENV !== 'production',
  
  // 根状态
  state: {
    loading: false,
    // 全局加载状态
    notifications: [],
    // 全局通知消息队列
    serverStatus: {
      connected: false,
      lastChecked: null
    }
  },
  
  // 获取状态的计算属性
  getters: {
    isLoading: state => state.loading,
    notifications: state => state.notifications,
    isServerConnected: state => state.serverStatus.connected,
    serverLastChecked: state => state.serverStatus.lastChecked
  },
  
  // 同步修改状态的方法
  mutations: {
    // 设置加载状态
    SET_LOADING(state, status) {
      state.loading = status
    },
    
    // 添加通知
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        id: Date.now(),
        read: false,
        timestamp: new Date(),
        ...notification
      })
    },
    
    // 标记通知为已读
    MARK_NOTIFICATION_READ(state, id) {
      const index = state.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        state.notifications[index].read = true
      }
    },
    
    // 移除通知
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id)
    },
    
    // 更新服务器连接状态
    UPDATE_SERVER_STATUS(state, status) {
      state.serverStatus = {
        ...state.serverStatus,
        ...status,
        lastChecked: new Date()
      }
    }
  },
  
  // 异步操作
  actions: {
    // 显示加载状态
    startLoading({ commit }) {
      commit('SET_LOADING', true)
    },
    
    // 隐藏加载状态
    stopLoading({ commit }) {
      commit('SET_LOADING', false)
    },
    
    // 添加通知
    notify({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
      
      // 如果设置了自动消失时间，则自动移除通知
      if (notification.duration) {
        setTimeout(() => {
          commit('REMOVE_NOTIFICATION', notification.id)
        }, notification.duration)
      }
    },
    
    // 检查服务器连接状态
    async checkServerConnection({ commit }) {
      try {
        // 这里应该是实际检查服务器连接的API调用
        // const response = await api.checkConnection()
        commit('UPDATE_SERVER_STATUS', { connected: true })
        return true
      } catch (error) {
        commit('UPDATE_SERVER_STATUS', { connected: false })
        return false
      }
    }
  },
  
  // 模块化的状态管理
  modules: {
    services,
    sites,
    php,
    database,
    settings,
    system
  },
  
  // 插件配置
  plugins: [
    // 状态持久化插件配置
    createPersistedState({
      key: 'php-env-manager',
      paths: ['settings', 'system.darkMode']
    })
  ]
})

export default store 