// PHP版本管理模块
// 用于存储和管理PHP版本的状态

const state = {
  // 所有PHP版本列表
  versions: [],
  // 当前选中的PHP版本
  currentVersion: null,
  // 默认PHP版本
  defaultVersion: null,
  // 安装状态
  installStatus: {}, // 格式: { '7.4': 'installing', '8.1': 'installed' }
  // 加载状态
  loading: false,
  // 错误信息
  error: null
}

const getters = {
  // 获取所有PHP版本
  allVersions: state => state.versions,
  
  // 获取当前选中的PHP版本
  currentVersion: state => state.currentVersion,
  
  // 获取默认PHP版本
  defaultVersion: state => state.defaultVersion,
  
  // 获取已安装的PHP版本
  installedVersions: state => {
    return state.versions.filter(version => 
      state.installStatus[version.version] === 'installed')
  },
  
  // 获取正在安装的PHP版本
  installingVersions: state => {
    return state.versions.filter(version => 
      state.installStatus[version.version] === 'installing')
  },
  
  // 获取PHP版本数量
  versionCount: state => state.versions.length,
  
  // 获取已安装版本数量
  installedCount: (state, getters) => getters.installedVersions.length,
  
  // 检查特定版本是否已安装
  isVersionInstalled: state => (version) => {
    return state.installStatus[version] === 'installed'
  },
  
  // 检查特定版本是否正在安装
  isVersionInstalling: state => (version) => {
    return state.installStatus[version] === 'installing'
  },
  
  // 检查是否正在加载
  isLoading: state => state.loading,
  
  // 获取错误信息
  getError: state => state.error
}

const mutations = {
  // 设置所有PHP版本
  SET_VERSIONS(state, versions) {
    state.versions = versions
  },
  
  // 设置当前选中的PHP版本
  SET_CURRENT_VERSION(state, version) {
    state.currentVersion = version
  },
  
  // 设置默认PHP版本
  SET_DEFAULT_VERSION(state, version) {
    state.defaultVersion = version
  },
  
  // 添加新PHP版本
  ADD_VERSION(state, version) {
    if (!state.versions.some(v => v.version === version.version)) {
      state.versions.push(version)
    }
  },
  
  // 更新PHP版本信息
  UPDATE_VERSION(state, updatedVersion) {
    const index = state.versions.findIndex(v => v.version === updatedVersion.version)
    if (index !== -1) {
      state.versions.splice(index, 1, updatedVersion)
    }
  },
  
  // 删除PHP版本
  REMOVE_VERSION(state, versionNumber) {
    state.versions = state.versions.filter(v => v.version !== versionNumber)
    
    // 如果当前选中的版本被删除，重置当前版本
    if (state.currentVersion && state.currentVersion.version === versionNumber) {
      state.currentVersion = null
    }
    
    // 如果默认版本被删除，重置默认版本
    if (state.defaultVersion && state.defaultVersion.version === versionNumber) {
      state.defaultVersion = null
    }
    
    // 删除安装状态
    if (state.installStatus[versionNumber]) {
      const newStatus = { ...state.installStatus }
      delete newStatus[versionNumber]
      state.installStatus = newStatus
    }
  },
  
  // 设置PHP版本安装状态
  SET_INSTALL_STATUS(state, { version, status }) {
    state.installStatus = {
      ...state.installStatus,
      [version]: status
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
  // 获取所有PHP版本
  async fetchVersions({ commit }) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 这里应该是实际的API调用
      // const response = await api.getPhpVersions()
      // commit('SET_VERSIONS', response.data)
      
      // 模拟数据
      const mockVersions = [
        { 
          version: '5.6', 
          name: 'PHP 5.6',
          releaseDate: new Date('2014-08-28'),
          eolDate: new Date('2018-12-31'),
          description: 'Legacy version with widespread compatibility'
        },
        { 
          version: '7.0', 
          name: 'PHP 7.0',
          releaseDate: new Date('2015-12-03'),
          eolDate: new Date('2019-01-10'),
          description: 'First version in the 7.x series with significant performance improvements'
        },
        { 
          version: '7.4', 
          name: 'PHP 7.4',
          releaseDate: new Date('2019-11-28'),
          eolDate: new Date('2022-11-28'),
          description: 'Final version in the 7.x series with typed properties and arrow functions'
        },
        { 
          version: '8.0', 
          name: 'PHP 8.0',
          releaseDate: new Date('2020-11-26'),
          eolDate: new Date('2023-11-26'),
          description: 'Major version with JIT compilation and union types'
        },
        { 
          version: '8.1', 
          name: 'PHP 8.1',
          releaseDate: new Date('2021-11-25'),
          eolDate: new Date('2024-11-25'),
          description: 'Enumerations, readonly properties, and first-class callable syntax'
        },
        { 
          version: '8.2', 
          name: 'PHP 8.2',
          releaseDate: new Date('2022-12-08'),
          eolDate: new Date('2025-12-08'),
          description: 'Readonly classes, null, false, and true as standalone types'
        }
      ]
      
      // 模拟安装状态
      const mockInstallStatus = {
        '7.4': 'installed',
        '8.0': 'installed',
        '8.1': 'installed'
      }
      
      // 模拟默认版本
      const defaultVersion = mockVersions.find(v => v.version === '8.1')
      
      commit('SET_VERSIONS', mockVersions)
      mockVersions.forEach(version => {
        if (mockInstallStatus[version.version]) {
          commit('SET_INSTALL_STATUS', { 
            version: version.version, 
            status: mockInstallStatus[version.version] 
          })
        }
      })
      
      commit('SET_DEFAULT_VERSION', defaultVersion)
      
      return mockVersions
    } catch (error) {
      commit('SET_ERROR', '获取PHP版本列表失败')
      console.error('获取PHP版本失败:', error)
      return []
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 安装PHP版本
  async installVersion({ commit, state }, versionNumber) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 检查版本是否已安装
      if (state.installStatus[versionNumber] === 'installed') {
        return { success: true, message: '该PHP版本已安装' }
      }
      
      // 检查版本是否存在
      const versionExists = state.versions.some(v => v.version === versionNumber)
      if (!versionExists) {
        throw new Error('版本不存在')
      }
      
      // 设置安装中状态
      commit('SET_INSTALL_STATUS', { version: versionNumber, status: 'installing' })
      
      // 这里应该是实际的API调用
      // await api.installPhpVersion(versionNumber)
      
      // 模拟安装过程
      // 在实际应用中，这里应该会有一个轮询机制来检查安装进度
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 安装完成，更新状态
      commit('SET_INSTALL_STATUS', { version: versionNumber, status: 'installed' })
      
      return { success: true, message: `PHP ${versionNumber} 安装成功` }
    } catch (error) {
      commit('SET_ERROR', `安装PHP版本失败: ${error.message || '未知错误'}`)
      // 重置安装状态
      commit('SET_INSTALL_STATUS', { version: versionNumber, status: 'not_installed' })
      console.error('安装PHP版本失败:', error)
      return { success: false, message: error.message || '安装失败' }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 卸载PHP版本
  async uninstallVersion({ commit, state }, versionNumber) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 检查版本是否已安装
      if (state.installStatus[versionNumber] !== 'installed') {
        return { success: false, message: '该PHP版本未安装' }
      }
      
      // 检查是否为默认版本
      if (state.defaultVersion && state.defaultVersion.version === versionNumber) {
        return { success: false, message: '不能卸载默认PHP版本' }
      }
      
      // 这里应该是实际的API调用
      // await api.uninstallPhpVersion(versionNumber)
      
      // 模拟卸载过程
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 卸载完成，更新状态
      commit('SET_INSTALL_STATUS', { version: versionNumber, status: 'not_installed' })
      
      return { success: true, message: `PHP ${versionNumber} 卸载成功` }
    } catch (error) {
      commit('SET_ERROR', `卸载PHP版本失败: ${error.message || '未知错误'}`)
      console.error('卸载PHP版本失败:', error)
      return { success: false, message: error.message || '卸载失败' }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 设置默认PHP版本
  async setDefaultVersion({ commit, state }, versionNumber) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 检查版本是否已安装
      if (state.installStatus[versionNumber] !== 'installed') {
        return { success: false, message: '该PHP版本未安装，无法设为默认版本' }
      }
      
      // 检查是否已经是默认版本
      if (state.defaultVersion && state.defaultVersion.version === versionNumber) {
        return { success: true, message: '该版本已经是默认PHP版本' }
      }
      
      // 这里应该是实际的API调用
      // await api.setDefaultPhpVersion(versionNumber)
      
      // 更新默认版本
      const version = state.versions.find(v => v.version === versionNumber)
      if (version) {
        commit('SET_DEFAULT_VERSION', version)
        return { success: true, message: `PHP ${versionNumber} 已设置为默认版本` }
      } else {
        throw new Error('未找到指定版本')
      }
    } catch (error) {
      commit('SET_ERROR', `设置默认PHP版本失败: ${error.message || '未知错误'}`)
      console.error('设置默认PHP版本失败:', error)
      return { success: false, message: error.message || '设置默认版本失败' }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取PHP版本详细信息
  async getVersionDetails({ commit, state }, versionNumber) {
    commit('SET_LOADING', true)
    commit('CLEAR_ERROR')
    
    try {
      // 检查版本是否存在
      const existingVersion = state.versions.find(v => v.version === versionNumber)
      if (!existingVersion) {
        throw new Error('版本不存在')
      }
      
      // 设置当前版本
      commit('SET_CURRENT_VERSION', existingVersion)
      
      // 这里应该是实际的API调用获取更详细的信息
      // const response = await api.getPhpVersionDetails(versionNumber)
      // const versionDetails = response.data
      
      // 模拟详细信息
      const versionDetails = {
        ...existingVersion,
        extensions: [
          { name: 'mysqli', enabled: true },
          { name: 'pdo_mysql', enabled: true },
          { name: 'gd', enabled: true },
          { name: 'zip', enabled: true },
          { name: 'curl', enabled: true },
          { name: 'intl', enabled: true },
          { name: 'xml', enabled: true },
          { name: 'mbstring', enabled: true }
        ],
        configPath: `/etc/php/${versionNumber}/php.ini`,
        fpmConfigPath: `/etc/php/${versionNumber}/fpm/php-fpm.conf`,
        memoryLimit: '128M',
        maxExecutionTime: 30,
        maxFileUploads: 20,
        postMaxSize: '8M',
        uploadMaxFilesize: '2M'
      }
      
      // 更新版本信息
      commit('UPDATE_VERSION', { ...existingVersion, ...versionDetails })
      commit('SET_CURRENT_VERSION', { ...existingVersion, ...versionDetails })
      
      return versionDetails
    } catch (error) {
      commit('SET_ERROR', `获取PHP版本详情失败: ${error.message || '未知错误'}`)
      console.error('获取PHP版本详情失败:', error)
      return null
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