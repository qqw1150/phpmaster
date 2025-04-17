import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加认证信息等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 处理响应错误
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

/**
 * PHP版本管理API
 */
export const phpAPI = {
  /**
   * 获取已安装的PHP版本列表
   * @returns {Promise<Array>} PHP版本列表
   */
  getVersions() {
    return api.get('/php/versions');
  },

  /**
   * 安装新的PHP版本
   * @param {Object} data 版本信息
   * @returns {Promise<Object>} 安装结果
   */
  installVersion(data) {
    return api.post('/php/versions/install', data);
  },

  /**
   * 卸载PHP版本
   * @param {string} version PHP版本
   * @returns {Promise<Object>} 卸载结果
   */
  uninstallVersion(version) {
    return api.delete(`/php/versions/${encodeURIComponent(version)}`);
  },

  /**
   * 设置默认PHP版本
   * @param {string} version PHP版本
   * @returns {Promise<Object>} 设置结果
   */
  setDefaultVersion(version) {
    return api.put(`/php/versions/${encodeURIComponent(version)}/default`);
  },

  /**
   * 启用/禁用PHP版本
   * @param {string} version PHP版本
   * @param {boolean} enabled 是否启用
   * @returns {Promise<Object>} 操作结果
   */
  toggleVersionStatus(version, enabled) {
    return api.put(`/php/versions/${encodeURIComponent(version)}/status`, { enabled });
  },

  /**
   * 获取PHP详细信息
   * @param {string} version PHP版本
   * @returns {Promise<Object>} PHP信息
   */
  getVersionInfo(version) {
    return api.get(`/php/versions/${encodeURIComponent(version)}/info`);
  },

  /**
   * 获取PHP配置文件
   * @param {string} version PHP版本
   * @returns {Promise<Object>} 配置信息
   */
  getConfig(version) {
    return api.get(`/php/versions/${encodeURIComponent(version)}/config`);
  },

  /**
   * 保存PHP配置文件
   * @param {string} version PHP版本
   * @param {Object} config 配置内容
   * @returns {Promise<Object>} 保存结果
   */
  saveConfig(version, config) {
    return api.put(`/php/versions/${encodeURIComponent(version)}/config`, config);
  }
};

/**
 * PHP扩展管理API
 */
export const extensionAPI = {
  /**
   * 获取指定PHP版本的扩展列表
   * @param {string} phpVersion PHP版本
   * @returns {Promise<Array>} 扩展列表
   */
  getExtensions(phpVersion) {
    return api.get(`/php/extensions?version=${encodeURIComponent(phpVersion)}`);
  },

  /**
   * 安装PHP扩展
   * @param {string} phpVersion PHP版本
   * @param {Object} data 扩展信息
   * @returns {Promise<Object>} 安装结果
   */
  installExtension(phpVersion, data) {
    return api.post(`/php/extensions/install?version=${encodeURIComponent(phpVersion)}`, data);
  },

  /**
   * 卸载PHP扩展
   * @param {string} phpVersion PHP版本
   * @param {string} extensionName 扩展名称
   * @returns {Promise<Object>} 卸载结果
   */
  uninstallExtension(phpVersion, extensionName) {
    return api.delete(`/php/extensions/${encodeURIComponent(extensionName)}?version=${encodeURIComponent(phpVersion)}`);
  },

  /**
   * 启用/禁用PHP扩展
   * @param {string} phpVersion PHP版本
   * @param {string} extensionName 扩展名称
   * @param {boolean} enabled 是否启用
   * @returns {Promise<Object>} 操作结果
   */
  toggleExtensionStatus(phpVersion, extensionName, enabled) {
    return api.put(`/php/extensions/${encodeURIComponent(extensionName)}/status?version=${encodeURIComponent(phpVersion)}`, { enabled });
  }
};

export default api; 