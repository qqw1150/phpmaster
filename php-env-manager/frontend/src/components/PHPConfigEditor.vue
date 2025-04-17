<template>
  <div class="config-editor">
    <div class="editor-header">
      <h3>{{ title }}</h3>
      <div class="editor-actions">
        <el-button type="primary" size="small" @click="saveConfig" :loading="saving">
          <el-icon><Check /></el-icon>保存
        </el-button>
        <el-button type="default" size="small" @click="$emit('close')">
          <el-icon><Close /></el-icon>关闭
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeConfigTab">
      <el-tab-pane label="配置文件" name="php-ini">
        <div class="config-file-select">
          <el-select v-model="currentConfigFile" placeholder="选择配置文件">
            <el-option 
              v-for="file in configFiles" 
              :key="file.path" 
              :label="file.name" 
              :value="file.path" 
            />
          </el-select>
        </div>
        
        <div class="config-editor-content">
          <el-input
            v-model="configContent"
            type="textarea"
            :rows="20"
            placeholder="配置文件内容"
            :disabled="loading"
          ></el-input>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="常用设置" name="common-settings">
        <el-form :model="commonSettings" label-width="200px">
          <el-form-item label="内存限制">
            <el-input v-model="commonSettings.memory_limit" placeholder="例如: 128M">
              <template #append>
                <el-tooltip content="PHP脚本可以使用的最大内存">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="最大执行时间">
            <el-input v-model="commonSettings.max_execution_time" placeholder="例如: 30">
              <template #append>
                <span>秒</span>
                <el-tooltip content="PHP脚本的最大执行时间">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="上传文件最大尺寸">
            <el-input v-model="commonSettings.upload_max_filesize" placeholder="例如: 2M">
              <template #append>
                <el-tooltip content="允许上传的最大文件尺寸">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="POST数据最大尺寸">
            <el-input v-model="commonSettings.post_max_size" placeholder="例如: 8M">
              <template #append>
                <el-tooltip content="允许的POST数据最大尺寸">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="显示错误">
            <el-switch v-model="commonSettings.display_errors" />
          </el-form-item>
          
          <el-form-item label="日志错误">
            <el-switch v-model="commonSettings.log_errors" />
          </el-form-item>
          
          <el-form-item label="错误日志路径">
            <el-input v-model="commonSettings.error_log" placeholder="错误日志文件路径">
              <template #append>
                <el-tooltip content="错误日志的保存路径">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="日期时区">
            <el-select v-model="commonSettings.date_timezone" style="width: 100%">
              <el-option label="Asia/Shanghai" value="Asia/Shanghai" />
              <el-option label="UTC" value="UTC" />
              <el-option label="America/New_York" value="America/New_York" />
              <el-option label="Europe/London" value="Europe/London" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    
    <div v-if="loading" class="loading-overlay">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Check, Close, InfoFilled, Loading } from '@element-plus/icons-vue';
import { phpAPI } from '../services/api';

// 接收的属性
const props = defineProps({
  // PHP版本
  phpVersion: {
    type: String,
    required: true
  },
  // 对话框标题
  title: {
    type: String,
    default: 'PHP配置编辑器'
  }
});

// 定义事件
const emit = defineEmits(['close', 'saved']);

// 状态变量
const loading = ref(false);
const saving = ref(false);
const activeConfigTab = ref('php-ini');
const configFiles = ref([]);
const currentConfigFile = ref('');
const configContent = ref('');
const originalConfig = ref(''); // 用于跟踪变更

// 常用设置表单
const commonSettings = ref({
  memory_limit: '128M',
  max_execution_time: '30',
  upload_max_filesize: '2M',
  post_max_size: '8M',
  display_errors: true,
  log_errors: true,
  error_log: '',
  date_timezone: 'Asia/Shanghai'
});

// 配置文件是否有变更
const configChanged = computed(() => {
  return configContent.value !== originalConfig.value;
});

// 监视配置文件变化
watch(currentConfigFile, async (newValue) => {
  if (newValue) {
    await loadConfigFile(newValue);
  }
});

// 加载PHP配置信息
const loadConfig = async () => {
  loading.value = true;
  try {
    const response = await phpAPI.getConfig(props.phpVersion);
    configFiles.value = response.files || [];
    
    // 如果有配置文件，默认选择第一个
    if (configFiles.value.length > 0) {
      currentConfigFile.value = configFiles.value[0].path;
      await loadConfigFile(currentConfigFile.value);
    }
    
    // 加载常用设置
    if (response.commonSettings) {
      commonSettings.value = { ...commonSettings.value, ...response.commonSettings };
    }
  } catch (error) {
    ElMessage.error('加载配置失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 加载指定配置文件内容
const loadConfigFile = async (filePath) => {
  loading.value = true;
  try {
    const response = await phpAPI.getConfig(props.phpVersion, filePath);
    configContent.value = response.content || '';
    originalConfig.value = configContent.value; // 保存原始内容用于比较
  } catch (error) {
    ElMessage.error('加载配置文件失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 保存配置文件
const saveConfig = async () => {
  saving.value = true;
  try {
    if (activeConfigTab.value === 'php-ini') {
      // 保存配置文件内容
      await phpAPI.saveConfig(props.phpVersion, {
        filePath: currentConfigFile.value,
        content: configContent.value
      });
    } else if (activeConfigTab.value === 'common-settings') {
      // 保存常用设置
      await phpAPI.saveConfig(props.phpVersion, {
        commonSettings: commonSettings.value
      });
    }
    
    ElMessage.success('配置已保存');
    originalConfig.value = configContent.value; // 更新原始内容
    emit('saved');
  } catch (error) {
    ElMessage.error('保存配置失败: ' + (error.message || '未知错误'));
  } finally {
    saving.value = false;
  }
};

// 组件挂载时加载配置
onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.config-editor {
  position: relative;
  min-height: 500px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.editor-header h3 {
  margin: 0;
}

.editor-actions {
  display: flex;
  gap: 10px;
}

.config-file-select {
  margin-bottom: 15px;
}

.config-editor-content {
  min-height: 400px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
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