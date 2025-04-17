<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`PHP信息 - ${phpVersion}`"
    width="90%"
    top="5vh"
    :fullscreen="isFullscreen"
    :before-close="handleClose"
    :destroy-on-close="true"
  >
    <div class="dialog-toolbar">
      <el-button size="small" @click="toggleFullscreen">
        <el-icon><FullScreen v-if="!isFullscreen" /><ScaleToOriginal v-else /></el-icon>
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </el-button>
      <el-button size="small" @click="printPHPInfo">
        <el-icon><Printer /></el-icon>
        打印
      </el-button>
      <el-button size="small" type="success" @click="refreshPHPInfo" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
    
    <div class="phpinfo-container">
      <div v-if="loading" class="loading-overlay">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <iframe 
        v-if="phpInfoUrl" 
        :src="phpInfoUrl" 
        frameborder="0"
        class="phpinfo-iframe"
      ></iframe>
      <div v-else-if="!loading" class="phpinfo-content" v-html="phpInfoHtml"></div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { FullScreen, ScaleToOriginal, Printer, Refresh, Loading } from '@element-plus/icons-vue';
import { phpAPI } from '../services/api';

// 定义属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  phpVersion: {
    type: String,
    default: ''
  },
  // 如果提供了直接的URL，将使用iframe加载
  phpInfoUrl: {
    type: String,
    default: ''
  }
});

// 定义事件
const emit = defineEmits(['update:visible']);

// 对话框可见状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

// 状态变量
const loading = ref(false);
const isFullscreen = ref(false);
const phpInfoHtml = ref('');

// 监听对话框可见性变化
watch(() => props.visible, async (newVal) => {
  if (newVal && !props.phpInfoUrl) {
    await loadPHPInfo();
  }
});

// 加载PHP信息
const loadPHPInfo = async () => {
  if (!props.phpVersion) {
    ElMessage.warning('未指定PHP版本');
    return;
  }
  
  loading.value = true;
  try {
    const response = await phpAPI.getVersionInfo(props.phpVersion);
    phpInfoHtml.value = response.html || '';
    
    if (!phpInfoHtml.value) {
      phpInfoHtml.value = `<div class="error-message">无法加载 ${props.phpVersion} 的信息</div>`;
    }
  } catch (error) {
    ElMessage.error('加载PHP信息失败: ' + (error.message || '未知错误'));
    phpInfoHtml.value = `<div class="error-message">加载失败: ${error.message || '未知错误'}</div>`;
  } finally {
    loading.value = false;
  }
};

// 刷新PHP信息
const refreshPHPInfo = async () => {
  if (props.phpInfoUrl) {
    // 如果使用iframe，刷新iframe
    const iframe = document.querySelector('.phpinfo-iframe');
    if (iframe) {
      iframe.src = props.phpInfoUrl + '?t=' + Date.now();
    }
  } else {
    // 否则重新加载PHP信息
    await loadPHPInfo();
  }
};

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 打印PHP信息
const printPHPInfo = () => {
  if (props.phpInfoUrl) {
    // 如果使用iframe，打印iframe内容
    const iframe = document.querySelector('.phpinfo-iframe');
    if (iframe) {
      iframe.contentWindow.print();
    }
  } else {
    // 否则使用打印API
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>PHP信息 - ${props.phpVersion}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #ddd; padding: 8px; }
            h1, h2 { color: #333; }
          </style>
        </head>
        <body>
          <h1>PHP信息 - ${props.phpVersion}</h1>
          ${phpInfoHtml.value}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
.dialog-toolbar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.phpinfo-container {
  position: relative;
  min-height: 500px;
  max-height: 70vh;
  overflow: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.phpinfo-iframe {
  width: 100%;
  height: 70vh;
  border: none;
}

.phpinfo-content {
  padding: 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
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

:deep(.error-message) {
  color: #f56c6c;
  padding: 20px;
  text-align: center;
  font-size: 16px;
}

:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 20px;
}

:deep(table td, table th) {
  border: 1px solid #dcdfe6;
  padding: 8px;
}

:deep(table th) {
  background-color: #f2f6fc;
}

:deep(h1, h2) {
  color: #303133;
}
</style> 