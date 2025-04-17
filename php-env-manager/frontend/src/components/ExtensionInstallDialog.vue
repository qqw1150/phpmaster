<template>
  <el-dialog
    v-model="dialogVisible"
    title="安装PHP扩展"
    width="550px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :destroy-on-close="true"
  >
    <el-form :model="form" label-width="120px">
      <el-form-item label="PHP版本">
        <el-select v-model="form.phpVersion" placeholder="选择PHP版本" style="width: 100%">
          <el-option
            v-for="version in phpVersions"
            :key="version.version"
            :label="version.version"
            :value="version.version"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="安装方式">
        <el-radio-group v-model="form.installMethod">
          <el-radio label="pecl">PECL安装</el-radio>
          <el-radio label="custom">自定义源码</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <template v-if="form.installMethod === 'pecl'">
        <el-form-item label="扩展名称">
          <el-autocomplete
            v-model="form.extensionName"
            :fetch-suggestions="queryPeclExtensions"
            placeholder="输入扩展名称搜索"
            style="width: 100%"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="版本">
          <el-select v-model="form.extensionVersion" placeholder="选择版本" style="width: 100%">
            <el-option label="最新稳定版" value="stable" />
            <el-option label="最新开发版" value="beta" />
            <el-option label="指定版本" value="custom" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="form.extensionVersion === 'custom'" label="指定版本号">
          <el-input v-model="form.customVersion" placeholder="例如: 1.2.3" />
        </el-form-item>
      </template>
      
      <template v-else>
        <el-form-item label="源码路径">
          <el-input v-model="form.sourcePath" placeholder="源码路径">
            <template #append>
              <el-button @click="selectSourcePath">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
      </template>
      
      <el-form-item label="编译参数">
        <el-input
          v-model="form.buildOptions"
          type="textarea"
          rows="3"
          placeholder="可选的编译参数"
        />
      </el-form-item>
      
      <el-form-item label="安装后启用">
        <el-switch v-model="form.enableAfterInstall" />
      </el-form-item>
    </el-form>
    
    <div v-if="installing" class="install-progress">
      <p>正在安装扩展: {{ form.extensionName }}</p>
      <el-progress :percentage="installProgress" />
      <p>{{ installMessage }}</p>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" :disabled="installing">取消</el-button>
        <el-button type="primary" @click="installExtension" :loading="installing">
          安装
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { extensionAPI, phpAPI } from '../services/api';

// 定义属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  // 预选的PHP版本
  preSelectedPhpVersion: {
    type: String,
    default: ''
  }
});

// 定义事件
const emit = defineEmits(['update:visible', 'installed']);

// 对话框可见状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

// PHP版本列表
const phpVersions = ref([]);

// 表单数据
const form = ref({
  phpVersion: props.preSelectedPhpVersion || '',
  installMethod: 'pecl',
  extensionName: '',
  extensionVersion: 'stable',
  customVersion: '',
  sourcePath: '',
  buildOptions: '',
  enableAfterInstall: true
});

// 安装状态
const installing = ref(false);
const installProgress = ref(0);
const installMessage = ref('');

// 监听预选的PHP版本变化
watch(() => props.preSelectedPhpVersion, (newVal) => {
  if (newVal) {
    form.value.phpVersion = newVal;
  }
});

// 监听对话框可见性变化
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    resetForm();
    await loadPhpVersions();
  }
});

// 加载PHP版本列表
const loadPhpVersions = async () => {
  try {
    const response = await phpAPI.getVersions();
    phpVersions.value = response || [];
    
    // 如果没有预选的PHP版本且有可用版本，默认选择第一个
    if (!form.value.phpVersion && phpVersions.value.length > 0) {
      form.value.phpVersion = phpVersions.value[0].version;
    }
  } catch (error) {
    ElMessage.error('加载PHP版本列表失败: ' + (error.message || '未知错误'));
    // 使用模拟数据
    phpVersions.value = [
      { version: 'PHP 8.2.0', path: 'D:\\phpmaster\\php\\8.2.0', enabled: true },
      { version: 'PHP 8.1.12', path: 'D:\\phpmaster\\php\\8.1.12', enabled: true },
      { version: 'PHP 7.4.30', path: 'D:\\phpmaster\\php\\7.4.30', enabled: true }
    ];
  }
};

// 重置表单
const resetForm = () => {
  form.value = {
    phpVersion: props.preSelectedPhpVersion || '',
    installMethod: 'pecl',
    extensionName: '',
    extensionVersion: 'stable',
    customVersion: '',
    sourcePath: '',
    buildOptions: '',
    enableAfterInstall: true
  };
  installing.value = false;
  installProgress.value = 0;
  installMessage.value = '';
};

// 搜索PECL扩展
const queryPeclExtensions = (queryString, callback) => {
  // 这里应该调用API来搜索PECL扩展
  // 模拟搜索结果
  const commonExtensions = [
    { value: 'redis', label: 'redis - Redis扩展' },
    { value: 'xdebug', label: 'xdebug - 调试和性能分析工具' },
    { value: 'imagick', label: 'imagick - ImageMagick图像处理' },
    { value: 'memcached', label: 'memcached - Memcached客户端' },
    { value: 'mongodb', label: 'mongodb - MongoDB驱动' },
    { value: 'swoole', label: 'swoole - 异步编程框架' },
    { value: 'grpc', label: 'grpc - gRPC框架' },
    { value: 'protobuf', label: 'protobuf - Protocol Buffers' }
  ];
  
  let results = commonExtensions;
  
  if (queryString) {
    results = commonExtensions.filter(ext => {
      return ext.label.toLowerCase().includes(queryString.toLowerCase());
    });
  }
  
  callback(results);
};

// 选择源码路径
const selectSourcePath = () => {
  // 这里应该调用系统文件选择器，但在前端无法直接访问文件系统
  // 可以通过后端API实现，或者让用户手动输入
  ElMessage.info('请手动输入源码路径');
};

// 安装扩展
const installExtension = async () => {
  // 表单验证
  if (!form.value.phpVersion) {
    ElMessage.warning('请选择PHP版本');
    return;
  }
  
  if (form.value.installMethod === 'pecl' && !form.value.extensionName) {
    ElMessage.warning('请输入扩展名称');
    return;
  }
  
  if (form.value.installMethod === 'custom' && !form.value.sourcePath) {
    ElMessage.warning('请输入源码路径');
    return;
  }
  
  // 开始安装
  installing.value = true;
  installProgress.value = 0;
  installMessage.value = '准备安装...';
  
  try {
    // 模拟安装过程
    installMessage.value = '检查依赖...';
    await simulateProgress(20);
    
    installMessage.value = '下载扩展源码...';
    await simulateProgress(40);
    
    installMessage.value = '编译扩展...';
    await simulateProgress(70);
    
    installMessage.value = '安装扩展...';
    await simulateProgress(90);
    
    if (form.value.enableAfterInstall) {
      installMessage.value = '启用扩展...';
      await simulateProgress(95);
    }
    
    installMessage.value = '完成安装';
    installProgress.value = 100;
    
    // 实际项目中应该调用安装API
    /*
    const data = {
      phpVersion: form.value.phpVersion,
      installMethod: form.value.installMethod,
      extensionName: form.value.extensionName,
      extensionVersion: form.value.extensionVersion === 'custom' ? form.value.customVersion : form.value.extensionVersion,
      sourcePath: form.value.sourcePath,
      buildOptions: form.value.buildOptions,
      enableAfterInstall: form.value.enableAfterInstall
    };
    
    await extensionAPI.installExtension(form.value.phpVersion, data);
    */
    
    ElMessage.success(`扩展 ${form.value.extensionName || '自定义扩展'} 安装成功`);
    
    // 通知父组件安装完成
    emit('installed', {
      phpVersion: form.value.phpVersion,
      extensionName: form.value.extensionName || '自定义扩展'
    });
    
    // 关闭对话框
    dialogVisible.value = false;
  } catch (error) {
    installMessage.value = `安装失败: ${error.message || '未知错误'}`;
    ElMessage.error(installMessage.value);
  } finally {
    installing.value = false;
  }
};

// 模拟进度
const simulateProgress = (targetProgress) => {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (installProgress.value < targetProgress) {
        installProgress.value += 2;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
};

// 关闭对话框
const handleClose = () => {
  if (installing.value) {
    ElMessage.warning('安装正在进行中，无法取消');
    return;
  }
  
  dialogVisible.value = false;
};
</script>

<style scoped>
.install-progress {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  background-color: #f8f8f8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 