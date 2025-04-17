<template>
  <div class="settings-container">
    <div class="page-header">
      <h1>系统设置</h1>
      <el-button type="primary" @click="saveSettings">
        <el-icon><Check /></el-icon>保存设置
      </el-button>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="常规设置" name="general">
        <el-card class="settings-card">
          <el-form 
            :model="generalSettings" 
            label-width="160px" 
            label-position="left"
            :rules="generalRules"
            ref="generalFormRef"
          >
            <el-form-item label="应用名称" prop="appName">
              <el-input v-model="generalSettings.appName" placeholder="应用显示名称" />
            </el-form-item>
            <el-form-item label="项目默认路径" prop="projectsPath">
              <el-input v-model="generalSettings.projectsPath">
                <template #append>
                  <el-button @click="selectDirectory('projects')">
                    <el-icon><Folder /></el-icon>浏览
                  </el-button>
                </template>
              </el-input>
              <div class="form-help">新建站点时的默认根目录</div>
            </el-form-item>
            <el-form-item label="数据目录" prop="dataPath">
              <el-input v-model="generalSettings.dataPath">
                <template #append>
                  <el-button @click="selectDirectory('data')">
                    <el-icon><Folder /></el-icon>浏览
                  </el-button>
                </template>
              </el-input>
              <div class="form-help">用于存储数据库文件、日志等数据</div>
            </el-form-item>
            <el-form-item label="默认主机名" prop="hostname">
              <el-input v-model="generalSettings.hostname" placeholder="如：localhost" />
            </el-form-item>
            <el-form-item label="启动时自动检查更新">
              <el-switch v-model="generalSettings.checkUpdates" />
            </el-form-item>
            <el-form-item label="开机自启动">
              <el-switch v-model="generalSettings.startWithSystem" />
            </el-form-item>
            <el-form-item label="主题">
              <el-radio-group v-model="generalSettings.theme">
                <el-radio label="light">浅色</el-radio>
                <el-radio label="dark">深色</el-radio>
                <el-radio label="system">跟随系统</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="界面语言">
              <el-select v-model="generalSettings.language">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="PHP设置" name="php">
        <el-card class="settings-card">
          <el-form 
            :model="phpSettings" 
            label-width="160px"
            label-position="left"
          >
            <el-form-item label="默认PHP版本">
              <el-select v-model="phpSettings.defaultVersion">
                <el-option 
                  v-for="version in phpVersions" 
                  :key="version.value" 
                  :label="version.label" 
                  :value="version.value" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="PHP扩展目录">
              <el-input v-model="phpSettings.extensionsDir">
                <template #append>
                  <el-button @click="selectDirectory('phpExt')">
                    <el-icon><Folder /></el-icon>浏览
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="默认上传大小限制">
              <el-input-number v-model="phpSettings.uploadLimit" :min="1" :max="1000" />
              <span class="unit-label">MB</span>
            </el-form-item>
            <el-form-item label="默认内存限制">
              <el-input-number v-model="phpSettings.memoryLimit" :min="8" :max="2048" />
              <span class="unit-label">MB</span>
            </el-form-item>
            <el-form-item label="默认执行时间">
              <el-input-number v-model="phpSettings.maxExecutionTime" :min="5" :max="3600" />
              <span class="unit-label">秒</span>
            </el-form-item>
            <el-form-item label="错误显示">
              <el-switch v-model="phpSettings.displayErrors" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="网络设置" name="network">
        <el-card class="settings-card">
          <el-form 
            :model="networkSettings" 
            label-width="160px"
            label-position="left"
          >
            <el-form-item label="HTTP端口" prop="httpPort">
              <el-input-number v-model="networkSettings.httpPort" :min="1" :max="65535" />
              <div class="form-help">默认为80，修改后需要重启所有服务</div>
            </el-form-item>
            <el-form-item label="HTTPS端口" prop="httpsPort">
              <el-input-number v-model="networkSettings.httpsPort" :min="1" :max="65535" />
              <div class="form-help">默认为443，修改后需要重启所有服务</div>
            </el-form-item>
            <el-form-item label="MySQL端口" prop="mysqlPort">
              <el-input-number v-model="networkSettings.mysqlPort" :min="1" :max="65535" />
              <div class="form-help">默认为3306，修改后需要重启数据库服务</div>
            </el-form-item>
            <el-form-item label="代理设置">
              <el-radio-group v-model="networkSettings.proxyType">
                <el-radio label="none">不使用代理</el-radio>
                <el-radio label="system">使用系统代理</el-radio>
                <el-radio label="manual">手动设置</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="代理服务器" v-if="networkSettings.proxyType === 'manual'">
              <el-input v-model="networkSettings.proxyHost" placeholder="代理服务器地址" />
            </el-form-item>
            <el-form-item label="代理端口" v-if="networkSettings.proxyType === 'manual'">
              <el-input-number v-model="networkSettings.proxyPort" :min="1" :max="65535" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="高级设置" name="advanced">
        <el-card class="settings-card">
          <el-form 
            :model="advancedSettings" 
            label-width="160px"
            label-position="left"
          >
            <el-form-item label="服务状态检查间隔">
              <el-input-number v-model="advancedSettings.statusCheckInterval" :min="5" :max="600" />
              <span class="unit-label">秒</span>
            </el-form-item>
            <el-form-item label="日志级别">
              <el-select v-model="advancedSettings.logLevel">
                <el-option label="错误" value="error" />
                <el-option label="警告" value="warning" />
                <el-option label="信息" value="info" />
                <el-option label="调试" value="debug" />
              </el-select>
            </el-form-item>
            <el-form-item label="日志保留天数">
              <el-input-number v-model="advancedSettings.logRetentionDays" :min="1" :max="365" />
              <span class="unit-label">天</span>
            </el-form-item>
            <el-form-item label="备份目录">
              <el-input v-model="advancedSettings.backupDir">
                <template #append>
                  <el-button @click="selectDirectory('backup')">
                    <el-icon><Folder /></el-icon>浏览
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="自动备份频率">
              <el-select v-model="advancedSettings.backupFrequency">
                <el-option label="从不" value="never" />
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>
            <el-form-item label="删除前备份网站">
              <el-switch v-model="advancedSettings.backupBeforeDelete" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { Check, Folder } from '@element-plus/icons-vue';

// 当前活动Tab
const activeTab = ref('general');

// 常规设置表单引用
const generalFormRef = ref(null);

// 常规设置
const generalSettings = reactive({
  appName: 'PHP环境管理器',
  projectsPath: 'D:\\www',
  dataPath: 'D:\\phpmaster\\data',
  hostname: 'localhost',
  checkUpdates: true,
  startWithSystem: false,
  theme: 'light',
  language: 'zh-CN'
});

// 常规设置验证规则
const generalRules = {
  appName: [
    { required: true, message: '请输入应用名称', trigger: 'blur' }
  ],
  projectsPath: [
    { required: true, message: '请输入项目默认路径', trigger: 'blur' }
  ],
  dataPath: [
    { required: true, message: '请输入数据目录', trigger: 'blur' }
  ],
  hostname: [
    { required: true, message: '请输入默认主机名', trigger: 'blur' }
  ]
};

// PHP版本列表
const phpVersions = [
  { value: '8.2', label: 'PHP 8.2' },
  { value: '8.1', label: 'PHP 8.1' },
  { value: '8.0', label: 'PHP 8.0' },
  { value: '7.4', label: 'PHP 7.4' },
  { value: '7.3', label: 'PHP 7.3' }
];

// PHP设置
const phpSettings = reactive({
  defaultVersion: '8.1',
  extensionsDir: 'D:\\phpmaster\\extensions',
  uploadLimit: 50,
  memoryLimit: 128,
  maxExecutionTime: 30,
  displayErrors: true
});

// 网络设置
const networkSettings = reactive({
  httpPort: 80,
  httpsPort: 443,
  mysqlPort: 3306,
  proxyType: 'none',
  proxyHost: '',
  proxyPort: 8080
});

// 高级设置
const advancedSettings = reactive({
  statusCheckInterval: 30,
  logLevel: 'info',
  logRetentionDays: 30,
  backupDir: 'D:\\phpmaster\\backups',
  backupFrequency: 'weekly',
  backupBeforeDelete: true
});

// 选择目录
const selectDirectory = (type) => {
  // 这里应该调用Electron的选择目录对话框
  ElMessage.info(`打开目录选择器(${type})`);
  // 根据选择类型更新不同的设置
  switch (type) {
    case 'projects':
      // 模拟更新路径
      generalSettings.projectsPath = 'D:\\selected-path\\www';
      break;
    case 'data':
      generalSettings.dataPath = 'D:\\selected-path\\data';
      break;
    case 'phpExt':
      phpSettings.extensionsDir = 'D:\\selected-path\\extensions';
      break;
    case 'backup':
      advancedSettings.backupDir = 'D:\\selected-path\\backups';
      break;
  }
};

// 保存设置
const saveSettings = async () => {
  try {
    // 验证常规设置表单
    await generalFormRef.value.validate();
    
    // 在这里应该调用保存设置的API
    ElMessage.success('设置已保存');
    
    // 如果有些设置需要重启应用才能生效，应该提示用户
    if (generalSettings.language !== 'zh-CN' || generalSettings.theme !== 'light') {
      ElMessage.warning('某些设置需要重启应用后生效');
    }
  } catch (error) {
    ElMessage.error('表单验证失败，请检查填写的内容');
  }
};
</script>

<style scoped>
.settings-container {
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

.settings-card {
  margin-bottom: 20px;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.unit-label {
  margin-left: 8px;
  color: #606266;
}
</style> 