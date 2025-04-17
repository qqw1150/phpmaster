// Electron预加载脚本
// 用于安全地暴露API给渲染进程

const { contextBridge, ipcRenderer } = require('electron');

// 暴露API给渲染进程
contextBridge.exposeInMainWorld('phpEnvManager', {
  // 服务管理API
  services: {
    /**
     * 获取所有服务
     * @returns {Promise<Object>} 服务列表响应
     */
    getAll: () => ipcRenderer.invoke('get-all-services'),
    
    /**
     * 启动服务
     * @param {string} serviceId 服务ID
     * @returns {Promise<Object>} 操作结果
     */
    start: (serviceId) => ipcRenderer.invoke('service-operation', {
      operation: 'start',
      serviceId
    }),
    
    /**
     * 停止服务
     * @param {string} serviceId 服务ID
     * @returns {Promise<Object>} 操作结果
     */
    stop: (serviceId) => ipcRenderer.invoke('service-operation', {
      operation: 'stop',
      serviceId
    }),
    
    /**
     * 重启服务
     * @param {string} serviceId 服务ID
     * @returns {Promise<Object>} 操作结果
     */
    restart: (serviceId) => ipcRenderer.invoke('service-operation', {
      operation: 'restart',
      serviceId
    }),
    
    /**
     * 获取服务配置
     * @param {string} serviceId 服务ID
     * @returns {Promise<Object>} 服务配置
     */
    getConfig: (serviceId) => ipcRenderer.invoke('get-service-config', serviceId),
    
    /**
     * 更新服务配置
     * @param {string} serviceId 服务ID
     * @param {Object} config 配置对象
     * @returns {Promise<Object>} 操作结果
     */
    updateConfig: (serviceId, config) => ipcRenderer.invoke('update-config', {
      serviceId,
      config
    })
  },
  
  // 站点管理API
  sites: {
    /**
     * 获取所有站点
     * @returns {Promise<Object>} 站点列表响应
     */
    getAll: () => ipcRenderer.invoke('get-all-sites'),
    
    /**
     * 创建站点
     * @param {Object} siteData 站点数据
     * @returns {Promise<Object>} 操作结果
     */
    create: (siteData) => ipcRenderer.invoke('create-site', siteData),
    
    /**
     * 更新站点
     * @param {string} siteId 站点ID
     * @param {Object} siteData 站点数据
     * @returns {Promise<Object>} 操作结果
     */
    update: (siteId, siteData) => ipcRenderer.invoke('update-site', {
      siteId,
      siteData
    }),
    
    /**
     * 删除站点
     * @param {string} siteId 站点ID
     * @returns {Promise<Object>} 操作结果
     */
    delete: (siteId) => ipcRenderer.invoke('delete-site', siteId)
  },
  
  // PHP管理API
  php: {
    /**
     * 获取所有PHP版本
     * @returns {Promise<Object>} PHP版本列表响应
     */
    getAllVersions: () => ipcRenderer.invoke('get-php-versions'),
    
    /**
     * 安装PHP版本
     * @param {string} version 版本号
     * @returns {Promise<Object>} 操作结果
     */
    installVersion: (version) => ipcRenderer.invoke('install-php-version', version),
    
    /**
     * 卸载PHP版本
     * @param {string} version 版本号
     * @returns {Promise<Object>} 操作结果
     */
    uninstallVersion: (version) => ipcRenderer.invoke('uninstall-php-version', version),
    
    /**
     * 设置默认PHP版本
     * @param {string} version 版本号
     * @returns {Promise<Object>} 操作结果
     */
    setDefaultVersion: (version) => ipcRenderer.invoke('set-default-php-version', version),
    
    /**
     * 获取PHP扩展
     * @param {string} version PHP版本
     * @returns {Promise<Object>} 扩展列表响应
     */
    getExtensions: (version) => ipcRenderer.invoke('get-php-extensions', version),
    
    /**
     * 启用PHP扩展
     * @param {string} version PHP版本
     * @param {string} extension 扩展名
     * @returns {Promise<Object>} 操作结果
     */
    enableExtension: (version, extension) => ipcRenderer.invoke('enable-php-extension', {
      version,
      extension
    }),
    
    /**
     * 禁用PHP扩展
     * @param {string} version PHP版本
     * @param {string} extension 扩展名
     * @returns {Promise<Object>} 操作结果
     */
    disableExtension: (version, extension) => ipcRenderer.invoke('disable-php-extension', {
      version,
      extension
    })
  },
  
  // 数据库管理API
  database: {
    /**
     * 获取所有数据库
     * @returns {Promise<Object>} 数据库列表响应
     */
    getAll: () => ipcRenderer.invoke('get-all-databases'),
    
    /**
     * 创建数据库
     * @param {Object} databaseData 数据库数据
     * @returns {Promise<Object>} 操作结果
     */
    create: (databaseData) => ipcRenderer.invoke('database-operation', {
      operation: 'create',
      data: databaseData
    }),
    
    /**
     * 删除数据库
     * @param {string} databaseName 数据库名
     * @returns {Promise<Object>} 操作结果
     */
    delete: (databaseName) => ipcRenderer.invoke('database-operation', {
      operation: 'delete',
      data: { name: databaseName }
    }),
    
    /**
     * 获取所有数据库用户
     * @returns {Promise<Object>} 用户列表响应
     */
    getAllUsers: () => ipcRenderer.invoke('get-database-users'),
    
    /**
     * 创建数据库用户
     * @param {Object} userData 用户数据
     * @returns {Promise<Object>} 操作结果
     */
    createUser: (userData) => ipcRenderer.invoke('database-user-operation', {
      operation: 'create',
      data: userData
    }),
    
    /**
     * 更新数据库用户
     * @param {string} username 用户名
     * @param {Object} userData 用户数据
     * @returns {Promise<Object>} 操作结果
     */
    updateUser: (username, userData) => ipcRenderer.invoke('database-user-operation', {
      operation: 'update',
      username,
      data: userData
    }),
    
    /**
     * 删除数据库用户
     * @param {string} username 用户名
     * @returns {Promise<Object>} 操作结果
     */
    deleteUser: (username) => ipcRenderer.invoke('database-user-operation', {
      operation: 'delete',
      username
    })
  },
  
  // 系统API
  system: {
    /**
     * 获取系统状态
     * @returns {Promise<Object>} 系统状态响应
     */
    getStatus: () => ipcRenderer.invoke('get-system-status'),
    
    /**
     * 获取服务日志
     * @param {string} serviceId 服务ID
     * @param {number} lines 行数
     * @param {string} filter 过滤器
     * @returns {Promise<Object>} 日志响应
     */
    getLogs: (serviceId, lines = 100, filter = '') => ipcRenderer.invoke('get-service-logs', {
      serviceId,
      lines,
      filter
    })
  },
  
  // 事件监听API
  events: {
    /**
     * 监听后端服务终止事件
     * @param {Function} callback 回调函数
     */
    onBackendTerminated: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('backend-terminated', listener);
      return () => ipcRenderer.removeListener('backend-terminated', listener);
    },
    
    /**
     * 监听服务状态更新事件
     * @param {Function} callback 回调函数
     */
    onServiceStatusUpdate: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('service-status-update', listener);
      return () => ipcRenderer.removeListener('service-status-update', listener);
    },
    
    /**
     * 监听系统状态更新事件
     * @param {Function} callback 回调函数
     */
    onSystemStatusUpdate: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('system-status-update', listener);
      return () => ipcRenderer.removeListener('system-status-update', listener);
    }
  }
}); 