<template>
  <div class="software-container">
    <div class="page-header">
      <h1>软件管理</h1>
      <div class="page-tools">
        <el-button type="primary" @click="refreshSoftwareList">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
        <el-button type="success" @click="checkAllUpdates">
          <el-icon><Check /></el-icon>检查更新
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="软件商店" name="store">
        <div class="search-bar">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索软件..." 
            clearable
            style="width: 300px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="selectedCategory" placeholder="所有分类" style="width: 150px;" clearable>
            <el-option 
              v-for="category in categories" 
              :key="category.value" 
              :label="category.label" 
              :value="category.value"
            />
          </el-select>
        </div>

        <el-row :gutter="20" class="software-list">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="software in filteredSoftwareList" :key="software.id">
            <el-card class="software-card" shadow="hover">
              <div class="software-icon">
                <img :src="software.icon" :alt="software.name" />
              </div>
              <div class="software-info">
                <h3>{{ software.name }}</h3>
                <p class="software-description">{{ software.description }}</p>
                <div class="software-meta">
                  <span class="category-tag">{{ software.category }}</span>
                  <span class="version">v{{ software.version }}</span>
                </div>
                <div class="software-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    :disabled="software.installed || software.downloading"
                    @click="downloadSoftware(software)"
                  >
                    <el-icon v-if="software.downloading"><Loading /></el-icon>
                    {{ software.installed ? '已安装' : (software.downloading ? '下载中...' : '下载') }}
                  </el-button>
                  <el-button 
                    type="info" 
                    size="small"
                    @click="showSoftwareDetails(software)"
                  >
                    详情
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="已安装" name="installed">
        <el-table :data="installedSoftware" border stripe style="width: 100%">
          <el-table-column prop="name" label="软件名称" min-width="150" />
          <el-table-column prop="version" label="版本" width="120" />
          <el-table-column prop="installPath" label="安装路径" min-width="250" show-overflow-tooltip />
          <el-table-column prop="installDate" label="安装日期" width="180" />
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.updateAvailable ? 'warning' : 'success'">
                {{ scope.row.updateAvailable ? '可更新' : '最新版本' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="320" fixed="right">
            <template #default="scope">
              <el-button 
                size="small" 
                type="primary" 
                :disabled="!scope.row.updateAvailable"
                @click="updateSoftware(scope.row)"
              >
                更新
              </el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="runSoftware(scope.row)"
              >
                运行
              </el-button>
              <el-button 
                size="small" 
                type="warning" 
                @click="repairSoftware(scope.row)"
              >
                修复
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="uninstallSoftware(scope.row)"
              >
                卸载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 软件详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      :title="selectedSoftware?.name + ' 详情'"
      width="600px"
    >
      <div v-if="selectedSoftware" class="software-details">
        <div class="software-details-header">
          <img :src="selectedSoftware.icon" class="details-icon" />
          <div class="details-header-info">
            <h2>{{ selectedSoftware.name }}</h2>
            <div class="details-meta">
              <span class="details-version">版本: {{ selectedSoftware.version }}</span>
              <span class="details-size">大小: {{ selectedSoftware.size }}</span>
              <span class="details-category">分类: {{ selectedSoftware.category }}</span>
            </div>
          </div>
        </div>
        
        <div class="details-description">
          <h3>软件描述</h3>
          <p>{{ selectedSoftware.description }}</p>
        </div>
        
        <div class="details-features">
          <h3>主要功能</h3>
          <ul>
            <li v-for="(feature, index) in selectedSoftware.features" :key="index">
              {{ feature }}
            </li>
          </ul>
        </div>
        
        <div class="details-system-requirements">
          <h3>系统要求</h3>
          <p>操作系统: {{ selectedSoftware.systemRequirements.os }}</p>
          <p>内存: {{ selectedSoftware.systemRequirements.memory }}</p>
          <p>硬盘空间: {{ selectedSoftware.systemRequirements.diskSpace }}</p>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsDialogVisible = false">关闭</el-button>
          <el-button 
            type="primary" 
            :disabled="selectedSoftware?.installed || selectedSoftware?.downloading"
            @click="downloadSoftware(selectedSoftware)"
          >
            {{ selectedSoftware?.installed ? '已安装' : '下载' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Check, Search, Loading } from '@element-plus/icons-vue';

// 当前活动Tab
const activeTab = ref('store');

// 搜索查询和分类过滤
const searchQuery = ref('');
const selectedCategory = ref('');

// 软件分类列表
const categories = [
  { value: 'ide', label: 'IDE编辑器' },
  { value: 'database', label: '数据库工具' },
  { value: 'debug', label: '调试工具' },
  { value: 'utility', label: '实用工具' },
  { value: 'server', label: '服务器软件' }
];

// 可下载的软件列表
const softwareList = ref([
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    description: '轻量级代码编辑器，支持多种编程语言和扩展',
    version: '1.79.0',
    category: 'IDE编辑器',
    icon: '/icons/vscode.png',
    size: '80MB',
    installed: false,
    downloading: false,
    features: [
      '智能代码补全',
      '内置Git版本控制',
      '丰富的扩展生态',
      '内置调试支持',
      '多种主题和自定义选项'
    ],
    systemRequirements: {
      os: 'Windows 10 或更高版本',
      memory: '最少1GB RAM',
      diskSpace: '200MB可用空间'
    }
  },
  {
    id: 'phpstorm',
    name: 'PhpStorm',
    description: '专业PHP集成开发环境，提供智能代码补全、调试和测试支持',
    version: '2023.1',
    category: 'IDE编辑器',
    icon: '/icons/phpstorm.png',
    size: '520MB',
    installed: true,
    downloading: false,
    features: [
      '高级PHP代码补全和重构',
      '内置版本控制集成',
      'Composer集成',
      'PHPUnit和Xdebug支持',
      '数据库工具'
    ],
    systemRequirements: {
      os: 'Windows 10 或更高版本',
      memory: '最少2GB RAM, 推荐8GB',
      diskSpace: '2.5GB可用空间'
    }
  },
  {
    id: 'mysql-workbench',
    name: 'MySQL Workbench',
    description: 'MySQL数据库设计、管理和开发工具',
    version: '8.0.33',
    category: '数据库工具',
    icon: '/icons/mysql-workbench.png',
    size: '230MB',
    installed: false,
    downloading: false,
    features: [
      '数据库设计和建模',
      'SQL开发',
      '数据库管理',
      '数据迁移',
      '性能调优'
    ],
    systemRequirements: {
      os: 'Windows 10 或更高版本',
      memory: '最少4GB RAM',
      diskSpace: '400MB可用空间'
    }
  },
  {
    id: 'postman',
    name: 'Postman',
    description: 'API开发和测试工具',
    version: '10.14.2',
    category: '实用工具',
    icon: '/icons/postman.png',
    size: '125MB',
    installed: false,
    downloading: false,
    features: [
      'API请求构建和测试',
      '自动化测试',
      'API文档生成',
      'Mock服务器',
      '团队协作'
    ],
    systemRequirements: {
      os: 'Windows 10 或更高版本',
      memory: '最少1GB RAM',
      diskSpace: '300MB可用空间'
    }
  },
  {
    id: 'docker-desktop',
    name: 'Docker Desktop',
    description: '容器化开发平台，简化应用部署和开发环境配置',
    version: '4.19.0',
    category: '服务器软件',
    icon: '/icons/docker.png',
    size: '950MB',
    installed: false,
    downloading: false,
    features: [
      '容器化应用管理',
      'Docker Compose支持',
      'Kubernetes集成',
      '卷和网络管理',
      '镜像构建和仓库'
    ],
    systemRequirements: {
      os: 'Windows 10专业版或企业版',
      memory: '最少4GB RAM',
      diskSpace: '2GB可用空间'
    }
  },
  {
    id: 'sourcetree',
    name: 'Sourcetree',
    description: '免费的Git和Mercurial图形化客户端',
    version: '3.4.14',
    category: '实用工具',
    icon: '/icons/sourcetree.png',
    size: '240MB',
    installed: false,
    downloading: false,
    features: [
      '图形化Git操作',
      '历史查看和比较',
      '分支管理',
      '冲突解决',
      'Git Flow支持'
    ],
    systemRequirements: {
      os: 'Windows 10 或更高版本',
      memory: '最少2GB RAM',
      diskSpace: '400MB可用空间'
    }
  },
  {
    id: 'xdebug-gui',
    name: 'Xdebug GUI',
    description: 'PHP Xdebug调试工具的图形化界面',
    version: '1.5.2',
    category: '调试工具',
    icon: '/icons/xdebug.png',
    size: '25MB',
    installed: false,
    downloading: false,
    features: [
      'Xdebug配置向导',
      '断点管理',
      '变量查看和修改',
      '调用栈分析',
      '性能分析'
    ],
    systemRequirements: {
      os: 'Windows 7 或更高版本',
      memory: '最少512MB RAM',
      diskSpace: '50MB可用空间'
    }
  },
  {
    id: 'adminer',
    name: 'Adminer',
    description: '轻量级数据库管理工具，支持MySQL、PostgreSQL等多种数据库',
    version: '4.8.1',
    category: '数据库工具',
    icon: '/icons/adminer.png',
    size: '2MB',
    installed: false,
    downloading: false,
    features: [
      '多数据库支持',
      '轻量级单文件应用',
      '表结构管理',
      'SQL查询执行',
      '数据导入导出'
    ],
    systemRequirements: {
      os: 'Windows XP 或更高版本',
      memory: '最少256MB RAM',
      diskSpace: '5MB可用空间'
    }
  }
]);

// 已安装的软件列表
const installedSoftware = ref([
  {
    id: 'phpstorm',
    name: 'PhpStorm',
    version: '2023.1',
    installPath: 'D:\\Program Files\\JetBrains\\PhpStorm 2023.1',
    installDate: '2023-05-15',
    updateAvailable: true
  },
  {
    id: 'composer',
    name: 'Composer',
    version: '2.5.5',
    installPath: 'C:\\ProgramData\\ComposerSetup\\bin',
    installDate: '2023-04-10',
    updateAvailable: false
  },
  {
    id: 'git',
    name: 'Git',
    version: '2.40.1',
    installPath: 'C:\\Program Files\\Git',
    installDate: '2023-03-22',
    updateAvailable: false
  }
]);

// 当前选中的软件（用于详情对话框）
const selectedSoftware = ref(null);
const detailsDialogVisible = ref(false);

// 根据搜索条件和分类过滤软件列表
const filteredSoftwareList = computed(() => {
  let result = softwareList.value;
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(software => {
      return software.name.toLowerCase().includes(query) || 
             software.description.toLowerCase().includes(query);
    });
  }
  
  // 分类过滤
  if (selectedCategory.value) {
    const categoryLabel = categories.find(c => c.value === selectedCategory.value)?.label;
    result = result.filter(software => software.category === categoryLabel);
  }
  
  return result;
});

// 刷新软件列表
const refreshSoftwareList = () => {
  ElMessage.info('正在刷新软件列表...');
  // 这里应该调用API获取软件列表
  setTimeout(() => {
    ElMessage.success('软件列表已更新');
  }, 1000);
};

// 检查所有软件更新
const checkAllUpdates = () => {
  ElMessage.info('正在检查软件更新...');
  // 这里应该调用API检查软件更新
  setTimeout(() => {
    // 模拟发现一个更新
    installedSoftware.value[2].updateAvailable = true;
    ElMessage.success('检查完成，发现1个可更新软件');
  }, 2000);
};

// 显示软件详情
const showSoftwareDetails = (software) => {
  selectedSoftware.value = software;
  detailsDialogVisible.value = true;
};

// 下载软件
const downloadSoftware = (software) => {
  if (!software || software.installed || software.downloading) {
    return;
  }

  ElMessageBox.confirm(
    `确定要下载 ${software.name} 吗？`,
    '下载确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    // 模拟下载过程
    software.downloading = true;
    ElMessage.success(`开始下载 ${software.name}...`);
    
    // 模拟下载完成
    setTimeout(() => {
      software.downloading = false;
      software.installed = true;
      
      // 添加到已安装列表
      const today = new Date().toISOString().split('T')[0];
      installedSoftware.value.push({
        id: software.id,
        name: software.name,
        version: software.version,
        installPath: `D:\\Program Files\\${software.name}`,
        installDate: today,
        updateAvailable: false
      });
      
      ElMessage.success(`${software.name} 下载并安装成功`);
      
      // 如果对话框打开，关闭它
      if (detailsDialogVisible.value) {
        detailsDialogVisible.value = false;
      }
    }, 3000);
  }).catch(() => {
    // 取消操作
  });
};

// 更新软件
const updateSoftware = (software) => {
  if (!software.updateAvailable) {
    ElMessage.warning(`${software.name} 已是最新版本`);
    return;
  }

  ElMessageBox.confirm(
    `确定要更新 ${software.name} 吗？`,
    '更新确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.info(`正在更新 ${software.name}...`);
    
    // 模拟更新过程
    setTimeout(() => {
      // 更新版本号和状态
      software.version = software.version.split('.').map((v, i) => i === 2 ? parseInt(v) + 1 : v).join('.');
      software.updateAvailable = false;
      
      ElMessage.success(`${software.name} 已更新到 ${software.version}`);
    }, 2000);
  }).catch(() => {
    // 取消操作
  });
};

// 运行软件
const runSoftware = (software) => {
  ElMessage.success(`正在启动 ${software.name}...`);
  // 这里应该调用系统命令启动软件
};

// 修复软件
const repairSoftware = (software) => {
  ElMessageBox.confirm(
    `确定要修复 ${software.name} 吗？这将验证并修复软件文件。`,
    '修复确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.info(`正在修复 ${software.name}...`);
    
    // 模拟修复过程
    setTimeout(() => {
      ElMessage.success(`${software.name} 修复完成`);
    }, 2000);
  }).catch(() => {
    // 取消操作
  });
};

// 卸载软件
const uninstallSoftware = (software) => {
  ElMessageBox.confirm(
    `确定要卸载 ${software.name} 吗？这将删除该软件及其所有数据。`,
    '卸载确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    ElMessage.info(`正在卸载 ${software.name}...`);
    
    // 模拟卸载过程
    setTimeout(() => {
      // 从已安装列表中移除
      installedSoftware.value = installedSoftware.value.filter(s => s.id !== software.id);
      
      // 更新商店中的状态
      const storeItem = softwareList.value.find(s => s.id === software.id);
      if (storeItem) {
        storeItem.installed = false;
      }
      
      ElMessage.success(`${software.name} 已成功卸载`);
    }, 2000);
  }).catch(() => {
    // 取消操作
  });
};
</script>

<style scoped>
.software-container {
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

.search-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.software-list {
  margin-top: 20px;
}

.software-card {
  height: 100%;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.software-icon {
  text-align: center;
  padding: 10px 0;
}

.software-icon img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.software-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.software-info h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
}

.software-description {
  flex: 1;
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.software-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
}

.category-tag {
  color: #409EFF;
}

.version {
  color: #909399;
}

.software-actions {
  display: flex;
  justify-content: space-between;
}

/* 软件详情样式 */
.software-details-header {
  display: flex;
  margin-bottom: 20px;
}

.details-icon {
  width: 80px;
  height: 80px;
  margin-right: 20px;
  object-fit: contain;
}

.details-header-info {
  flex: 1;
}

.details-header-info h2 {
  margin-top: 0;
  margin-bottom: 10px;
}

.details-meta {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.details-description,
.details-features,
.details-system-requirements {
  margin-bottom: 20px;
}

.details-description h3,
.details-features h3,
.details-system-requirements h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
}

.details-features ul {
  padding-left: 20px;
}

.details-features li {
  margin-bottom: 5px;
}
</style> 