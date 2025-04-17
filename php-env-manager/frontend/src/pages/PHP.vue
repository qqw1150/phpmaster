<template>
  <div class="php-container">
    <div class="page-header">
      <h1>PHP管理</h1>
      <div class="page-tools">
        <el-button type="primary" @click="installPHP">
          <el-icon><Plus /></el-icon>安装PHP版本
        </el-button>
        <el-button type="success" @click="refreshPHPInfo">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="PHP版本" name="versions">
        <el-card class="php-card">
          <template #header>
            <div class="card-header">
              <span>已安装的PHP版本</span>
            </div>
          </template>
          
          <el-table :data="phpVersions" border stripe style="width: 100%">
            <el-table-column prop="version" label="PHP版本" min-width="120" />
            <el-table-column prop="path" label="安装路径" min-width="250" show-overflow-tooltip />
            <el-table-column prop="extensions" label="已装扩展数" width="120" />
            <el-table-column label="默认版本" width="120">
              <template #default="scope">
                <el-tag v-if="scope.row.isDefault" type="success">默认版本</el-tag>
                <el-button 
                  v-else 
                  size="small" 
                  @click="setDefaultVersion(scope.row)"
                >
                  设为默认
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
                  {{ scope.row.enabled ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="330" fixed="right">
              <template #default="scope">
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="viewPHPInfo(scope.row)"
                >
                  phpinfo
                </el-button>
                <el-button 
                  size="small" 
                  type="success" 
                  @click="editConfig(scope.row)"
                >
                  配置文件
                </el-button>
                <el-button 
                  size="small" 
                  type="warning" 
                  @click="togglePHPStatus(scope.row)"
                >
                  {{ scope.row.enabled ? '禁用' : '启用' }}
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="uninstallPHP(scope.row)"
                >
                  卸载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="PHP扩展" name="extensions">
        <el-card class="extension-card">
          <template #header>
            <div class="card-header">
              <div class="extension-header-left">
                <span>PHP扩展管理</span>
                <el-select 
                  v-model="selectedVersion" 
                  placeholder="选择PHP版本" 
                  style="margin-left: 15px; width: 150px"
                >
                  <el-option 
                    v-for="version in phpVersions" 
                    :key="version.version" 
                    :label="version.version" 
                    :value="version.version" 
                  />
                </el-select>
              </div>
              <el-input 
                v-model="extensionSearchQuery" 
                placeholder="搜索扩展..." 
                style="width: 250px;"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          
          <div class="extension-actions">
            <el-button type="primary" @click="installExtension">
              <el-icon><Plus /></el-icon>安装扩展
            </el-button>
            <el-button type="success" @click="refreshExtensions">
              <el-icon><Refresh /></el-icon>刷新扩展列表
            </el-button>
          </div>
          
          <el-table :data="filteredExtensions" border stripe style="width: 100%">
            <el-table-column prop="name" label="扩展名称" min-width="150" />
            <el-table-column prop="version" label="版本" width="120" />
            <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag :type="scope.row.enabled ? 'success' : 'info'">
                  {{ scope.row.enabled ? '已启用' : '已禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="scope">
                <el-button 
                  size="small" 
                  :type="scope.row.enabled ? 'warning' : 'success'" 
                  @click="toggleExtension(scope.row)"
                >
                  {{ scope.row.enabled ? '禁用' : '启用' }}
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="uninstallExtension(scope.row)"
                >
                  卸载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Search } from '@element-plus/icons-vue';

// 当前活动Tab
const activeTab = ref('versions');

// PHP版本列表
const phpVersions = ref([
  {
    version: 'PHP 8.2.0',
    path: 'D:\\phpmaster\\php\\8.2.0',
    extensions: 35,
    isDefault: true,
    enabled: true
  },
  {
    version: 'PHP 8.1.12',
    path: 'D:\\phpmaster\\php\\8.1.12',
    extensions: 32,
    isDefault: false,
    enabled: true
  },
  {
    version: 'PHP 7.4.30',
    path: 'D:\\phpmaster\\php\\7.4.30',
    extensions: 28,
    isDefault: false,
    enabled: true
  },
  {
    version: 'PHP 7.3.33',
    path: 'D:\\phpmaster\\php\\7.3.33',
    extensions: 25,
    isDefault: false,
    enabled: false
  }
]);

// 当前选择的PHP版本（用于扩展管理）
const selectedVersion = ref('PHP 8.2.0');

// 扩展搜索关键词
const extensionSearchQuery = ref('');

// PHP扩展列表
const extensions = ref([
  {
    name: 'mysqli',
    version: '8.2.0',
    description: 'MySQL改进版扩展',
    enabled: true
  },
  {
    name: 'pdo_mysql',
    version: '8.2.0',
    description: 'MySQL PDO驱动',
    enabled: true
  },
  {
    name: 'mbstring',
    version: '8.2.0',
    description: '多字节字符串扩展',
    enabled: true
  },
  {
    name: 'openssl',
    version: '8.2.0',
    description: 'OpenSSL扩展',
    enabled: true
  },
  {
    name: 'gd',
    version: '8.2.0',
    description: 'GD图形库',
    enabled: true
  },
  {
    name: 'curl',
    version: '8.2.0',
    description: 'cURL支持',
    enabled: true
  },
  {
    name: 'zip',
    version: '8.2.0',
    description: 'Zip压缩支持',
    enabled: true
  },
  {
    name: 'redis',
    version: '5.3.7',
    description: 'Redis缓存支持',
    enabled: false
  },
  {
    name: 'xdebug',
    version: '3.1.5',
    description: '调试和性能分析工具',
    enabled: false
  }
]);

// 根据当前选择的PHP版本和搜索关键词过滤扩展列表
const filteredExtensions = computed(() => {
  let result = extensions.value;
  
  if (extensionSearchQuery.value) {
    const query = extensionSearchQuery.value.toLowerCase();
    result = result.filter(ext => {
      return ext.name.toLowerCase().includes(query) || 
             ext.description.toLowerCase().includes(query);
    });
  }
  
  return result;
});

// 监听选择的PHP版本变化，更新扩展列表
watch(selectedVersion, (newValue) => {
  // 实际应用中，这里应该根据选择的PHP版本加载对应的扩展列表
  ElMessage.info(`已切换到 ${newValue} 的扩展列表`);
  
  // 模拟加载不同版本的扩展
  if (newValue === 'PHP 7.3.33') {
    extensions.value = extensions.value.filter(ext => ext.name !== 'redis');
    extensions.value.forEach(ext => {
      ext.version = '7.3.33';
    });
  } else if (newValue === 'PHP 7.4.30') {
    extensions.value.forEach(ext => {
      ext.version = '7.4.30';
    });
  } else {
    // 恢复默认扩展列表
    refreshExtensions();
  }
});

// 安装新的PHP版本
const installPHP = () => {
  ElMessage.info('打开PHP版本安装向导');
  // 这里应该打开PHP版本安装向导对话框
};

// 刷新PHP信息
const refreshPHPInfo = () => {
  ElMessage.info('正在刷新PHP信息...');
  // 这里应该调用获取PHP信息的API
  setTimeout(() => {
    ElMessage.success('PHP信息已更新');
  }, 1000);
};

// 查看PHP信息
const viewPHPInfo = (php) => {
  ElMessage.info(`查看 ${php.version} 的phpinfo页面`);
  // 这里应该打开phpinfo页面
  window.open(`/phpinfo.php?version=${php.version}`, '_blank');
};

// 编辑PHP配置文件
const editConfig = (php) => {
  ElMessage.info(`编辑 ${php.version} 的配置文件`);
  // 这里应该打开配置文件编辑器
};

// 切换PHP版本的启用状态
const togglePHPStatus = (php) => {
  const newStatus = !php.enabled;
  const action = newStatus ? '启用' : '禁用';
  
  ElMessageBox.confirm(
    `确定要${action} ${php.version} 吗？`,
    `${action}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API来启用/禁用PHP版本
    php.enabled = newStatus;
    ElMessage.success(`${php.version} 已${action}`);
  }).catch(() => {
    // 取消操作
  });
};

// 设置默认PHP版本
const setDefaultVersion = (php) => {
  ElMessageBox.confirm(
    `确定要将 ${php.version} 设置为默认PHP版本吗？`,
    '设置默认版本',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API来设置默认PHP版本
    phpVersions.value.forEach(v => {
      v.isDefault = v.version === php.version;
    });
    ElMessage.success(`${php.version} 已设置为默认PHP版本`);
  }).catch(() => {
    // 取消操作
  });
};

// 卸载PHP版本
const uninstallPHP = (php) => {
  if (php.isDefault) {
    ElMessage.error('无法卸载默认PHP版本，请先设置其他版本为默认');
    return;
  }
  
  ElMessageBox.confirm(
    `确定要卸载 ${php.version} 吗？这将删除该版本的所有文件和配置。`,
    '卸载确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    // 这里应该调用卸载API
    phpVersions.value = phpVersions.value.filter(v => v.version !== php.version);
    ElMessage.success(`${php.version} 已成功卸载`);
  }).catch(() => {
    // 取消操作
  });
};

// 安装PHP扩展
const installExtension = () => {
  ElMessage.info(`为 ${selectedVersion.value} 安装新扩展`);
  // 这里应该打开扩展安装向导对话框
};

// 刷新扩展列表
const refreshExtensions = () => {
  ElMessage.info('正在刷新扩展列表...');
  // 这里应该调用API获取扩展列表
  
  // 模拟恢复默认扩展列表
  extensions.value = [
    {
      name: 'mysqli',
      version: '8.2.0',
      description: 'MySQL改进版扩展',
      enabled: true
    },
    {
      name: 'pdo_mysql',
      version: '8.2.0',
      description: 'MySQL PDO驱动',
      enabled: true
    },
    {
      name: 'mbstring',
      version: '8.2.0',
      description: '多字节字符串扩展',
      enabled: true
    },
    {
      name: 'openssl',
      version: '8.2.0',
      description: 'OpenSSL扩展',
      enabled: true
    },
    {
      name: 'gd',
      version: '8.2.0',
      description: 'GD图形库',
      enabled: true
    },
    {
      name: 'curl',
      version: '8.2.0',
      description: 'cURL支持',
      enabled: true
    },
    {
      name: 'zip',
      version: '8.2.0',
      description: 'Zip压缩支持',
      enabled: true
    },
    {
      name: 'redis',
      version: '5.3.7',
      description: 'Redis缓存支持',
      enabled: false
    },
    {
      name: 'xdebug',
      version: '3.1.5',
      description: '调试和性能分析工具',
      enabled: false
    }
  ];
  
  setTimeout(() => {
    ElMessage.success('扩展列表已更新');
  }, 1000);
};

// 切换扩展启用状态
const toggleExtension = (extension) => {
  const newStatus = !extension.enabled;
  const action = newStatus ? '启用' : '禁用';
  
  ElMessageBox.confirm(
    `确定要${action}扩展 ${extension.name} 吗？`,
    `${action}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API来启用/禁用扩展
    extension.enabled = newStatus;
    ElMessage.success(`扩展 ${extension.name} 已${action}`);
  }).catch(() => {
    // 取消操作
  });
};

// 卸载扩展
const uninstallExtension = (extension) => {
  ElMessageBox.confirm(
    `确定要卸载扩展 ${extension.name} 吗？`,
    '卸载确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    // 这里应该调用API来卸载扩展
    extensions.value = extensions.value.filter(ext => ext.name !== extension.name);
    ElMessage.success(`扩展 ${extension.name} 已成功卸载`);
  }).catch(() => {
    // 取消操作
  });
};
</script>

<style scoped>
.php-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.page-tools {
  display: flex;
  gap: 10px;
}

.php-card,
.extension-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.extension-header-left {
  display: flex;
  align-items: center;
}

.extension-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}
</style> 