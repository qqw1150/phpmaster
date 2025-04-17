// 站点管理模块
// 用于存储和管理PHP站点的状态

const state = {
  // 所有站点列表
  sites: [],
  // 当前选中的站点
  currentSite: null,
  // 加载状态
  loading: false,
  // 错误信息
  error: null
}

const getters = {
  // 获取所有站点
  allSites: state => state.sites,
  
  // 获取当前选中的站点
  currentSite: state => state.currentSite,
  
  // 获取站点数量
  siteCount: state => state.sites.length,
  
  // 获取特定站点
  getSiteById: state => (id) => {
    return state.sites.find(site => site.id === id)
  },
  
  // 根据状态筛选站点
  getSitesByStatus: state => (status) => {
    return state.sites.filter(site => site.status === status)
  },
  
  // 检查是否正在加载
  isLoading: state => state.loading,
  
  // 获取错误信息
  getError: state => state.error
}

const mutations = {
  // 设置所有站点
  SET_SITES(state, sites) {
    state.sites = sites
  },
  
  // 设置当前选中的站点
  SET_CURRENT_SITE(state, site) {
    state.currentSite = site
  },
  
  // 添加新站点
  ADD_SITE(state, site) {
    state.sites.push(site)
  },
  
  // 更新站点信息
  UPDATE_SITE(state, updatedSite) {
    const index = state.sites.findIndex(site => site.id === updatedSite.id)
    if (index !== -1) {
      state.sites.splice(index, 1, updatedSite)
    }
  },
  
  // 删除站点
  REMOVE_SITE(state, siteId) {
    state.sites = state.sites.filter(site => site.id !== siteId)
    if (state.currentSite && state.currentSite.id === siteId) {
      state.currentSite = null
    }
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
  // 获取所有站点
  async fetchSites({ commit }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是实际的API调用
      // const response = await api.getSites()
      // commit('SET_SITES', response.data)
      
      // 模拟数据
      const mockSites = [
        { 
          id: '1', 
          name: '测试站点1', 
          domain: 'test1.local', 
          path: '/var/www/test1',
          phpVersion: '8.1',
          status: 'running',
          created: new Date('2023-01-01'),
          lastModified: new Date('2023-01-10')
        },
        { 
          id: '2', 
          name: '测试站点2', 
          domain: 'test2.local', 
          path: '/var/www/test2',
          phpVersion: '7.4',
          status: 'stopped',
          created: new Date('2023-02-05'),
          lastModified: new Date('2023-02-15')
        }
      ]
      
      commit('SET_SITES', mockSites)
      return mockSites
    } catch (error) {
      commit('SET_ERROR', '获取站点列表失败')
      console.error('获取站点失败:', error)
      return []
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取单个站点详情
  async fetchSiteDetails({ commit, state }, siteId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 检查是否已经有缓存的站点信息
      const existingSite = state.sites.find(site => site.id === siteId)
      if (existingSite) {
        commit('SET_CURRENT_SITE', existingSite)
        return existingSite
      }
      
      // 这里应该是实际的API调用
      // const response = await api.getSiteDetails(siteId)
      // const siteDetails = response.data
      
      // 模拟数据
      const mockSiteDetails = { 
        id: siteId, 
        name: `测试站点${siteId}`, 
        domain: `test${siteId}.local`, 
        path: `/var/www/test${siteId}`,
        phpVersion: '8.1',
        status: 'running',
        created: new Date(),
        lastModified: new Date(),
        // 额外的详细信息
        config: {
          documentRoot: `/var/www/test${siteId}/public`,
          errorLog: `/var/www/test${siteId}/logs/error.log`,
          accessLog: `/var/www/test${siteId}/logs/access.log`,
          serverAdmin: 'admin@example.com'
        }
      }
      
      commit('SET_CURRENT_SITE', mockSiteDetails)
      
      // 更新站点列表中的信息
      if (!existingSite) {
        commit('ADD_SITE', mockSiteDetails)
      } else {
        commit('UPDATE_SITE', mockSiteDetails)
      }
      
      return mockSiteDetails
    } catch (error) {
      commit('SET_ERROR', `获取站点详情失败: ${error.message || '未知错误'}`)
      console.error('获取站点详情失败:', error)
      return null
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 创建新站点
  async createSite({ commit }, siteData) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是实际的API调用
      // const response = await api.createSite(siteData)
      // const newSite = response.data
      
      // 模拟创建新站点
      const newSite = {
        id: Date.now().toString(),
        ...siteData,
        status: 'stopped', // 默认为停止状态
        created: new Date(),
        lastModified: new Date()
      }
      
      commit('ADD_SITE', newSite)
      return newSite
    } catch (error) {
      commit('SET_ERROR', `创建站点失败: ${error.message || '未知错误'}`)
      console.error('创建站点失败:', error)
      return null
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新站点信息
  async updateSite({ commit, state }, { siteId, siteData }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 检查站点是否存在
      const existingSite = state.sites.find(site => site.id === siteId)
      if (!existingSite) {
        throw new Error('站点不存在')
      }
      
      // 这里应该是实际的API调用
      // const response = await api.updateSite(siteId, siteData)
      // const updatedSite = response.data
      
      // 模拟更新站点
      const updatedSite = {
        ...existingSite,
        ...siteData,
        lastModified: new Date()
      }
      
      commit('UPDATE_SITE', updatedSite)
      
      // 如果当前选中的站点就是被更新的站点，更新currentSite
      if (state.currentSite && state.currentSite.id === siteId) {
        commit('SET_CURRENT_SITE', updatedSite)
      }
      
      return updatedSite
    } catch (error) {
      commit('SET_ERROR', `更新站点失败: ${error.message || '未知错误'}`)
      console.error('更新站点失败:', error)
      return null
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 删除站点
  async deleteSite({ commit }, siteId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是实际的API调用
      // await api.deleteSite(siteId)
      
      commit('REMOVE_SITE', siteId)
      return true
    } catch (error) {
      commit('SET_ERROR', `删除站点失败: ${error.message || '未知错误'}`)
      console.error('删除站点失败:', error)
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 启用站点
  async enableSite({ commit, state }, siteId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 检查站点是否存在
      const existingSite = state.sites.find(site => site.id === siteId)
      if (!existingSite) {
        throw new Error('站点不存在')
      }
      
      // 这里应该是实际的API调用
      // await api.enableSite(siteId)
      
      // 更新站点状态
      const updatedSite = {
        ...existingSite,
        status: 'running',
        lastModified: new Date()
      }
      
      commit('UPDATE_SITE', updatedSite)
      
      // 如果当前选中的站点就是被更新的站点，更新currentSite
      if (state.currentSite && state.currentSite.id === siteId) {
        commit('SET_CURRENT_SITE', updatedSite)
      }
      
      return true
    } catch (error) {
      commit('SET_ERROR', `启用站点失败: ${error.message || '未知错误'}`)
      console.error('启用站点失败:', error)
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 禁用站点
  async disableSite({ commit, state }, siteId) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 检查站点是否存在
      const existingSite = state.sites.find(site => site.id === siteId)
      if (!existingSite) {
        throw new Error('站点不存在')
      }
      
      // 这里应该是实际的API调用
      // await api.disableSite(siteId)
      
      // 更新站点状态
      const updatedSite = {
        ...existingSite,
        status: 'stopped',
        lastModified: new Date()
      }
      
      commit('UPDATE_SITE', updatedSite)
      
      // 如果当前选中的站点就是被更新的站点，更新currentSite
      if (state.currentSite && state.currentSite.id === siteId) {
        commit('SET_CURRENT_SITE', updatedSite)
      }
      
      return true
    } catch (error) {
      commit('SET_ERROR', `禁用站点失败: ${error.message || '未知错误'}`)
      console.error('禁用站点失败:', error)
      return false
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