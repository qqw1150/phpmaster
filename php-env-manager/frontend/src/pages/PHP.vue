<template>
  <div class="php-container">
    <div class="page-header">
      <h1>PHP管理</h1>
      <div class="page-tools">
        <el-button type="primary" @click="showInstallDialog">
          <el-icon><Plus /></el-icon>安装PHP版本
        </el-button>
        <el-button type="success" @click="refreshPHPInfo" :loading="loading">
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
          
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>正在加载PHP版本信息...</span>
          </div>
          
          <el-empty v-else-if="phpVersions.length === 0" description="暂无已安装的PHP版本">
            <el-button type="primary" @click="showInstallDialog">安装PHP版本</el-button>
          </el-empty>
          
          <el-table v-else :data="phpVersions" border stripe style="width: 100%">
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
                  :loading="scope.row.loading"
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
                  :loading="scope.row.loading"
                >
                  phpinfo
                </el-button>
                <el-button 
                  size="small" 
                  type="success" 
                  @click="editConfig(scope.row)"
                  :loading="scope.row.loading"
                >
                  配置文件
                </el-button>
                <el-button 
                  size="small" 
                  type="warning" 
                  @click="togglePHPStatus(scope.row)"
                  :loading="scope.row.loading"
                >
                  {{ scope.row.enabled ? '禁用' : '启用' }}
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="uninstallPHP(scope.row)"
                  :loading="scope.row.loading"
                  :disabled="scope.row.isDefault"
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
                  @change="handleVersionChange"
                >
                  <el-option 
                    v-for="version in phpVersions" 
                    :key="version.version" 
                    :label="version.version" 
                    :value="version.version" 
                    :disabled="!version.enabled"
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
            <el-button 
              type="primary" 
              @click="showExtensionInstallDialog" 
              :disabled="!selectedVersion || loading"
            >
              <el-icon><Plus /></el-icon>安装扩展
            </el-button>
            <el-button 
              type="success" 
              @click="refreshExtensions" 
              :loading="extensionsLoading"
              :disabled="!selectedVersion"
            >
              <el-icon><Refresh /></el-icon>刷新扩展列表
            </el-button>
          </div>
          
          <div v-if="extensionsLoading" class="loading-container">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>正在加载扩展信息...</span>
          </div>
          
          <el-empty 
            v-else-if="!selectedVersion" 
            description="请先选择一个PHP版本"
          />
          
          <el-empty 
            v-else-if="extensions.length === 0" 
            description="暂无扩展"
          >
            <el-button type="primary" @click="showExtensionInstallDialog">安装扩展</el-button>
          </el-empty>
          
          <el-table v-else :data="filteredExtensions" border stripe style="width: 100%">
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
                  :loading="scope.row.loading"
                >
                  {{ scope.row.enabled ? '禁用' : '启用' }}
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="uninstallExtension(scope.row)"
                  :loading="scope.row.loading"
                >
                  卸载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- PHP安装对话框 -->
    <PHPInstallDialog
      v-model:visible="installDialogVisible"
      @installed="handlePHPInstalled"
    />
    
    <!-- 扩展安装对话框 -->
    <ExtensionInstallDialog
      v-model:visible="extensionInstallDialogVisible"
      :pre-selected-php-version="selectedVersion"
      @installed="handleExtensionInstalled"
    />
    
    <!-- PHP配置编辑器 -->
    <PHPConfigEditor
      v-if="configEditorVisible"
      v-model:visible="configEditorVisible"
      :php-version="currentEditingPHP"
      :title="`${currentEditingPHP} 配置编辑器`"
      @saved="handleConfigSaved"
    />
    
    <!-- PHP信息查看器 -->
    <PHPInfoViewer
      v-if="phpInfoViewerVisible"
      v-model:visible="phpInfoViewerVisible"
      :php-version="currentViewingPHP"
      :php-info-url="phpInfoUrl"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Search, Loading } from '@element-plus/icons-vue';
import { phpAPI, extensionAPI } from '../services/api';
import PHPInstallDialog from '../components/PHPInstallDialog.vue';
import ExtensionInstallDialog from '../components/ExtensionInstallDialog.vue';
import PHPConfigEditor from '../components/PHPConfigEditor.vue';
import PHPInfoViewer from '../components/PHPInfoViewer.vue';

// 当前活动Tab
const activeTab = ref('versions');

// 加载状态
const loading = ref(false);
const extensionsLoading = ref(false);

// PHP版本列表
const phpVersions = ref([]);

// 当前选择的PHP版本（用于扩展管理）
const selectedVersion = ref('');

// 扩展搜索关键词
const extensionSearchQuery = ref('');

// PHP扩展列表
const extensions = ref([]);

// 对话框控制
const installDialogVisible = ref(false);
const extensionInstallDialogVisible = ref(false);
const configEditorVisible = ref(false);
const phpInfoViewerVisible = ref(false);

// 当前编辑/查看的PHP版本
const currentEditingPHP = ref('');
const currentViewingPHP = ref('');
const phpInfoUrl = ref('');

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

// 监听选择的PHP版本变化
watch(selectedVersion, (newValue) => {
  if (newValue) {
    loadExtensions(newValue);
  } else {
    extensions.value = [];
  }
});

// 加载PHP版本列表
const loadPHPVersions = async () => {
  loading.value = true;
  try {
    const response = await phpAPI.getVersions();
    phpVersions.value = response || [];
    
    // 如果没有选中的版本但有可用版本，默认选择启用的第一个版本
    if (!selectedVersion.value && phpVersions.value.length > 0) {
      const enabledVersion = phpVersions.value.find(v => v.enabled);
      if (enabledVersion) {
        selectedVersion.value = enabledVersion.version;
      }
    }
  } catch (error) {
    ElMessage.error('加载PHP版本列表失败: ' + (error.message || '未知错误'));
    phpVersions.value = [];
  } finally {
    loading.value = false;
  }
};

// 加载扩展列表
const loadExtensions = async (phpVersion) => {
  if (!phpVersion) return;
  
  extensionsLoading.value = true;
  try {
    const response = await extensionAPI.getExtensions(phpVersion);
    extensions.value = response || [];
  } catch (error) {
    ElMessage.error('加载扩展列表失败: ' + (error.message || '未知错误'));
    extensions.value = [];
  } finally {
    extensionsLoading.value = false;
  }
};

// 刷新PHP信息
const refreshPHPInfo = async () => {
  await loadPHPVersions();
  ElMessage.success('PHP信息已更新');
};

// 处理PHP版本变化
const handleVersionChange = (newVersion) => {
  selectedVersion.value = newVersion;
};

// 刷新扩展列表
const refreshExtensions = async () => {
  if (!selectedVersion.value) {
    ElMessage.warning('请先选择一个PHP版本');
    return;
  }
  
  await loadExtensions(selectedVersion.value);
  ElMessage.success('扩展列表已更新');
};

// 显示PHP安装对话框
const showInstallDialog = () => {
  installDialogVisible.value = true;
};

// 显示扩展安装对话框
const showExtensionInstallDialog = () => {
  if (!selectedVersion.value) {
    ElMessage.warning('请先选择一个PHP版本');
    return;
  }
  
  extensionInstallDialogVisible.value = true;
};

// 查看PHP信息
const viewPHPInfo = (php) => {
  setRowLoading(php, true);
  
  currentViewingPHP.value = php.version;
  
  // 如果后端提供了直接访问phpinfo的URL，使用URL方式
  // phpInfoUrl.value = `/api/php/versions/${encodeURIComponent(php.version)}/phpinfo`;
  phpInfoUrl.value = ''; // 不使用URL方式，而是通过API获取HTML
  
  phpInfoViewerVisible.value = true;
  
  setRowLoading(php, false);
};

// 编辑PHP配置文件
const editConfig = (php) => {
  setRowLoading(php, true);
  
  currentEditingPHP.value = php.version;
  configEditorVisible.value = true;
  
  setRowLoading(php, false);
};

// 切换PHP版本的启用状态
const togglePHPStatus = async (php) => {
  const newStatus = !php.enabled;
  const action = newStatus ? '启用' : '禁用';
  
  try {
    await ElMessageBox.confirm(
      `确定要${action} ${php.version} 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    setRowLoading(php, true);
    
    // 调用API切换状态
    await phpAPI.toggleVersionStatus(php.version, newStatus);
    
    // 更新本地状态
    php.enabled = newStatus;
    ElMessage.success(`${php.version} 已${action}`);
    
    // 如果禁用了当前选中的扩展管理版本，需要重置
    if (!newStatus && selectedVersion.value === php.version) {
      selectedVersion.value = '';
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败: ${error.message || '未知错误'}`);
    }
  } finally {
    setRowLoading(php, false);
  }
};

// 设置默认PHP版本
const setDefaultVersion = async (php) => {
  try {
    await ElMessageBox.confirm(
      `确定要将 ${php.version} 设置为默认PHP版本吗？`,
      '设置默认版本',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    setRowLoading(php, true);
    
    // 调用API设置默认版本
    await phpAPI.setDefaultVersion(php.version);
    
    // 更新本地状态
    phpVersions.value.forEach(v => {
      v.isDefault = v.version === php.version;
    });
    
    ElMessage.success(`${php.version} 已设置为默认PHP版本`);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`设置默认版本失败: ${error.message || '未知错误'}`);
    }
  } finally {
    setRowLoading(php, false);
  }
};

// 卸载PHP版本
const uninstallPHP = async (php) => {
  if (php.isDefault) {
    ElMessage.error('无法卸载默认PHP版本，请先设置其他版本为默认');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要卸载 ${php.version} 吗？这将删除该版本的所有文件和配置。`,
      '卸载确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    );
    
    setRowLoading(php, true);
    
    // 调用卸载API
    await phpAPI.uninstallVersion(php.version);
    
    // 从列表中移除
    phpVersions.value = phpVersions.value.filter(v => v.version !== php.version);
    
    // 如果卸载的是当前选中的扩展管理版本，需要重置
    if (selectedVersion.value === php.version) {
      selectedVersion.value = '';
    }
    
    ElMessage.success(`${php.version} 已成功卸载`);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`卸载失败: ${error.message || '未知错误'}`);
    }
  } finally {
    setRowLoading(php, false);
  }
};

// 切换扩展启用状态
const toggleExtension = async (extension) => {
  const newStatus = !extension.enabled;
  const action = newStatus ? '启用' : '禁用';
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}扩展 ${extension.name} 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    setRowLoading(extension, true);
    
    // 调用API切换状态
    await extensionAPI.toggleExtensionStatus(selectedVersion.value, extension.name, newStatus);
    
    // 更新本地状态
    extension.enabled = newStatus;
    ElMessage.success(`扩展 ${extension.name} 已${action}`);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}扩展失败: ${error.message || '未知错误'}`);
    }
  } finally {
    setRowLoading(extension, false);
  }
};

// 卸载扩展
const uninstallExtension = async (extension) => {
  try {
    await ElMessageBox.confirm(
      `确定要卸载扩展 ${extension.name} 吗？`,
      '卸载确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    );
    
    setRowLoading(extension, true);
    
    // 调用API卸载扩展
    await extensionAPI.uninstallExtension(selectedVersion.value, extension.name);
    
    // 从列表中移除
    extensions.value = extensions.value.filter(ext => ext.name !== extension.name);
    
    ElMessage.success(`扩展 ${extension.name} 已成功卸载`);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`卸载扩展失败: ${error.message || '未知错误'}`);
    }
  } finally {
    setRowLoading(extension, false);
  }
};

// 处理PHP安装完成
const handlePHPInstalled = (phpInfo) => {
  // 刷新PHP版本列表
  loadPHPVersions();
  ElMessage.success(`${phpInfo.version} 安装成功`);
};

// 处理扩展安装完成
const handleExtensionInstalled = (extensionInfo) => {
  // 刷新扩展列表
  if (selectedVersion.value === extensionInfo.phpVersion) {
    loadExtensions(selectedVersion.value);
  }
  ElMessage.success(`扩展 ${extensionInfo.extensionName} 安装成功`);
};

// 处理配置保存完成
const handleConfigSaved = () => {
  ElMessage.success('配置保存成功');
};

// 设置行加载状态（用于按钮loading效果）
const setRowLoading = (row, isLoading) => {
  row.loading = isLoading;
};

// 组件挂载时加载数据
onMounted(() => {
  loadPHPVersions();
});
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
}

.loading-icon {
  font-size: 24px;
  margin-bottom: 10px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 