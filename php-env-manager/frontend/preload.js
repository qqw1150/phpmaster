// Electron预加载脚本
// 用于安全地暴露API给渲染进程

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && !window.process?.type;

// 仅在非浏览器环境中加载Electron模块
let contextBridge, ipcRenderer, os;
try {
  if (!isBrowser) {
    const electron = require('electron');
    contextBridge = electron.contextBridge;
    ipcRenderer = electron.ipcRenderer;
    
    try {
      os = require('os');
    } catch (osError) {
      console.error('加载os模块失败:', osError);
      // 提供一个备用os对象
      os = {
        platform: () => 'unknown'
      };
    }
  }
} catch (error) {
  console.error('加载Electron模块失败:', error);
}

// 根据环境决定如何处理API暴露
if (isBrowser || !contextBridge) {
  // 浏览器环境：创建模拟对象
  window.phpEnvManager = {
    // 服务管理
    services: {
      getStatus: () => Promise.resolve({
        apache: { running: true, name: 'Apache', port: 80 },
        mysql: { running: false, name: 'MySQL', port: 3306 },
        php: { running: true, name: 'PHP', port: 9000 }
      }),
      start: (service) => Promise.resolve({ success: true, message: `启动${service}服务` }),
      stop: (service) => Promise.resolve({ success: true, message: `停止${service}服务` }),
      restart: (service) => Promise.resolve({ success: true, message: `重启${service}服务` })
    },
    // 系统信息
    system: {
      getPlatform: () => Promise.resolve('browser'),
      getCpuUsage: () => Promise.resolve(Math.random() * 100),
      getMemoryUsage: () => Promise.resolve(Math.random() * 100),
      getDiskUsage: () => Promise.resolve({
        total: 1000000000,
        free: 400000000,
        used: 600000000
      }),
      appReady: () => Promise.resolve({ success: true, message: '浏览器环境初始化成功' })
    },
    // 网站管理
    websites: {
      getAll: () => Promise.resolve([]),
      create: () => Promise.resolve({ success: true }),
      delete: () => Promise.resolve({ success: true }),
      backup: () => Promise.resolve({ success: true })
    },
    // 数据库管理
    databases: {
      getAll: () => Promise.resolve([]),
      create: () => Promise.resolve({ success: true }),
      delete: () => Promise.resolve({ success: true }),
      backup: () => Promise.resolve({ success: true })
    },
    // PHP版本管理
    php: {
      getVersions: () => Promise.resolve(['7.4', '8.0', '8.1']),
      switchVersion: () => Promise.resolve({ success: true })
    }
  };
  
  // 浏览器环境：模拟electron原生API
  window.electron = {
    openExternal: (url) => { window.open(url, '_blank'); return Promise.resolve(); },
    showItemInFolder: (path) => Promise.resolve()
  };
} else {
  // Electron环境：暴露真实API
  contextBridge.exposeInMainWorld('phpEnvManager', {
    // 服务管理
    services: {
      getStatus: () => ipcRenderer.invoke('get-service-status'),
      start: (service) => ipcRenderer.invoke('start-service', service),
      stop: (service) => ipcRenderer.invoke('stop-service', service),
      restart: (service) => ipcRenderer.invoke('restart-service', service)
    },
    // 系统信息
    system: {
      getPlatform: () => Promise.resolve(os.platform()),
      getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
      getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
      getDiskUsage: () => ipcRenderer.invoke('get-disk-usage'),
      appReady: () => ipcRenderer.invoke('app-ready')
    },
    // 网站管理
    websites: {
      getAll: () => ipcRenderer.invoke('get-websites'),
      create: (data) => ipcRenderer.invoke('create-website', data),
      delete: (id) => ipcRenderer.invoke('delete-website', id),
      backup: (id) => ipcRenderer.invoke('backup-website', id)
    },
    // 数据库管理
    databases: {
      getAll: () => ipcRenderer.invoke('get-databases'),
      create: (data) => ipcRenderer.invoke('create-database', data),
      delete: (id) => ipcRenderer.invoke('delete-database', id),
      backup: (id) => ipcRenderer.invoke('backup-database', id)
    },
    // PHP版本管理
    php: {
      getVersions: () => ipcRenderer.invoke('get-php-versions'),
      switchVersion: (version) => ipcRenderer.invoke('switch-php-version', version)
    }
  });

  // 暴露electron原生API
  contextBridge.exposeInMainWorld('electron', {
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path)
  });
} 