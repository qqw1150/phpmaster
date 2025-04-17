# PHP环境管理器 API文档

## 核心服务API

核心服务API分为后端服务管理API和前端通信API两部分。后端服务API用于管理各种服务组件，前端通信API用于与用户界面交互。

### 1. 服务管理API

#### 1.1 服务生命周期接口

##### 获取所有服务状态
```go
// GetAllServices 获取所有服务及其状态
func GetAllServices() ([]ServiceInfo, error)

// ServiceInfo 结构定义
type ServiceInfo struct {
    ID          string   `json:"id"`          // 服务唯一标识符
    Name        string   `json:"name"`        // 服务名称
    Type        string   `json:"type"`        // 服务类型(web/db/cache等)
    Status      string   `json:"status"`      // 服务状态(running/stopped/error)
    Version     string   `json:"version"`     // 服务版本
    Port        int      `json:"port"`        // 服务端口
    ConfigPath  string   `json:"configPath"`  // 配置文件路径
    LogPath     string   `json:"logPath"`     // 日志文件路径
    Dependencies []string `json:"dependencies"` // 依赖的其他服务
    AutoStart   bool     `json:"autoStart"`   // 是否自动启动
}
```

##### 服务状态控制
```go
// StartService 启动指定服务
func StartService(serviceID string) error

// StopService 停止指定服务
func StopService(serviceID string) error

// RestartService 重启指定服务
func RestartService(serviceID string) error

// GetServiceStatus 获取指定服务状态
func GetServiceStatus(serviceID string) (ServiceStatus, error)

// ServiceStatus 结构定义
type ServiceStatus struct {
    Status      string    `json:"status"`      // 服务状态(running/stopped/error)
    Uptime      int64     `json:"uptime"`      // 运行时间(秒)
    MemoryUsage int64     `json:"memoryUsage"` // 内存使用(KB)
    CPUUsage    float64   `json:"cpuUsage"`    // CPU使用率(%)
    ErrorInfo   string    `json:"errorInfo"`   // 错误信息(如有)
    LastStarted time.Time `json:"lastStarted"` // 最后启动时间
}
```

#### 1.2 配置管理接口

##### 获取服务配置
```go
// GetServiceConfig 获取指定服务的配置
func GetServiceConfig(serviceID string) (map[string]interface{}, error)

// UpdateServiceConfig 更新指定服务的配置
func UpdateServiceConfig(serviceID string, config map[string]interface{}) error

// ValidateServiceConfig 验证指定服务的配置
func ValidateServiceConfig(serviceID string, config map[string]interface{}) (bool, []string, error)
```

### 2. Web服务器API

#### 2.1 Nginx管理接口

```go
// GetNginxSites 获取所有Nginx站点配置
func GetNginxSites() ([]WebSite, error)

// CreateNginxSite 创建新的Nginx站点
func CreateNginxSite(site WebSite) error

// UpdateNginxSite 更新Nginx站点配置
func UpdateNginxSite(siteID string, site WebSite) error

// DeleteNginxSite 删除Nginx站点
func DeleteNginxSite(siteID string) error

// WebSite 结构定义
type WebSite struct {
    ID            string   `json:"id"`            // 站点唯一标识符
    Name          string   `json:"name"`          // 站点名称
    DocumentRoot  string   `json:"documentRoot"`  // 网站根目录
    ServerName    string   `json:"serverName"`    // 服务器名称(域名)
    ServerAliases []string `json:"serverAliases"` // 服务器别名
    Port          int      `json:"port"`          // 监听端口
    SSLEnabled    bool     `json:"sslEnabled"`    // 是否启用SSL
    SSLCertPath   string   `json:"sslCertPath"`   // SSL证书路径
    SSLKeyPath    string   `json:"sslKeyPath"`    // SSL密钥路径
    PHPVersion    string   `json:"phpVersion"`    // PHP版本
    Enabled       bool     `json:"enabled"`       // 是否启用
    CustomConfig  string   `json:"customConfig"`  // 自定义配置
}
```

#### 2.2 Apache管理接口

```go
// GetApacheSites 获取所有Apache站点配置
func GetApacheSites() ([]WebSite, error)

// CreateApacheSite 创建新的Apache站点
func CreateApacheSite(site WebSite) error

// UpdateApacheSite 更新Apache站点配置
func UpdateApacheSite(siteID string, site WebSite) error

// DeleteApacheSite 删除Apache站点
func DeleteApacheSite(siteID string) error

// GetApacheModules 获取Apache模块列表
func GetApacheModules() ([]ApacheModule, error)

// EnableApacheModule 启用Apache模块
func EnableApacheModule(moduleName string) error

// DisableApacheModule 禁用Apache模块
func DisableApacheModule(moduleName string) error

// ApacheModule 结构定义
type ApacheModule struct {
    Name        string `json:"name"`        // 模块名称
    Description string `json:"description"` // 模块描述
    Enabled     bool   `json:"enabled"`     // 是否启用
}
```

### 3. PHP管理API

#### 3.1 PHP版本管理接口

```go
// GetPHPVersions 获取所有PHP版本
func GetPHPVersions() ([]PHPVersion, error)

// InstallPHPVersion 安装指定PHP版本
func InstallPHPVersion(version string) error

// UninstallPHPVersion 卸载指定PHP版本
func UninstallPHPVersion(version string) error

// SetDefaultPHPVersion 设置默认PHP版本
func SetDefaultPHPVersion(version string) error

// PHPVersion 结构定义
type PHPVersion struct {
    Version      string    `json:"version"`      // PHP版本号
    Path         string    `json:"path"`         // 安装路径
    ConfigPath   string    `json:"configPath"`   // 配置文件路径
    IsDefault    bool      `json:"isDefault"`    // 是否为默认版本
    Installed    bool      `json:"installed"`    // 是否已安装
    InstalledExt []string  `json:"installedExt"` // 已安装扩展
}
```

#### 3.2 PHP扩展管理接口

```go
// GetPHPExtensions 获取指定PHP版本的扩展
func GetPHPExtensions(version string) ([]PHPExtension, error)

// EnablePHPExtension 启用PHP扩展
func EnablePHPExtension(version string, extensionName string) error

// DisablePHPExtension 禁用PHP扩展
func DisablePHPExtension(version string, extensionName string) error

// InstallPHPExtension 安装PHP扩展
func InstallPHPExtension(version string, extensionName string) error

// PHPExtension 结构定义
type PHPExtension struct {
    Name        string `json:"name"`        // 扩展名称
    Version     string `json:"version"`     // 扩展版本
    Description string `json:"description"` // 扩展描述
    Enabled     bool   `json:"enabled"`     // 是否启用
    Installed   bool   `json:"installed"`   // 是否已安装
}
```

### 4. 数据库管理API

#### 4.1 MySQL/MariaDB接口

```go
// GetDatabases 获取所有数据库
func GetDatabases() ([]Database, error)

// CreateDatabase 创建数据库
func CreateDatabase(database Database) error

// DeleteDatabase 删除数据库
func DeleteDatabase(databaseName string) error

// GetDatabaseUsers 获取所有数据库用户
func GetDatabaseUsers() ([]DatabaseUser, error)

// CreateDatabaseUser 创建数据库用户
func CreateDatabaseUser(user DatabaseUser) error

// UpdateDatabaseUser 更新数据库用户
func UpdateDatabaseUser(username string, user DatabaseUser) error

// DeleteDatabaseUser 删除数据库用户
func DeleteDatabaseUser(username string) error

// GrantUserPrivileges 授予用户权限
func GrantUserPrivileges(username string, databaseName string, privileges []string) error

// Database 结构定义
type Database struct {
    Name      string `json:"name"`      // 数据库名称
    Charset   string `json:"charset"`   // 字符集
    Collation string `json:"collation"` // 排序规则
}

// DatabaseUser 结构定义
type DatabaseUser struct {
    Username     string            `json:"username"`     // 用户名
    Password     string            `json:"password"`     // 密码
    Host         string            `json:"host"`         // 主机
    Privileges   map[string][]string `json:"privileges"` // 权限映射(数据库名->权限列表)
}
```

### 5. 站点管理API

```go
// GetSites 获取所有网站
func GetSites() ([]Site, error)

// CreateSite 创建网站
func CreateSite(site Site) error

// UpdateSite 更新网站
func UpdateSite(siteID string, site Site) error

// DeleteSite 删除网站
func DeleteSite(siteID string) error

// Site 结构定义
type Site struct {
    ID           string `json:"id"`           // 站点唯一标识符
    Name         string `json:"name"`         // 站点名称
    DocumentRoot string `json:"documentRoot"` // 网站根目录
    ServerName   string `json:"serverName"`   // 服务器名称(域名)
    WebServer    string `json:"webServer"`    // Web服务器(nginx/apache)
    PHPVersion   string `json:"phpVersion"`   // PHP版本
    SSLEnabled   bool   `json:"sslEnabled"`   // 是否启用SSL
    Enabled      bool   `json:"enabled"`      // 是否启用
}
```

### 6. 安全管理API

```go
// GetFirewallRules 获取防火墙规则
func GetFirewallRules() ([]FirewallRule, error)

// AddFirewallRule 添加防火墙规则
func AddFirewallRule(rule FirewallRule) error

// DeleteFirewallRule 删除防火墙规则
func DeleteFirewallRule(ruleID string) error

// GetBlacklist 获取IP黑名单
func GetBlacklist() ([]IPListEntry, error)

// AddToBlacklist 添加IP到黑名单
func AddToBlacklist(entry IPListEntry) error

// RemoveFromBlacklist 从黑名单移除IP
func RemoveFromBlacklist(ip string) error

// GetWhitelist 获取IP白名单
func GetWhitelist() ([]IPListEntry, error)

// AddToWhitelist 添加IP到白名单
func AddToWhitelist(entry IPListEntry) error

// RemoveFromWhitelist 从白名单移除IP
func RemoveFromWhitelist(ip string) error

// FirewallRule 结构定义
type FirewallRule struct {
    ID          string `json:"id"`          // 规则唯一标识符
    Name        string `json:"name"`        // 规则名称
    Protocol    string `json:"protocol"`    // 协议(tcp/udp/icmp)
    SourceIP    string `json:"sourceIP"`    // 源IP
    DestPort    int    `json:"destPort"`    // 目标端口
    Action      string `json:"action"`      // 动作(allow/deny)
    Description string `json:"description"` // 描述
    Enabled     bool   `json:"enabled"`     // 是否启用
}

// IPListEntry 结构定义
type IPListEntry struct {
    IP          string    `json:"ip"`          // IP地址
    Description string    `json:"description"` // 描述
    AddedAt     time.Time `json:"addedAt"`     // 添加时间
    ExpiresAt   time.Time `json:"expiresAt"`   // 过期时间(可选)
}
```

### 7. 系统监控API

```go
// GetSystemStatus 获取系统状态
func GetSystemStatus() (SystemStatus, error)

// GetServiceLogs 获取服务日志
func GetServiceLogs(serviceID string, lines int, filter string) ([]LogEntry, error)

// SystemStatus 结构定义
type SystemStatus struct {
    CPUUsage     float64 `json:"cpuUsage"`     // CPU使用率(%)
    MemoryUsage  float64 `json:"memoryUsage"`  // 内存使用率(%)
    DiskUsage    float64 `json:"diskUsage"`    // 磁盘使用率(%)
    NetworkStats NetworkStats `json:"networkStats"` // 网络统计
    RunningServices int    `json:"runningServices"` // 运行中的服务数
    Uptime       int64   `json:"uptime"`       // 系统运行时间(秒)
}

// NetworkStats 结构定义
type NetworkStats struct {
    BytesSent    int64 `json:"bytesSent"`    // 发送字节数
    BytesReceived int64 `json:"bytesReceived"` // 接收字节数
    ConnectionsCount int `json:"connectionsCount"` // 连接数
}

// LogEntry 结构定义
type LogEntry struct {
    Timestamp time.Time `json:"timestamp"` // 时间戳
    Level     string    `json:"level"`     // 日志级别
    Service   string    `json:"service"`   // 相关服务
    Message   string    `json:"message"`   // 日志消息
}
```

## 前端通信API

前端通信API是通过Electron主进程与渲染进程之间的IPC通信机制实现的。

### 1. IPC通信接口

#### 1.1 主进程到渲染进程

```javascript
// 向渲染进程发送服务状态更新
mainWindow.webContents.send('service-status-update', serviceStatusData);

// 向渲染进程发送系统状态更新
mainWindow.webContents.send('system-status-update', systemStatusData);

// 向渲染进程发送操作结果
mainWindow.webContents.send('operation-result', {
  operationId: 'unique-operation-id',
  success: true/false,
  message: '操作结果消息',
  data: {} // 操作返回的数据
});

// 向渲染进程发送错误信息
mainWindow.webContents.send('error-notification', {
  type: 'error-type',
  message: '错误消息',
  details: '详细错误信息'
});
```

#### 1.2 渲染进程到主进程

```javascript
// 从渲染进程请求服务操作
ipcRenderer.invoke('service-operation', {
  operation: 'start/stop/restart',
  serviceId: 'service-id'
});

// 从渲染进程请求配置更新
ipcRenderer.invoke('update-config', {
  serviceId: 'service-id',
  config: {} // 配置对象
});

// 从渲染进程请求创建网站
ipcRenderer.invoke('create-site', siteData);

// 从渲染进程请求数据库操作
ipcRenderer.invoke('database-operation', {
  operation: 'create/update/delete',
  data: {} // 操作相关数据
});
```

### 2. 前端API接口

前端API是基于Electron渲染进程中封装的服务模块，用于与主进程通信。

#### 2.1 服务管理API

```javascript
/**
 * 服务管理API
 */
export const ServiceAPI = {
  /**
   * 获取所有服务状态
   * @returns {Promise<Array>} 服务列表
   */
  getAllServices: () => {
    return ipcRenderer.invoke('get-all-services');
  },
  
  /**
   * 启动服务
   * @param {string} serviceId 服务ID
   * @returns {Promise<Object>} 操作结果
   */
  startService: (serviceId) => {
    return ipcRenderer.invoke('service-operation', {
      operation: 'start',
      serviceId
    });
  },
  
  /**
   * 停止服务
   * @param {string} serviceId 服务ID
   * @returns {Promise<Object>} 操作结果
   */
  stopService: (serviceId) => {
    return ipcRenderer.invoke('service-operation', {
      operation: 'stop',
      serviceId
    });
  },
  
  /**
   * 重启服务
   * @param {string} serviceId 服务ID
   * @returns {Promise<Object>} 操作结果
   */
  restartService: (serviceId) => {
    return ipcRenderer.invoke('service-operation', {
      operation: 'restart',
      serviceId
    });
  },
  
  /**
   * 获取服务配置
   * @param {string} serviceId 服务ID
   * @returns {Promise<Object>} 服务配置
   */
  getServiceConfig: (serviceId) => {
    return ipcRenderer.invoke('get-service-config', serviceId);
  },
  
  /**
   * 更新服务配置
   * @param {string} serviceId 服务ID
   * @param {Object} config 配置对象
   * @returns {Promise<Object>} 操作结果
   */
  updateServiceConfig: (serviceId, config) => {
    return ipcRenderer.invoke('update-config', {
      serviceId,
      config
    });
  }
};
```

#### 2.2 站点管理API

```javascript
/**
 * 站点管理API
 */
export const SiteAPI = {
  /**
   * 获取所有站点
   * @returns {Promise<Array>} 站点列表
   */
  getAllSites: () => {
    return ipcRenderer.invoke('get-all-sites');
  },
  
  /**
   * 创建站点
   * @param {Object} siteData 站点数据
   * @returns {Promise<Object>} 操作结果
   */
  createSite: (siteData) => {
    return ipcRenderer.invoke('create-site', siteData);
  },
  
  /**
   * 更新站点
   * @param {string} siteId 站点ID
   * @param {Object} siteData 站点数据
   * @returns {Promise<Object>} 操作结果
   */
  updateSite: (siteId, siteData) => {
    return ipcRenderer.invoke('update-site', {
      siteId,
      siteData
    });
  },
  
  /**
   * 删除站点
   * @param {string} siteId 站点ID
   * @returns {Promise<Object>} 操作结果
   */
  deleteSite: (siteId) => {
    return ipcRenderer.invoke('delete-site', siteId);
  }
};
```

#### 2.3 PHP管理API

```javascript
/**
 * PHP管理API
 */
export const PHPAPI = {
  /**
   * 获取所有PHP版本
   * @returns {Promise<Array>} PHP版本列表
   */
  getAllVersions: () => {
    return ipcRenderer.invoke('get-php-versions');
  },
  
  /**
   * 安装PHP版本
   * @param {string} version 版本号
   * @returns {Promise<Object>} 操作结果
   */
  installVersion: (version) => {
    return ipcRenderer.invoke('install-php-version', version);
  },
  
  /**
   * 卸载PHP版本
   * @param {string} version 版本号
   * @returns {Promise<Object>} 操作结果
   */
  uninstallVersion: (version) => {
    return ipcRenderer.invoke('uninstall-php-version', version);
  },
  
  /**
   * 设置默认PHP版本
   * @param {string} version 版本号
   * @returns {Promise<Object>} 操作结果
   */
  setDefaultVersion: (version) => {
    return ipcRenderer.invoke('set-default-php-version', version);
  },
  
  /**
   * 获取PHP扩展
   * @param {string} version PHP版本
   * @returns {Promise<Array>} 扩展列表
   */
  getExtensions: (version) => {
    return ipcRenderer.invoke('get-php-extensions', version);
  },
  
  /**
   * 启用PHP扩展
   * @param {string} version PHP版本
   * @param {string} extension 扩展名
   * @returns {Promise<Object>} 操作结果
   */
  enableExtension: (version, extension) => {
    return ipcRenderer.invoke('enable-php-extension', {
      version,
      extension
    });
  },
  
  /**
   * 禁用PHP扩展
   * @param {string} version PHP版本
   * @param {string} extension 扩展名
   * @returns {Promise<Object>} 操作结果
   */
  disableExtension: (version, extension) => {
    return ipcRenderer.invoke('disable-php-extension', {
      version,
      extension
    });
  }
};
```

#### 2.4 数据库管理API

```javascript
/**
 * 数据库管理API
 */
export const DatabaseAPI = {
  /**
   * 获取所有数据库
   * @returns {Promise<Array>} 数据库列表
   */
  getAllDatabases: () => {
    return ipcRenderer.invoke('get-all-databases');
  },
  
  /**
   * 创建数据库
   * @param {Object} databaseData 数据库数据
   * @returns {Promise<Object>} 操作结果
   */
  createDatabase: (databaseData) => {
    return ipcRenderer.invoke('database-operation', {
      operation: 'create',
      data: databaseData
    });
  },
  
  /**
   * 删除数据库
   * @param {string} databaseName 数据库名
   * @returns {Promise<Object>} 操作结果
   */
  deleteDatabase: (databaseName) => {
    return ipcRenderer.invoke('database-operation', {
      operation: 'delete',
      data: { name: databaseName }
    });
  },
  
  /**
   * 获取所有数据库用户
   * @returns {Promise<Array>} 用户列表
   */
  getAllUsers: () => {
    return ipcRenderer.invoke('get-database-users');
  },
  
  /**
   * 创建数据库用户
   * @param {Object} userData 用户数据
   * @returns {Promise<Object>} 操作结果
   */
  createUser: (userData) => {
    return ipcRenderer.invoke('database-user-operation', {
      operation: 'create',
      data: userData
    });
  },
  
  /**
   * 更新数据库用户
   * @param {string} username 用户名
   * @param {Object} userData 用户数据
   * @returns {Promise<Object>} 操作结果
   */
  updateUser: (username, userData) => {
    return ipcRenderer.invoke('database-user-operation', {
      operation: 'update',
      username,
      data: userData
    });
  },
  
  /**
   * 删除数据库用户
   * @param {string} username 用户名
   * @returns {Promise<Object>} 操作结果
   */
  deleteUser: (username) => {
    return ipcRenderer.invoke('database-user-operation', {
      operation: 'delete',
      username
    });
  }
};
```

#### 2.5 系统监控API

```javascript
/**
 * 系统监控API
 */
export const MonitorAPI = {
  /**
   * 获取系统状态
   * @returns {Promise<Object>} 系统状态
   */
  getSystemStatus: () => {
    return ipcRenderer.invoke('get-system-status');
  },
  
  /**
   * 获取服务日志
   * @param {string} serviceId 服务ID
   * @param {number} lines 行数
   * @param {string} filter 过滤器
   * @returns {Promise<Array>} 日志条目
   */
  getServiceLogs: (serviceId, lines = 100, filter = '') => {
    return ipcRenderer.invoke('get-service-logs', {
      serviceId,
      lines,
      filter
    });
  },
  
  /**
   * 订阅实时系统状态
   * @param {Function} callback 回调函数
   * @returns {Function} 取消订阅函数
   */
  subscribeToSystemStatus: (callback) => {
    const listener = (event, data) => {
      callback(data);
    };
    
    ipcRenderer.on('system-status-update', listener);
    
    return () => {
      ipcRenderer.removeListener('system-status-update', listener);
    };
  },
  
  /**
   * 订阅服务状态更新
   * @param {Function} callback 回调函数
   * @returns {Function} 取消订阅函数
   */
  subscribeToServiceStatus: (callback) => {
    const listener = (event, data) => {
      callback(data);
    };
    
    ipcRenderer.on('service-status-update', listener);
    
    return () => {
      ipcRenderer.removeListener('service-status-update', listener);
    };
  }
};
```

## 插件系统API

PHP环境管理器提供插件系统，允许开发者扩展应用功能。

### 1. 插件注册API

```javascript
/**
 * 插件API
 */
export class PluginAPI {
  /**
   * 注册插件
   * @param {Object} pluginInfo 插件信息
   * @returns {Object} 插件实例
   */
  static registerPlugin(pluginInfo) {
    return ipcRenderer.invoke('register-plugin', pluginInfo);
  }
  
  /**
   * 注册服务
   * @param {Object} serviceInfo 服务信息
   * @returns {Promise<Object>} 操作结果
   */
  registerService(serviceInfo) {
    return ipcRenderer.invoke('plugin-register-service', {
      pluginId: this.pluginId,
      serviceInfo
    });
  }
  
  /**
   * 注册UI组件
   * @param {string} mountPoint 挂载点
   * @param {Object} component 组件信息
   * @returns {Promise<Object>} 操作结果
   */
  registerUIComponent(mountPoint, component) {
    return ipcRenderer.invoke('plugin-register-ui-component', {
      pluginId: this.pluginId,
      mountPoint,
      component
    });
  }
  
  /**
   * 注册设置页面
   * @param {Object} settingsPage 设置页面信息
   * @returns {Promise<Object>} 操作结果
   */
  registerSettingsPage(settingsPage) {
    return ipcRenderer.invoke('plugin-register-settings-page', {
      pluginId: this.pluginId,
      settingsPage
    });
  }
  
  /**
   * 注册命令
   * @param {Object} command 命令信息
   * @returns {Promise<Object>} 操作结果
   */
  registerCommand(command) {
    return ipcRenderer.invoke('plugin-register-command', {
      pluginId: this.pluginId,
      command
    });
  }
}
```

### 2. 插件生命周期API

```javascript
/**
 * 插件生命周期方法
 */
export const PluginLifecycle = {
  /**
   * 插件激活
   * @param {Object} context 上下文
   * @returns {Promise<void>}
   */
  async activate(context) {
    // 插件激活时调用
  },
  
  /**
   * 插件停用
   * @returns {Promise<void>}
   */
  async deactivate() {
    // 插件停用时调用
  }
};
```

## 错误代码表

| 错误代码 | 描述 |
|---------|------|
| E001 | 服务启动失败 |
| E002 | 服务停止失败 |
| E003 | 配置验证失败 |
| E004 | 端口被占用 |
| E005 | 文件权限错误 |
| E006 | 依赖项缺失 |
| E007 | 网络错误 |
| E008 | 数据库操作失败 |
| E009 | 站点创建失败 |
| E010 | PHP版本安装失败 |
| E011 | 插件加载失败 |
| E012 | 系统资源不足 | 