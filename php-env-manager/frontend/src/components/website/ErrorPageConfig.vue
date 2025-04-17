<template>
  <div class="error-page-config">
    <div class="config-header">
      <h2>错误页面配置</h2>
      <p class="config-description">配置网站的自定义错误页面，提升用户体验</p>
    </div>

    <el-form :model="errorForm" label-position="top">
      <div class="error-page-controls">
        <el-radio-group v-model="errorForm.mode" size="large">
          <el-radio-button label="default">使用默认错误页面</el-radio-button>
          <el-radio-button label="custom">使用自定义错误页面</el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="errorForm.mode === 'custom'">
        <el-card v-for="(errorPage, index) in errorForm.errorPages" :key="index" class="error-page-card">
          <template #header>
            <div class="error-card-header">
              <h3>{{ getErrorStatusName(errorPage.status) }}</h3>
              <el-button 
                type="danger" 
                size="small" 
                circle
                @click="removeErrorPage(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
          <el-form-item label="错误代码">
            <el-select v-model="errorPage.status" style="width: 100%">
              <el-option-group label="客户端错误">
                <el-option label="400 - 错误请求" value="400" />
                <el-option label="401 - 未授权" value="401" />
                <el-option label="403 - 禁止访问" value="403" />
                <el-option label="404 - 页面未找到" value="404" />
                <el-option label="429 - 请求过多" value="429" />
              </el-option-group>
              <el-option-group label="服务器错误">
                <el-option label="500 - 服务器内部错误" value="500" />
                <el-option label="502 - 错误网关" value="502" />
                <el-option label="503 - 服务不可用" value="503" />
                <el-option label="504 - 网关超时" value="504" />
              </el-option-group>
            </el-select>
          </el-form-item>
          
          <el-form-item label="错误页面类型">
            <el-radio-group v-model="errorPage.type">
              <el-radio label="file">使用HTML文件</el-radio>
              <el-radio label="url">重定向到URL</el-radio>
              <el-radio label="template">使用系统模板</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <template v-if="errorPage.type === 'file'">
            <el-form-item label="错误页面文件">
              <el-input v-model="errorPage.filePath" placeholder="请输入错误页面文件路径，如 /errors/404.html">
                <template #append>
                  <el-button @click="selectErrorFile(errorPage)">选择文件</el-button>
                </template>
              </el-input>
            </el-form-item>
          </template>
          
          <template v-else-if="errorPage.type === 'url'">
            <el-form-item label="重定向URL">
              <el-input v-model="errorPage.url" placeholder="请输入重定向URL，如 /error.php?code=404" />
            </el-form-item>
          </template>
          
          <template v-else-if="errorPage.type === 'template'">
            <el-form-item label="错误页面模板">
              <el-select v-model="errorPage.template" style="width: 100%">
                <el-option label="默认模板" value="default" />
                <el-option label="极简模板" value="minimal" />
                <el-option label="详细模板" value="detailed" />
                <el-option label="友好模板" value="friendly" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="错误信息">
              <el-input 
                v-model="errorPage.message" 
                type="textarea" 
                :rows="3" 
                placeholder="自定义错误信息，可使用 {{code}} 和 {{message}} 作为占位符"
              />
            </el-form-item>
            
            <el-form-item label="联系信息">
              <el-input v-model="errorPage.contact" placeholder="可选的联系信息，例如管理员邮箱" />
            </el-form-item>
          </template>
        </el-card>
        
        <div class="add-error-page">
          <el-button type="primary" @click="addErrorPage" :disabled="isAllErrorsConfigured">
            <el-icon><Plus /></el-icon>添加错误页面
          </el-button>
        </div>
      </div>

      <el-divider />

      <el-form-item>
        <div class="form-actions">
          <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="previewErrorPage" :loading="previewing">预览错误页面</el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="错误页面预览" width="80%">
      <div v-if="previewLoading" class="preview-loading">
        <el-skeleton :rows="10" animated />
      </div>
      <iframe 
        v-else
        :src="previewUrl" 
        frameborder="0" 
        width="100%" 
        height="500px"
      ></iframe>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineProps, defineEmits, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Delete, Plus } from '@element-plus/icons-vue';

const props = defineProps({
  website: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['save']);

// 保存状态
const saving = ref(false);
const previewing = ref(false);

// 预览对话框
const previewDialogVisible = ref(false);
const previewLoading = ref(false);
const previewUrl = ref('');

// 表单数据
const errorForm = reactive({
  mode: 'default',
  errorPages: []
});

// 已配置的错误代码
const configuredErrorCodes = computed(() => {
  return errorForm.errorPages.map(page => page.status);
});

// 判断是否所有常见错误都已配置
const isAllErrorsConfigured = computed(() => {
  const commonErrors = ['400', '401', '403', '404', '500', '503'];
  return commonErrors.every(code => configuredErrorCodes.value.includes(code));
});

// 根据状态码获取错误名称
const getErrorStatusName = (status) => {
  const statusMap = {
    '400': '400 - 错误请求',
    '401': '401 - 未授权',
    '403': '403 - 禁止访问',
    '404': '404 - 页面未找到',
    '429': '429 - 请求过多',
    '500': '500 - 服务器内部错误',
    '502': '502 - 错误网关',
    '503': '503 - 服务不可用',
    '504': '504 - 网关超时'
  };
  
  return statusMap[status] || `${status} - 未知错误`;
};

// 添加错误页面
const addErrorPage = () => {
  // 找出未配置的第一个常见错误
  const commonErrors = ['404', '500', '403', '401', '503', '400'];
  let nextError = commonErrors.find(code => !configuredErrorCodes.value.includes(code));
  
  // 如果所有常见错误都已配置，使用404作为默认
  if (!nextError) {
    nextError = '404';
  }
  
  errorForm.errorPages.push({
    status: nextError,
    type: 'template',
    filePath: '',
    url: '',
    template: 'friendly',
    message: '',
    contact: ''
  });
};

// 移除错误页面
const removeErrorPage = (index) => {
  errorForm.errorPages.splice(index, 1);
};

// 选择错误页面文件
const selectErrorFile = async (errorPage) => {
  try {
    // 这里应该调用系统的文件选择对话框
    // 模拟文件选择
    const selectedFile = await new Promise(resolve => {
      setTimeout(() => {
        resolve(`${props.website.rootDir}/errors/${errorPage.status}.html`);
      }, 500);
    });
    errorPage.filePath = selectedFile;
  } catch (error) {
    ElMessage.error('选择文件失败：' + error.message);
  }
};

// 保存配置
const saveConfig = async () => {
  saving.value = true;
  try {
    emit('save', errorForm);
  } finally {
    saving.value = false;
  }
};

// 预览错误页面
const previewErrorPage = async () => {
  if (errorForm.mode === 'default' || errorForm.errorPages.length === 0) {
    ElMessage.warning('请先配置自定义错误页面');
    return;
  }
  
  previewing.value = true;
  previewDialogVisible.value = true;
  previewLoading.value = true;
  
  try {
    // 这里应该调用预览API
    // const response = await axios.post(`/api/websites/${props.website.id}/error-pages/preview`, errorForm);
    // previewUrl.value = response.data.previewUrl;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟预览URL
    const errorCode = errorForm.errorPages[0].status;
    previewUrl.value = `https://http.cat/${errorCode}`;
    
    previewLoading.value = false;
  } catch (error) {
    ElMessage.error('预览错误页面失败：' + error.message);
    previewDialogVisible.value = false;
  } finally {
    previewing.value = false;
  }
};

// 重置表单
const resetForm = () => {
  errorForm.mode = 'default';
  errorForm.errorPages = [];
};

// 加载错误页面配置
onMounted(async () => {
  try {
    // 这里应该调用获取错误页面配置API
    // const response = await axios.get(`/api/websites/${props.website.id}/error-pages`);
    // errorForm.mode = response.data.mode;
    // errorForm.errorPages = response.data.errorPages;
    
    // 模拟加载数据
    errorForm.mode = 'custom';
    errorForm.errorPages = [
      {
        status: '404',
        type: 'file',
        filePath: `${props.website.rootDir}/errors/404.html`,
        url: '',
        template: '',
        message: '',
        contact: ''
      },
      {
        status: '500',
        type: 'template',
        filePath: '',
        url: '',
        template: 'friendly',
        message: '抱歉，服务器遇到了一些问题，请稍后再试或联系管理员。',
        contact: 'admin@example.com'
      }
    ];
  } catch (error) {
    ElMessage.error('加载错误页面配置失败：' + error.message);
  }
});
</script>

<style scoped>
.error-page-config {
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

.error-page-controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.error-page-card {
  margin-bottom: 20px;
}

.error-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.add-error-page {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.preview-loading {
  padding: 20px;
}
</style> 