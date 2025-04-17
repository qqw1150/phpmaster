<template>
  <el-dialog
    v-model="dialogVisible"
    title="安装PHP版本"
    width="650px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 30px">
      <el-step title="选择版本" />
      <el-step title="安装选项" />
      <el-step title="安装进度" />
    </el-steps>

    <!-- 步骤1: 选择PHP版本 -->
    <div v-if="activeStep === 0" class="step-content">
      <p class="step-description">请选择要安装的PHP版本</p>
      
      <el-radio-group v-model="selectedPhpVersion" style="margin-top: 20px">
        <el-scrollbar height="350px">
          <div class="php-version-list">
            <el-radio-button v-for="version in availableVersions" :key="version.version" :label="version.version">
              {{ version.version }}
            </el-radio-button>
          </div>
        </el-scrollbar>
      </el-radio-group>
      
      <div v-if="selectedPhpVersion" class="version-details">
        <h4>版本信息</h4>
        <p><strong>版本:</strong> {{ selectedPhpVersion }}</p>
        <p><strong>发布日期:</strong> {{ getVersionDetails().releaseDate || '未知' }}</p>
        <p><strong>支持状态:</strong> 
          <el-tag :type="getVersionDetails().supported ? 'success' : 'danger'">
            {{ getVersionDetails().supported ? '支持中' : '已停止支持' }}
          </el-tag>
        </p>
        <p><strong>文件大小:</strong> {{ getVersionDetails().size || '未知' }}</p>
      </div>
    </div>

    <!-- 步骤2: 安装选项 -->
    <div v-if="activeStep === 1" class="step-content">
      <p class="step-description">配置PHP安装选项</p>
      
      <el-form :model="installOptions" label-width="180px" style="margin-top: 20px">
        <el-form-item label="安装路径">
          <el-input v-model="installOptions.installPath" placeholder="选择PHP安装路径">
            <template #append>
              <el-button @click="selectInstallPath">选择...</el-button>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="设为默认版本">
          <el-switch v-model="installOptions.setAsDefault" />
        </el-form-item>
        
        <el-form-item label="安装常用扩展">
          <el-switch v-model="installOptions.installCommonExtensions" />
        </el-form-item>
        
        <el-collapse v-if="installOptions.installCommonExtensions" style="margin-bottom: 20px">
          <el-collapse-item title="选择要安装的扩展" name="extensions">
            <el-checkbox-group v-model="installOptions.selectedExtensions">
              <el-checkbox v-for="ext in commonExtensions" :key="ext.name" :label="ext.name">
                {{ ext.name }} - {{ ext.description }}
              </el-checkbox>
            </el-checkbox-group>
          </el-collapse-item>
        </el-collapse>
        
        <el-form-item label="添加到环境变量">
          <el-switch v-model="installOptions.addToPath" />
        </el-form-item>
        
        <el-form-item label="安装后打开phpinfo">
          <el-switch v-model="installOptions.openPhpInfoAfterInstall" />
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤3: 安装进度 -->
    <div v-if="activeStep === 2" class="step-content">
      <p class="step-description">安装PHP {{ selectedPhpVersion }}</p>
      
      <div class="install-progress">
        <el-progress 
          :percentage="installProgress" 
          :status="installStatus === 'error' ? 'exception' : installProgress === 100 ? 'success' : ''"
          :stroke-width="20"
        />
        
        <div class="progress-info">
          <span>{{ installStage }}</span>
          <span v-if="installStatus === 'running'">{{ installProgress }}%</span>
          <span v-if="installStatus === 'success'">安装完成</span>
          <span v-if="installStatus === 'error'" class="error-text">安装失败</span>
        </div>
      </div>
      
      <div class="install-log">
        <p class="log-header">安装日志:</p>
        <el-scrollbar height="200px">
          <div ref="logContent" class="log-content">
            <p v-for="(log, index) in installLogs" :key="index" :class="{ 'error-log': log.type === 'error' }">
              {{ log.time }} - {{ log.message }}
            </p>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="activeStep > 0 && activeStep < 2" @click="prevStep">上一步</el-button>
        <el-button 
          v-if="activeStep < 2" 
          type="primary" 
          @click="nextStep" 
          :disabled="activeStep === 0 && !selectedPhpVersion"
        >
          下一步
        </el-button>
        <el-button 
          v-if="activeStep === 2 && installStatus === 'success'" 
          type="success" 
          @click="finishInstallation"
        >
          完成
        </el-button>
        <el-button 
          v-if="activeStep === 2 && installStatus === 'error'" 
          type="danger" 
          @click="retryInstallation"
        >
          重试
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { phpAPI } from '../services/api';

// 定义属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['update:visible', 'installed']);

// 对话框可见状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

// 步骤状态
const activeStep = ref(0);
const selectedPhpVersion = ref('');
const installOptions = ref({
  installPath: 'D:\\phpmaster\\php\\',
  setAsDefault: false,
  installCommonExtensions: true,
  selectedExtensions: ['mysqli', 'pdo_mysql', 'mbstring', 'gd', 'curl', 'openssl', 'zip'],
  addToPath: true,
  openPhpInfoAfterInstall: false
});

// 可用的PHP版本
const availableVersions = ref([]);
// 常用扩展列表
const commonExtensions = ref([
  { name: 'mysqli', description: 'MySQL改进版扩展' },
  { name: 'pdo_mysql', description: 'MySQL PDO驱动' },
  { name: 'mbstring', description: '多字节字符串扩展' },
  { name: 'gd', description: 'GD图形库' },
  { name: 'curl', description: 'cURL支持' },
  { name: 'openssl', description: 'OpenSSL扩展' },
  { name: 'zip', description: 'Zip压缩支持' },
  { name: 'redis', description: 'Redis缓存支持' },
  { name: 'xdebug', description: '调试和性能分析工具' }
]);

// 安装状态
const installProgress = ref(0);
const installStatus = ref('pending'); // pending, running, success, error
const installStage = ref('准备中...');
const installLogs = ref([]);
const logContent = ref(null);

// 监听对话框可见性变化
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    resetDialog();
    await loadAvailableVersions();
  }
});

// 重置对话框
const resetDialog = () => {
  activeStep.value = 0;
  selectedPhpVersion.value = '';
  installOptions.value = {
    installPath: 'D:\\phpmaster\\php\\',
    setAsDefault: false,
    installCommonExtensions: true,
    selectedExtensions: ['mysqli', 'pdo_mysql', 'mbstring', 'gd', 'curl', 'openssl', 'zip'],
    addToPath: true,
    openPhpInfoAfterInstall: false
  };
  installProgress.value = 0;
  installStatus.value = 'pending';
  installStage.value = '准备中...';
  installLogs.value = [];
};

// 加载可用的PHP版本
const loadAvailableVersions = async () => {
  try {
    const response = await phpAPI.getAvailableVersions();
    availableVersions.value = response || [];
  } catch (error) {
    ElMessage.error('加载可用PHP版本失败: ' + (error.message || '未知错误'));
    availableVersions.value = [
      { version: 'PHP 8.2.0', releaseDate: '2022-12-08', supported: true, size: '28MB' },
      { version: 'PHP 8.1.13', releaseDate: '2022-11-10', supported: true, size: '27MB' },
      { version: 'PHP 8.0.26', releaseDate: '2022-11-10', supported: true, size: '26MB' },
      { version: 'PHP 7.4.33', releaseDate: '2022-10-15', supported: false, size: '24MB' },
      { version: 'PHP 7.3.33', releaseDate: '2021-10-15', supported: false, size: '23MB' }
    ];
  }
};

// 获取选中版本的详细信息
const getVersionDetails = () => {
  const version = availableVersions.value.find(v => v.version === selectedPhpVersion.value);
  return version || {};
};

// 选择安装路径
const selectInstallPath = () => {
  // 这里应该调用系统文件选择器，但在前端无法直接访问文件系统
  // 可以通过后端API实现，或者让用户手动输入
  ElMessage.info('请手动输入安装路径或使用默认路径');
};

// 下一步
const nextStep = () => {
  if (activeStep.value === 0 && !selectedPhpVersion.value) {
    ElMessage.warning('请选择一个PHP版本');
    return;
  }
  
  if (activeStep.value === 1) {
    startInstallation();
  } else {
    activeStep.value++;
  }
};

// 上一步
const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--;
  }
};

// 开始安装
const startInstallation = () => {
  activeStep.value = 2;
  installStatus.value = 'running';
  installProgress.value = 0;
  installStage.value = '准备安装...';
  installLogs.value = [];
  
  // 添加初始日志
  addLog(`开始安装 ${selectedPhpVersion.value}`);
  addLog(`安装路径: ${installOptions.value.installPath}`);
  
  // 模拟安装过程
  simulateInstallation();
  
  // 实际项目中应该调用安装API
  /*
  phpAPI.installVersion({
    version: selectedPhpVersion.value,
    options: installOptions.value
  }).then(response => {
    handleInstallationSuccess(response);
  }).catch(error => {
    handleInstallationError(error);
  });
  */
};

// 模拟安装过程（仅用于演示）
const simulateInstallation = () => {
  const steps = [
    { progress: 10, message: '下载PHP安装包...' },
    { progress: 30, message: '验证安装包完整性...' },
    { progress: 40, message: '解压安装文件...' },
    { progress: 60, message: '配置PHP环境...' },
    { progress: 70, message: '安装PHP核心组件...' },
    { progress: 85, message: '安装扩展组件...' },
    { progress: 95, message: '完成安装并验证...' },
    { progress: 100, message: '安装完成' }
  ];
  
  let stepIndex = 0;
  
  const interval = setInterval(() => {
    if (stepIndex < steps.length) {
      const step = steps[stepIndex];
      installProgress.value = step.progress;
      installStage.value = step.message;
      addLog(step.message);
      
      stepIndex++;
      
      // 模拟安装扩展
      if (step.progress === 85 && installOptions.value.installCommonExtensions) {
        installOptions.value.selectedExtensions.forEach(ext => {
          setTimeout(() => {
            addLog(`安装扩展: ${ext}`);
          }, 300 * Math.random());
        });
      }
      
      if (step.progress === 100) {
        clearInterval(interval);
        handleInstallationSuccess();
      }
    } else {
      clearInterval(interval);
    }
  }, 1000);
  
  // 滚动日志到底部
  watch(installLogs, () => {
    nextTick(() => {
      if (logContent.value) {
        const container = logContent.value.parentElement.parentElement;
        container.scrollTop = container.scrollHeight;
      }
    });
  });
};

// 添加日志
const addLog = (message, type = 'info') => {
  const now = new Date();
  const time = now.toLocaleTimeString();
  installLogs.value.push({ time, message, type });
};

// 处理安装成功
const handleInstallationSuccess = () => {
  installStatus.value = 'success';
  addLog('PHP安装成功!', 'success');
  
  if (installOptions.value.setAsDefault) {
    addLog('已将 ' + selectedPhpVersion.value + ' 设置为默认PHP版本');
  }
  
  if (installOptions.value.addToPath) {
    addLog('已将PHP添加到系统环境变量');
  }
};

// 处理安装错误
const handleInstallationError = (error) => {
  installStatus.value = 'error';
  addLog(`安装失败: ${error.message || '未知错误'}`, 'error');
};

// 重试安装
const retryInstallation = () => {
  activeStep.value = 0;
  installStatus.value = 'pending';
};

// 完成安装
const finishInstallation = () => {
  ElMessage.success(`${selectedPhpVersion.value} 安装成功`);
  emit('installed', {
    version: selectedPhpVersion.value,
    path: installOptions.value.installPath + selectedPhpVersion.value.replace('PHP ', '')
  });
  dialogVisible.value = false;
  
  // 如果勾选了安装后打开phpinfo
  if (installOptions.value.openPhpInfoAfterInstall) {
    window.open(`/phpinfo.php?version=${selectedPhpVersion.value}`, '_blank');
  }
};

// 关闭对话框
const handleClose = () => {
  if (installStatus.value === 'running') {
    ElMessage.warning('安装正在进行中，无法取消');
    return;
  }
  
  dialogVisible.value = false;
};
</script>

<style scoped>
.step-content {
  min-height: 400px;
}

.step-description {
  font-size: 16px;
  color: #606266;
  margin-bottom: 15px;
}

.php-version-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}

.version-details {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  background-color: #fafafa;
}

.version-details h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-weight: 500;
}

.install-progress {
  margin: 30px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: #606266;
}

.install-log {
  margin-top: 20px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  background-color: #fafafa;
}

.log-header {
  padding: 10px 15px;
  margin: 0;
  border-bottom: 1px solid #eaeaea;
  font-weight: 500;
}

.log-content {
  padding: 10px 15px;
  font-family: monospace;
}

.log-content p {
  margin: 5px 0;
  white-space: pre-wrap;
}

.error-log {
  color: #f56c6c;
}

.error-text {
  color: #f56c6c;
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 