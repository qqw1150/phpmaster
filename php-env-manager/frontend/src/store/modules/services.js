// 服务管理模块
// 用于存储和管理Docker服务的状态

const state = {
  // 所有服务列表
  services: [],
  // 活跃服务（运行中的服务）
  activeServices: [],
  // 当前选择的服务
  currentService: null,
  // 服务日志
  logs: {},
  // 加载状态
  loading: false,
  // 错误信息
  error: null
}

const getters = {
  // 获取所有服务
  allServices: state => state.services,
  
  // 获取活跃的服务
  activeServices: state => state.activeServices,
  
  // 获取当前选中的服务
  currentService: state => state.currentService,
  
  // 获取服务日志
  serviceLog: state => (serviceId) => state.logs[serviceId] || [],
  
  // 获取服务数量
  serviceCount: state => state.services.length,
  
  // 获取活跃服务数量
  activeServiceCount: state => state.activeServices.length,
  
  // 获取指定服务的状态
  serviceStatus: state => (serviceId) => {
    const service = state.services.find(s => s.id === serviceId)
    return service ? service.status : 'unknown'
  },
  
  // 检查是否正在加载
  isLoading: state => state.loading,
  
  // 获取错误信息
  getError: state => state.error
}

const mutations = {
  // 设置所有服务
  SET_SERVICES(state, services) {
    state.services = services
  },
  
  // 更新活跃服务列表
  SET_ACTIVE_SERVICES(state, services) {
    state.activeServices = services
  },
  
  // 设置当前选中的服务
  SET_CURRENT_SERVICE(state, service) {
    state.currentService = service
  },
  
  // 添加新服务
  ADD_SERVICE(state, service) {
    state.services.push(service)
  },
  
  // 更新服务信息
  UPDATE_SERVICE(state, updatedService) {
    const index = state.services.findIndex(s => s.id === updatedService.id)
    if (index !== -1) {
      state.services.splice(index, 1, updatedService)
    }
  },
  
  // 删除服务
  REMOVE_SERVICE(state, serviceId) {
    state.services = state.services.filter(s => s.id !== serviceId)
    if (state.currentService && state.currentService.id === serviceId) {
      state.currentService = null
    }
  },
  
  // 添加服务日志
  ADD_SERVICE_LOG(state, { serviceId, log }) {
    if (!state.logs[serviceId]) {
      state.logs[serviceId] = []
    }
    state.logs[serviceId].push({
      ...log,
      timestamp: new Date()
    })
  },
  
  // 清除服务日志
  CLEAR_SERVICE_LOGS(state, serviceId) {
    state.logs[serviceId] = []
  },
  
  // 设置加载状态
  SET_LOADING(state, status) {
    state.loading = status
  },
  
  // 设置错误信息
  SET_ERROR(state, error) {
    state.error = error
  },
  
  // 清除错误信息
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  // 获取所有服务
  async fetchServices({ commit }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是实际的API调用
      // const response = await api.getServices()
      // commit('SET_SERVICES', response.data)
      
      // 模拟数据
      const mockServices = [
        { id: '1', name: 'nginx', status: 'running', type: 'web', ports: ['80:80'] },
        { id: '2', name: 'mysql', status: 'running', type: 'database', ports: ['3306:3306'] },
        { id: '3', name: 'redis', status: 'stopped', type: 'cache', ports: ['6379:6379'] }
      ]
      
      commit('SET_SERVICES', mockServices)
      commit('SET_ACTIVE_SERVICES', mockServices.filter(s => s.status === 'running'))
      
      return mockServices
    } catch (error) {
      commit('SET_ERROR', '获取服务列表失败')
      console.error('获取服务失败:', error)
      return []
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 启动服务
  async startService({ commit, state }, serviceId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是实际的API调用
      // await api.startService(serviceId)
      
      // 更新服务状态
      const service = state.services.find(s => s.id === serviceId)
      if (service) {
        const updatedService = { ...service, status: 'running' }
        commit('UPDATE_SERVICE', updatedService)
        
        // 更新活跃服务列表
        const newActiveServices = [...state.activeServices, updatedService]
        commit('SET_ACTIVE_SERVICES', newActiveServices)
        
        // 添加日志
        commit('ADD_SERVICE_LOG', {
          serviceId,
          log: { level: 'info', message: `服务 ${service.name} 已启动` }
        })
        
        return true
      }
      return false
    } catch (error) {
      commit('SET_ERROR', `启动服务失败: ${error.message || '未知错误'}`)
      commit('ADD_SERVICE_LOG', {
        serviceId,
        log: { level: 'error', message: `启动失败: ${error.message || '未知错误'}` }
      })
      console.error('启动服务失败:', error)
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 停止服务
  async stopService({ commit, state }, serviceId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是实际的API调用
      // await api.stopService(serviceId)
      
      // 更新服务状态
      const service = state.services.find(s => s.id === serviceId)
      if (service) {
        const updatedService = { ...service, status: 'stopped' }
        commit('UPDATE_SERVICE', updatedService)
        
        // 更新活跃服务列表
        const newActiveServices = state.activeServices.filter(s => s.id !== serviceId)
        commit('SET_ACTIVE_SERVICES', newActiveServices)
        
        // 添加日志
        commit('ADD_SERVICE_LOG', {
          serviceId,
          log: { level: 'info', message: `服务 ${service.name} 已停止` }
        })
        
        return true
      }
      return false
    } catch (error) {
      commit('SET_ERROR', `停止服务失败: ${error.message || '未知错误'}`)
      commit('ADD_SERVICE_LOG', {
        serviceId,
        log: { level: 'error', message: `停止失败: ${error.message || '未知错误'}` }
      })
      console.error('停止服务失败:', error)
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 重启服务
  async restartService({ dispatch, commit, state }, serviceId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是先停止服务，再启动服务
      const service = state.services.find(s => s.id === serviceId)
      if (service) {
        await dispatch('stopService', serviceId)
        await dispatch('startService', serviceId)
        
        // 添加日志
        commit('ADD_SERVICE_LOG', {
          serviceId,
          log: { level: 'info', message: `服务 ${service.name} 已重启` }
        })
        
        return true
      }
      return false
    } catch (error) {
      commit('SET_ERROR', `重启服务失败: ${error.message || '未知错误'}`)
      console.error('重启服务失败:', error)
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 创建新服务
  async createService({ commit }, serviceData) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是实际的API调用
      // const response = await api.createService(serviceData)
      // const newService = response.data
      
      // 模拟创建新服务
      const newService = {
        id: Date.now().toString(),
        ...serviceData,
        status: 'stopped'
      }
      
      commit('ADD_SERVICE', newService)
      
      // 添加日志
      commit('ADD_SERVICE_LOG', {
        serviceId: newService.id,
        log: { level: 'info', message: `服务 ${newService.name} 已创建` }
      })
      
      return newService
    } catch (error) {
      commit('SET_ERROR', `创建服务失败: ${error.message || '未知错误'}`)
      console.error('创建服务失败:', error)
      return null
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 删除服务
  async deleteService({ commit }, serviceId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是实际的API调用
      // await api.deleteService(serviceId)
      
      commit('REMOVE_SERVICE', serviceId)
      return true
    } catch (error) {
      commit('SET_ERROR', `删除服务失败: ${error.message || '未知错误'}`)
      console.error('删除服务失败:', error)
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取服务日志
  async fetchServiceLogs({ commit }, serviceId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是实际的API调用
      // const response = await api.getServiceLogs(serviceId)
      // const logs = response.data
      
      // 模拟日志数据
      const mockLogs = [
        { level: 'info', message: '服务已启动', timestamp: new Date() },
        { level: 'info', message: '服务运行正常', timestamp: new Date() }
      ]
      
      // 清除现有日志
      commit('CLEAR_SERVICE_LOGS', serviceId)
      
      // 添加新日志
      mockLogs.forEach(log => {
        commit('ADD_SERVICE_LOG', { serviceId, log })
      })
      
      return mockLogs
    } catch (error) {
      commit('SET_ERROR', `获取服务日志失败: ${error.message || '未知错误'}`)
      console.error('获取服务日志失败:', error)
      return []
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
} 