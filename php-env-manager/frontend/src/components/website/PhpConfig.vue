<template>
  <div class="php-config">
    <div class="config-header">
      <h2>PHP配置</h2>
      <p class="config-description">配置网站的PHP设置、扩展和运行限制</p>
    </div>

    <el-form :model="phpForm" label-position="top">
      <el-tabs type="border-card">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置">
          <el-form-item label="PHP版本">
            <el-select v-model="phpForm.version" style="width: 100%">
              <el-option v-for="version in phpVersions" :key="version" :label="version" :value="version" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="运行模式">
            <el-radio-group v-model="phpForm.mode">
              <el-radio label="fpm">PHP-FPM</el-radio>
              <el-radio label="cgi">FastCGI</el-radio>
              <el-radio label="module" :disabled="isNginx">Apache模块</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最大执行时间 (秒)">
                <el-input-number v-model="phpForm.maxExecutionTime" :min="1" :max="3600" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="内存限制 (MB)">
                <el-input-number v-model="phpForm.memoryLimit" :min="8" :max="4096" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="上传文件大小限制 (MB)">
                <el-input-number v-model="phpForm.uploadMaxFilesize" :min="1" :max="1024" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="POST数据最大尺寸 (MB)">
                <el-input-number v-model="phpForm.postMaxSize" :min="1" :max="1024" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="显示错误">
            <el-switch v-model="phpForm.displayErrors" />
          </el-form-item>
          
          <el-form-item label="日志错误">
            <el-switch v-model="phpForm.logErrors" />
          </el-form-item>
          
          <el-form-item label="错误日志文件" v-if="phpForm.logErrors">
            <el-input v-model="phpForm.errorLog" placeholder="留空使用默认路径">
              <template #append>
                <el-button @click="selectErrorLogFile">选择</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-tab-pane>
        
        <!-- PHP扩展 -->
        <el-tab-pane label="PHP扩展">
          <div class="extension-header">
            <el-input 
              v-model="extensionSearch" 
              placeholder="搜索扩展..." 
              style="width: 300px;"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <el-table :data="filteredExtensions" style="width: 100%">
            <el-table-column prop="name" label="扩展名称" />
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-switch 
                  v-model="row.enabled"
                  :disabled="row.required"
                  :title="row.required ? '该扩展为必需扩展，无法禁用' : ''"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <!-- 自定义ini设置 -->
        <el-tab-pane label="自定义设置">
          <el-alert
            title="注意：自定义设置可能会覆盖基本设置选项"
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
          />
          
          <div class="custom-settings-toolbar">
            <el-button type="primary" @click="addCustomSetting" size="small">添加设置项</el-button>
          </div>
          
          <el-table :data="phpForm.customSettings" style="width: 100%">
            <el-table-column label="设置名称" width="300">
              <template #default="{ row, $index }">
                <el-input v-model="row.name" placeholder="例如：session.gc_maxlifetime" />
              </template>
            </el-table-column>
            <el-table-column label="值">
              <template #default="{ row, $index }">
                <el-input v-model="row.value" placeholder="设置值" />
              </template>
            </el-table-column>
            <el-table-column width="100">
              <template #default="{ row, $index }">
                <el-button 
                  type="danger" 
                  size="small" 
                  circle 
                  @click="deleteCustomSetting($index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <!-- 高级设置 -->
        <el-tab-pane label="高级设置">
          <el-form-item label="PHP-FPM进程管理">
            <el-radio-group v-model="phpForm.fpmProcessManager">
              <el-radio label="static">静态</el-radio>
              <el-radio label="dynamic">动态</el-radio>
              <el-radio label="ondemand">按需</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="最小空闲进程">
                <el-input-number v-model="phpForm.minSpareServers" :min="1" :max="100" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大空闲进程">
                <el-input-number v-model="phpForm.maxSpareServers" :min="1" :max="100" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大子进程">
                <el-input-number v-model="phpForm.maxChildren" :min="1" :max="1000" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="Opcache设置">
            <el-switch v-model="phpForm.opcacheEnabled" />
          </el-form-item>
          
          <el-row :gutter="20" v-if="phpForm.opcacheEnabled">
            <el-col :span="8">
              <el-form-item label="内存大小 (MB)">
                <el-input-number v-model="phpForm.opcacheMemory" :min="8" :max="1024" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="重用率">
                <el-input-number v-model="phpForm.opcacheReuse" :min="0" :max="1" :step="0.1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大加速文件数">
                <el-input-number v-model="phpForm.opcacheMaxFiles" :min="200" :max="100000" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>

      <el-divider />

      <el-form-item>
        <div class="form-actions">
          <el-button type="primary" @click="savePhpConfig" :loading="saving">保存配置</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="testConfig" :loading="testing">验证配置</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineProps, defineEmits, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Delete } from '@element-plus/icons-vue';

const props = defineProps({
  website: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['save']);

// 状态
const saving = ref(false);
const testing = ref(false);
const extensionSearch = ref('');

// PHP版本
const phpVersions = ref(['PHP 7.2', 'PHP 7.4', 'PHP 8.0', 'PHP 8.1', 'PHP 8.2']);

// PHP表单数据
const phpForm = reactive({
  version: 'PHP 8.1',
  mode: 'fpm',
  maxExecutionTime: 30,
  memoryLimit: 128,
  uploadMaxFilesize: 20,
  postMaxSize: 20,
  displayErrors: false,
  logErrors: true,
  errorLog: '',
  fpmProcessManager: 'dynamic',
  minSpareServers: 5,
  maxSpareServers: 35,
  maxChildren: 50,
  opcacheEnabled: true,
  opcacheMemory: 128,
  opcacheReuse: 0.8,
  opcacheMaxFiles: 10000,
  customSettings: []
});

// 判断是否使用Nginx
const isNginx = computed(() => props.website.webServer === 'Nginx');

// PHP扩展
const extensions = ref([
  { name: 'core', description: '核心扩展', enabled: true, required: true },
  { name: 'standard', description: '标准扩展', enabled: true, required: true },
  { name: 'json', description: 'JSON支持', enabled: true, required: true },
  { name: 'mbstring', description: '多字节字符串支持', enabled: true, required: false },
  { name: 'mysql', description: 'MySQL数据库支持', enabled: true, required: false },
  { name: 'mysqli', description: 'MySQL改进版支持', enabled: true, required: false },
  { name: 'pdo_mysql', description: 'PDO MySQL驱动', enabled: true, required: false },
  { name: 'curl', description: 'cURL支持', enabled: true, required: false },
  { name: 'gd', description: 'GD图像处理库', enabled: true, required: false },
  { name: 'xml', description: 'XML解析', enabled: true, required: false },
  { name: 'zip', description: 'Zip压缩支持', enabled: true, required: false },
  { name: 'openssl', description: 'OpenSSL支持', enabled: true, required: false },
  { name: 'intl', description: '国际化支持', enabled: false, required: false },
  { name: 'soap', description: 'SOAP支持', enabled: false, required: false },
  { name: 'exif', description: 'EXIF图像元数据', enabled: false, required: false },
  { name: 'fileinfo', description: '文件信息支持', enabled: true, required: false },
  { name: 'redis', description: 'Redis支持', enabled: false, required: false },
  { name: 'memcached', description: 'Memcached支持', enabled: false, required: false },
  { name: 'imagick', description: 'ImageMagick支持', enabled: false, required: false },
  { name: 'opcache', description: '代码缓存加速', enabled: true, required: false }
]);

// 过滤后的扩展列表
const filteredExtensions = computed(() => {
  if (!extensionSearch.value) {
    return extensions.value;
  }
  
  const query = extensionSearch.value.toLowerCase();
  return extensions.value.filter(ext => {
    return ext.name.toLowerCase().includes(query) || 
           ext.description.toLowerCase().includes(query);
  });
});

// 选择错误日志文件
const selectErrorLogFile = async () => {
  try {
    // 这里应该调用系统的文件选择对话框
    // 模拟文件选择
    const selectedFile = await new Promise(resolve => {
      setTimeout(() => {
        resolve(`${props.website.rootDir}/logs/php_errors.log`);
      }, 500);
    });
    phpForm.errorLog = selectedFile;
  } catch (error) {
    ElMessage.error('选择文件失败：' + error.message);
  }
};

// 添加自定义设置
const addCustomSetting = () => {
  phpForm.customSettings.push({ name: '', value: '' });
};

// 删除自定义设置
const deleteCustomSetting = (index) => {
  phpForm.customSettings.splice(index, 1);
};

// 保存PHP配置
const savePhpConfig = async () => {
  saving.value = true;
  try {
    // 构建完整的配置对象
    const config = {
      ...phpForm,
      extensions: extensions.value.map(ext => ({
        name: ext.name,
        enabled: ext.enabled
      }))
    };
    
    emit('save', config);
  } finally {
    saving.value = false;
  }
};

// 测试配置
const testConfig = async () => {
  testing.value = true;
  try {
    // 这里应该调用配置测试API
    // const response = await axios.post(`/api/websites/${props.website.id}/php-config/test`, {
    //   ...phpForm,
    //   extensions: extensions.value.map(ext => ({
    //     name: ext.name,
    //     enabled: ext.enabled
    //   }))
    // });
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('PHP配置验证通过');
  } catch (error) {
    ElMessage.error('验证PHP配置失败：' + error.message);
  } finally {
    testing.value = false;
  }
};

// 重置表单
const resetForm = () => {
  // 重置基本设置
  phpForm.version = 'PHP 8.1';
  phpForm.mode = 'fpm';
  phpForm.maxExecutionTime = 30;
  phpForm.memoryLimit = 128;
  phpForm.uploadMaxFilesize = 20;
  phpForm.postMaxSize = 20;
  phpForm.displayErrors = false;
  phpForm.logErrors = true;
  phpForm.errorLog = '';
  
  // 重置高级设置
  phpForm.fpmProcessManager = 'dynamic';
  phpForm.minSpareServers = 5;
  phpForm.maxSpareServers = 35;
  phpForm.maxChildren = 50;
  phpForm.opcacheEnabled = true;
  phpForm.opcacheMemory = 128;
  phpForm.opcacheReuse = 0.8;
  phpForm.opcacheMaxFiles = 10000;
  
  // 重置自定义设置
  phpForm.customSettings = [];
  
  // 重置扩展
  extensions.value.forEach(ext => {
    if (!ext.required) {
      ext.enabled = false;
    }
  });
  
  // 常用扩展默认启用
  const commonExtensions = ['mbstring', 'mysqli', 'pdo_mysql', 'curl', 'gd', 'xml', 'zip', 'openssl', 'fileinfo', 'opcache'];
  commonExtensions.forEach(extName => {
    const ext = extensions.value.find(e => e.name === extName);
    if (ext) {
      ext.enabled = true;
    }
  });
};

// 加载PHP配置
onMounted(async () => {
  try {
    // 这里应该调用获取PHP配置API
    // const response = await axios.get(`/api/websites/${props.website.id}/php-config`);
    // Object.assign(phpForm, response.data.config);
    // 
    // // 更新扩展状态
    // response.data.extensions.forEach(ext => {
    //   const extension = extensions.value.find(e => e.name === ext.name);
    //   if (extension) {
    //     extension.enabled = ext.enabled;
    //   }
    // });
    
    // 模拟加载数据
    phpForm.version = props.website.phpVersion;
    phpForm.mode = 'fpm';
    phpForm.customSettings = [
      { name: 'date.timezone', value: 'Asia/Shanghai' },
      { name: 'session.gc_maxlifetime', value: '1440' }
    ];
  } catch (error) {
    ElMessage.error('加载PHP配置失败：' + error.message);
  }
});
</script>

<style scoped>
.php-config {
  padding: 20px;
}

.config-header {
  margin-bottom: 20px;
}

.config-description {
  color: #606266;
  font-size: 14px;
  margin-top: 8px;
}

.extension-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.custom-settings-toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-actions {
  display: flex;
  gap: 10px;
}
</style> 