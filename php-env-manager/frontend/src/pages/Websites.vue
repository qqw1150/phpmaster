<template>
  <div class="websites-container">
    <div class="page-header">
      <h1>网站管理</h1>
      <div class="page-tools">
        <el-button type="primary" @click="dialogVisible = true">
          <el-icon><Plus /></el-icon>添加网站
        </el-button>
      </div>
    </div>

    <el-card class="websites-card">
      <template #header>
        <div class="card-header">
          <span>我的网站</span>
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索网站..." 
            style="width: 300px;"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>
      
      <el-table :data="filteredWebsites" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="网站名称" min-width="150" />
        <el-table-column prop="domain" label="域名" min-width="180" />
        <el-table-column prop="rootDir" label="根目录" min-width="250" show-overflow-tooltip />
        <el-table-column prop="phpVersion" label="PHP版本" width="120" />
        <el-table-column prop="webServer" label="Web服务器" width="120" />
        <el-table-column label="SSL" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.sslEnabled ? 'success' : 'info'">
              {{ scope.row.sslEnabled ? '已启用' : '未启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
              {{ scope.row.enabled ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openWebsite(scope.row)">
              访问
            </el-button>
            <el-button size="small" type="success" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="info" @click="openAdvancedConfig(scope.row)">
              高级配置
            </el-button>
            <el-button size="small" type="warning" @click="handleSSL(scope.row)">
              SSL
            </el-button>
            <el-button size="small" type="danger" @click="deleteWebsite(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container" v-if="totalWebsites > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalWebsites"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑网站对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑网站' : '添加网站'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="websiteForm" :rules="rules" ref="websiteFormRef" label-width="100px">
        <el-form-item label="网站名称" prop="name">
          <el-input v-model="websiteForm.name" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="域名" prop="domain">
          <el-input v-model="websiteForm.domain" placeholder="请输入域名，例如：example.local" />
        </el-form-item>
        <el-form-item label="根目录" prop="rootDir">
          <el-input v-model="websiteForm.rootDir" placeholder="请输入网站根目录路径">
            <template #append>
              <el-button @click="selectDirectory">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="PHP版本" prop="phpVersion">
          <el-select v-model="websiteForm.phpVersion" placeholder="请选择PHP版本" style="width: 100%">
            <el-option v-for="item in phpVersions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="Web服务器" prop="webServer">
          <el-select v-model="websiteForm.webServer" placeholder="请选择Web服务器" style="width: 100%">
            <el-option v-for="item in webServers" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="websiteForm.enabled" :active-text="websiteForm.enabled ? '已启用' : '已禁用'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWebsiteForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- SSL配置对话框 -->
    <el-dialog
      v-model="sslDialogVisible"
      title="SSL证书配置"
      width="600px"
      destroy-on-close
    >
      <el-form :model="sslForm" :rules="sslRules" ref="sslFormRef" label-width="120px">
        <el-form-item label="启用SSL">
          <el-switch v-model="sslForm.sslEnabled" :active-text="sslForm.sslEnabled ? '已启用' : '已禁用'" />
        </el-form-item>
        
        <template v-if="sslForm.sslEnabled">
          <el-form-item label="证书类型">
            <el-radio-group v-model="sslForm.certType">
              <el-radio label="self">自签名证书</el-radio>
              <el-radio label="custom">自定义证书</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <template v-if="sslForm.certType === 'custom'">
            <el-form-item label="证书文件" prop="certFile">
              <el-input v-model="sslForm.certFile" placeholder="请输入证书文件路径">
                <template #append>
                  <el-button @click="selectCertFile">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="密钥文件" prop="keyFile">
              <el-input v-model="sslForm.keyFile" placeholder="请输入密钥文件路径">
                <template #append>
                  <el-button @click="selectKeyFile">选择</el-button>
                </template>
              </el-input>
            </el-form-item>
          </template>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="sslDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSslForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 高级配置对话框 -->
    <el-dialog
      v-model="advancedConfigVisible"
      :title="`${currentWebsite?.name || ''} - 高级配置`"
      width="80%"
      destroy-on-close
      fullscreen
    >
      <el-tabs v-model="activeConfigTab" type="border-card">
        <el-tab-pane label="伪静态配置" name="rewrite">
          <website-rewrite-config :website="currentWebsite" @save="saveRewriteConfig" />
        </el-tab-pane>
        <el-tab-pane label="PHP配置" name="php">
          <website-php-config :website="currentWebsite" @save="savePhpConfig" />
        </el-tab-pane>
        <el-tab-pane label="错误页面" name="error">
          <website-error-page-config :website="currentWebsite" @save="saveErrorPageConfig" />
        </el-tab-pane>
        <el-tab-pane label="安全配置" name="security">
          <website-security-config :website="currentWebsite" @save="saveSecurityConfig" />
        </el-tab-pane>
        <el-tab-pane label="目录权限" name="permissions">
          <website-permissions-config :website="currentWebsite" @save="savePermissionsConfig" />
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="advancedConfigVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, defineAsyncComponent } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import axios from 'axios';

// 异步加载配置组件
const WebsiteRewriteConfig = defineAsyncComponent(() => import('../components/website/RewriteConfig.vue'));
const WebsitePhpConfig = defineAsyncComponent(() => import('../components/website/PhpConfig.vue'));
const WebsiteErrorPageConfig = defineAsyncComponent(() => import('../components/website/ErrorPageConfig.vue'));
const WebsiteSecurityConfig = defineAsyncComponent(() => import('../components/website/SecurityConfig.vue'));
const WebsitePermissionsConfig = defineAsyncComponent(() => import('../components/website/PermissionsConfig.vue'));

// 加载状态
const loading = ref(false);
const submitting = ref(false);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const totalWebsites = ref(0);

// 网站列表数据
const websites = ref([]);

// PHP版本和Web服务器选项
const phpVersions = ref(['PHP 7.2', 'PHP 7.4', 'PHP 8.0', 'PHP 8.1', 'PHP 8.2']);
const webServers = ref(['Nginx', 'Apache']);

// 对话框显示状态
const dialogVisible = ref(false);
const sslDialogVisible = ref(false);
const advancedConfigVisible = ref(false);
const isEdit = ref(false);

// 当前编辑的网站
const currentWebsite = ref(null);

// 高级配置选项卡
const activeConfigTab = ref('rewrite');

// 搜索关键词
const searchQuery = ref('');

// 表单引用
const websiteFormRef = ref(null);
const sslFormRef = ref(null);

// 网站表单数据
const websiteForm = reactive({
  id: null,
  name: '',
  domain: '',
  rootDir: '',
  phpVersion: '',
  webServer: '',
  enabled: true
});

// SSL表单数据
const sslForm = reactive({
  id: null, 
  sslEnabled: false,
  certType: 'self',
  certFile: '',
  keyFile: ''
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入网站名称', trigger: 'blur' },
    { min: 2, max: 50, message: '网站名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请输入域名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z0-9]+$/, message: '请输入有效的域名格式', trigger: 'blur' }
  ],
  rootDir: [
    { required: true, message: '请输入网站根目录路径', trigger: 'blur' }
  ],
  phpVersion: [
    { required: true, message: '请选择PHP版本', trigger: 'change' }
  ],
  webServer: [
    { required: true, message: '请选择Web服务器', trigger: 'change' }
  ]
};

// SSL表单验证规则
const sslRules = {
  certFile: [
    { required: true, message: '请输入证书文件路径', trigger: 'blur' }
  ],
  keyFile: [
    { required: true, message: '请输入密钥文件路径', trigger: 'blur' }
  ]
};

// 过滤后的网站列表
const filteredWebsites = computed(() => {
  if (!searchQuery.value) {
    return websites.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return websites.value.filter(website => {
    return website.name.toLowerCase().includes(query) || 
           website.domain.toLowerCase().includes(query) ||
           website.rootDir.toLowerCase().includes(query);
  });
});

// 页面加载时获取网站列表
onMounted(() => {
  fetchWebsites();
});

// 获取网站列表数据
const fetchWebsites = async () => {
  loading.value = true;
  try {
    // 这里替换为实际的API调用
    // const response = await axios.get('/api/websites', {
    //   params: { page: currentPage.value, limit: pageSize.value }
    // });
    // websites.value = response.data.websites;
    // totalWebsites.value = response.data.total;
    
    // 模拟数据
    setTimeout(() => {
      websites.value = [
        {
          id: 1,
          name: '个人博客',
          domain: 'blog.local',
          rootDir: 'D:\\www\\blog',
          phpVersion: 'PHP 8.1',
          webServer: 'Nginx',
          sslEnabled: true,
          enabled: true
        },
        {
          id: 2,
          name: '测试网站',
          domain: 'test.local',
          rootDir: 'D:\\www\\test',
          phpVersion: 'PHP 7.4',
          webServer: 'Apache',
          sslEnabled: false,
          enabled: true
        },
        {
          id: 3,
          name: '电商网站',
          domain: 'shop.local',
          rootDir: 'D:\\www\\shop',
          phpVersion: 'PHP 8.0',
          webServer: 'Nginx',
          sslEnabled: true,
          enabled: false
        }
      ];
      totalWebsites.value = 3;
      loading.value = false;
    }, 500);
  } catch (error) {
    ElMessage.error('获取网站列表失败：' + error.message);
    loading.value = false;
  }
};

// 选择目录
const selectDirectory = async () => {
  try {
    // 这里应该调用系统的目录选择对话框
    // 模拟目录选择
    const selectedDir = await new Promise(resolve => {
      setTimeout(() => {
        resolve('D:\\www\\new-site');
      }, 500);
    });
    websiteForm.rootDir = selectedDir;
  } catch (error) {
    ElMessage.error('选择目录失败：' + error.message);
  }
};

// 选择证书文件
const selectCertFile = async () => {
  try {
    // 模拟文件选择
    const selectedFile = await new Promise(resolve => {
      setTimeout(() => {
        resolve('D:\\ssl\\certificate.crt');
      }, 500);
    });
    sslForm.certFile = selectedFile;
  } catch (error) {
    ElMessage.error('选择证书文件失败：' + error.message);
  }
};

// 选择密钥文件
const selectKeyFile = async () => {
  try {
    // 模拟文件选择
    const selectedFile = await new Promise(resolve => {
      setTimeout(() => {
        resolve('D:\\ssl\\private.key');
      }, 500);
    });
    sslForm.keyFile = selectedFile;
  } catch (error) {
    ElMessage.error('选择密钥文件失败：' + error.message);
  }
};

// 处理编辑网站
const handleEdit = (website) => {
  isEdit.value = true;
  Object.assign(websiteForm, website);
  dialogVisible.value = true;
};

// 处理SSL配置
const handleSSL = (website) => {
  sslForm.id = website.id;
  sslForm.sslEnabled = website.sslEnabled;
  sslForm.certType = 'self'; // 默认选择自签名证书
  sslForm.certFile = '';
  sslForm.keyFile = '';
  sslDialogVisible.value = true;
};

// 提交网站表单
const submitWebsiteForm = async () => {
  if (!websiteFormRef.value) return;
  
  await websiteFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (isEdit.value) {
          // 编辑现有网站
          // await axios.put(`/api/websites/${websiteForm.id}`, websiteForm);
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // 更新本地数据
          const index = websites.value.findIndex(item => item.id === websiteForm.id);
          if (index !== -1) {
            websites.value[index] = { ...websites.value[index], ...websiteForm };
          }
          
          ElMessage.success('网站编辑成功');
        } else {
          // 添加新网站
          // const response = await axios.post('/api/websites', websiteForm);
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // 添加到本地数据
          const newWebsite = {
            ...websiteForm,
            id: websites.value.length + 1, // 模拟生成ID
            sslEnabled: false
          };
          websites.value.push(newWebsite);
          
          ElMessage.success('网站添加成功');
        }
        
        dialogVisible.value = false;
        resetForm();
      } catch (error) {
        ElMessage.error((isEdit.value ? '编辑' : '添加') + '网站失败：' + error.message);
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 提交SSL表单
const submitSslForm = async () => {
  if (!sslFormRef.value) return;
  
  await sslFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        // 这里应该调用SSL配置API
        // await axios.put(`/api/websites/${sslForm.id}/ssl`, sslForm);
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 更新本地数据
        const index = websites.value.findIndex(item => item.id === sslForm.id);
        if (index !== -1) {
          websites.value[index].sslEnabled = sslForm.sslEnabled;
        }
        
        ElMessage.success('SSL配置已更新');
        sslDialogVisible.value = false;
      } catch (error) {
        ElMessage.error('更新SSL配置失败：' + error.message);
      } finally {
        submitting.value = false;
      }
    }
  });
};

// 删除网站
const deleteWebsite = (website) => {
  ElMessageBox.confirm(
    `确定要删除网站 "${website.name}" 吗？这将删除网站配置，但不会删除网站文件。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 这里应该调用删除API
      // await axios.delete(`/api/websites/${website.id}`);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 从列表中移除
      websites.value = websites.value.filter(item => item.id !== website.id);
      
      ElMessage.success(`网站 "${website.name}" 已成功删除`);
    } catch (error) {
      ElMessage.error('删除网站失败：' + error.message);
    }
  }).catch(() => {
    // 取消操作
  });
};

// 访问网站
const openWebsite = (website) => {
  const protocol = website.sslEnabled ? 'https' : 'http';
  const url = `${protocol}://${website.domain}`;
  // 打开网站链接
  window.open(url, '_blank');
  ElMessage.success(`正在打开: ${url}`);
};

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchWebsites();
};

// 页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchWebsites();
};

// 重置表单
const resetForm = () => {
  isEdit.value = false;
  websiteForm.id = null;
  websiteForm.name = '';
  websiteForm.domain = '';
  websiteForm.rootDir = '';
  websiteForm.phpVersion = '';
  websiteForm.webServer = '';
  websiteForm.enabled = true;
};

// 打开高级配置对话框
const openAdvancedConfig = (website) => {
  currentWebsite.value = website;
  advancedConfigVisible.value = true;
  activeConfigTab.value = 'rewrite';
};

// 保存伪静态配置
const saveRewriteConfig = async (config) => {
  submitting.value = true;
  try {
    // 这里应该调用伪静态配置保存API
    // await axios.post(`/api/websites/${currentWebsite.value.id}/rewrite`, config);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    
    ElMessage.success('伪静态规则保存成功');
  } catch (error) {
    ElMessage.error('保存伪静态规则失败：' + error.message);
  } finally {
    submitting.value = false;
  }
};

// 保存PHP配置
const savePhpConfig = async (config) => {
  submitting.value = true;
  try {
    // 这里应该调用PHP配置保存API
    // await axios.post(`/api/websites/${currentWebsite.value.id}/php-config`, config);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    
    ElMessage.success('PHP配置保存成功');
  } catch (error) {
    ElMessage.error('保存PHP配置失败：' + error.message);
  } finally {
    submitting.value = false;
  }
};

// 保存错误页面配置
const saveErrorPageConfig = async (config) => {
  submitting.value = true;
  try {
    // 这里应该调用错误页面配置保存API
    // await axios.post(`/api/websites/${currentWebsite.value.id}/error-pages`, config);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    
    ElMessage.success('错误页面配置保存成功');
  } catch (error) {
    ElMessage.error('保存错误页面配置失败：' + error.message);
  } finally {
    submitting.value = false;
  }
};

// 保存安全配置
const saveSecurityConfig = async (config) => {
  submitting.value = true;
  try {
    // 这里应该调用安全配置保存API
    // await axios.post(`/api/websites/${currentWebsite.value.id}/security`, config);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    
    ElMessage.success('安全配置保存成功');
  } catch (error) {
    ElMessage.error('保存安全配置失败：' + error.message);
  } finally {
    submitting.value = false;
  }
};

// 保存目录权限配置
const savePermissionsConfig = async (config) => {
  submitting.value = true;
  try {
    // 这里应该调用目录权限配置保存API
    // await axios.post(`/api/websites/${currentWebsite.value.id}/permissions`, config);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800));
    
    ElMessage.success('目录权限配置保存成功');
  } catch (error) {
    ElMessage.error('保存目录权限配置失败：' + error.message);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.websites-container {
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

.websites-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 