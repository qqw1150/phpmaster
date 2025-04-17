// Electron预加载脚本
// 用于安全地暴露API给渲染进程

const { contextBridge, ipcRenderer } = require('electron');

// 暴露API给渲染进程
contextBridge.exposeInMainWorld('phpEnvManager', {
  // 服务管理API
  service: {
    // 获取所有服务状态
    getServiceStatus: () => ipcRenderer.invoke('get-service-status'),
    
    // 启动服务
    startService: (serviceName) => ipcRenderer.invoke('start-service', serviceName),
    
    // 停止服务
    stopService: (serviceName) => ipcRenderer.invoke('stop-service', serviceName),
    
    // 重启服务
    restartService: (serviceName) => ipcRenderer.invoke('restart-service', serviceName),
    
    // 安装特定版本的服务
    installService: (serviceName, version) => ipcRenderer.invoke('install-service', { serviceName, version }),
    
    // 卸载特定版本的服务
    uninstallService: (serviceName, version) => ipcRenderer.invoke('uninstall-service', { serviceName, version }),
    
    // 获取服务配置
    getServiceConfig: (serviceName) => ipcRenderer.invoke('get-service-config', serviceName),
    
    // 更新服务配置
    updateServiceConfig: (serviceName, config) => ipcRenderer.invoke('update-service-config', { serviceName, config })
  },
  
  // 网站管理API
  website: {
    // 获取所有网站
    getWebsites: () => ipcRenderer.invoke('get-websites'),
    
    // 创建网站
    createWebsite: (websiteData) => ipcRenderer.invoke('create-website', websiteData),
    
    // 修改网站
    updateWebsite: (websiteId, websiteData) => ipcRenderer.invoke('update-website', { websiteId, websiteData }),
    
    // 删除网站
    deleteWebsite: (websiteId) => ipcRenderer.invoke('delete-website', websiteId)
  },
  
  // 数据库管理API
  database: {
    // 获取所有数据库
    getDatabases: () => ipcRenderer.invoke('get-databases'),
    
    // 创建数据库
    createDatabase: (dbData) => ipcRenderer.invoke('create-database', dbData),
    
    // 删除数据库
    deleteDatabase: (dbName) => ipcRenderer.invoke('delete-database', dbName)
  },
  
  // PHP管理API
  php: {
    // 获取所有PHP版本
    getVersions: () => ipcRenderer.invoke('get-php-versions'),
    
    // 安装PHP版本
    installVersion: (version) => ipcRenderer.invoke('install-php-version', version),
    
    // 卸载PHP版本
    uninstallVersion: (version) => ipcRenderer.invoke('uninstall-php-version', version),
    
    // 设置默认PHP版本
    setDefaultVersion: (version) => ipcRenderer.invoke('set-default-php-version', version),
    
    // 获取PHP扩展
    getExtensions: (version) => ipcRenderer.invoke('get-php-extensions', version),
    
    // 启用PHP扩展
    enableExtension: (version, extension) => ipcRenderer.invoke('enable-php-extension', { version, extension }),
    
    // 禁用PHP扩展
    disableExtension: (version, extension) => ipcRenderer.invoke('disable-php-extension', { version, extension })
  },
  
  // 系统API
  system: {
    // 获取系统信息
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    
    // 检查更新
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    
    // 打开目录
    openDirectory: (path) => ipcRenderer.invoke('open-directory', path),
    
    // 打开文件
    openFile: (path) => ipcRenderer.invoke('open-file', path),
    
    // 退出应用
    quit: () => ipcRenderer.invoke('quit-app')
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