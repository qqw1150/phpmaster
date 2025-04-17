<template>
  <div class="permissions-config">
    <div class="config-header">
      <h2>目录权限配置</h2>
      <p class="config-description">配置网站文件和目录的权限，保障安全性和可访问性</p>
    </div>

    <el-form :model="permissionsForm" label-position="top">
      <!-- 默认权限设置 -->
      <el-card class="permissions-card">
        <template #header>
          <div class="card-header">
            <h3>默认权限设置</h3>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目录默认权限">
              <el-select v-model="permissionsForm.defaultDirMode" style="width: 100%">
                <el-option label="755 (rwxr-xr-x)" value="755" />
                <el-option label="750 (rwxr-x---)" value="750" />
                <el-option label="775 (rwxrwxr-x)" value="775" />
                <el-option label="770 (rwxrwx---)" value="770" />
                <el-option label="700 (rwx------)" value="700" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件默认权限">
              <el-select v-model="permissionsForm.defaultFileMode" style="width: 100%">
                <el-option label="644 (rw-r--r--)" value="644" />
                <el-option label="640 (rw-r-----)" value="640" />
                <el-option label="664 (rw-rw-r--)" value="664" />
                <el-option label="660 (rw-rw----)" value="660" />
                <el-option label="600 (rw-------)" value="600" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目录所有者">
              <el-input v-model="permissionsForm.owner" placeholder="例如：www-data" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目录所属组">
              <el-input v-model="permissionsForm.group" placeholder="例如：www-data" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 特殊权限设置 -->
      <el-card class="permissions-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <h3>特殊权限设置</h3>
            </div>
            <div class="header-right">
              <el-button type="primary" size="small" @click="addPermissionRule">添加规则</el-button>
            </div>
          </div>
        </template>
        
        <p class="tip">为特定目录或文件设置自定义权限，优先级高于默认权限</p>
        
        <div v-if="permissionsForm.rules.length === 0" class="no-rules">
          <el-empty description="暂无特殊权限规则" />
        </div>
        
        <el-table v-else :data="permissionsForm.rules" style="width: 100%">
          <el-table-column label="路径" min-width="250">
            <template #default="{ row, $index }">
              <el-input v-model="row.path" placeholder="相对于网站根目录的路径，例如：/cache">
                <template #append>
                  <el-button @click="selectPath(row)">选择</el-button>
                </template>
              </el-input>
            </template>
          </el-table-column>
          
          <el-table-column label="类型" width="120">
            <template #default="{ row }">
              <el-select v-model="row.type" style="width: 100%">
                <el-option label="目录" value="dir" />
                <el-option label="文件" value="file" />
                <el-option label="模式匹配" value="pattern" />
              </el-select>
            </template>
          </el-table-column>
          
          <el-table-column label="权限" width="180">
            <template #default="{ row }">
              <el-select v-model="row.mode" style="width: 100%">
                <template v-if="row.type === 'dir' || row.type === 'pattern'">
                  <el-option label="755 (rwxr-xr-x)" value="755" />
                  <el-option label="750 (rwxr-x---)" value="750" />
                  <el-option label="775 (rwxrwxr-x)" value="775" />
                  <el-option label="777 (rwxrwxrwx)" value="777" />
                  <el-option label="770 (rwxrwx---)" value="770" />
                  <el-option label="700 (rwx------)" value="700" />
                </template>
                <template v-else>
                  <el-option label="644 (rw-r--r--)" value="644" />
                  <el-option label="640 (rw-r-----)" value="640" />
                  <el-option label="664 (rw-rw-r--)" value="664" />
                  <el-option label="666 (rw-rw-rw-)" value="666" />
                  <el-option label="660 (rw-rw----)" value="660" />
                  <el-option label="600 (rw-------)" value="600" />
                </template>
              </el-select>
            </template>
          </el-table-column>
          
          <el-table-column label="递归" width="100" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.recursive" :disabled="row.type === 'file'" />
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ $index }">
              <el-button 
                type="danger" 
                size="small" 
                circle
                @click="removePermissionRule($index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      
      <!-- 设置选项 -->
      <el-card class="permissions-card">
        <template #header>
          <div class="card-header">
            <h3>权限检查与修复</h3>
          </div>
        </template>
        
        <el-form-item label="自动修复权限">
          <el-switch v-model="permissionsForm.autoFix" />
          <span class="switch-hint">{{ permissionsForm.autoFix ? '启用后系统将自动修复不符合设置的权限' : '禁用后需手动运行权限修复' }}</span>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="修复权限间隔">
              <el-select v-model="permissionsForm.fixInterval" style="width: 100%">
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
                <el-option label="从不" value="never" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上次修复时间">
              <el-input v-model="permissionsForm.lastFixTime" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        
        <div class="tool-actions">
          <el-button type="primary" @click="runPermissionCheck" :loading="checking">
            <el-icon><Warning /></el-icon>检查权限
          </el-button>
          <el-button type="success" @click="runPermissionFix" :loading="fixing">
            <el-icon><Check /></el-icon>修复权限
          </el-button>
        </div>
      </el-card>

      <el-divider />

      <el-form-item>
        <div class="form-actions">
          <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
          <el-button @click="resetForm">重置</el-button>
        </div>
      </el-form-item>
    </el-form>
    
    <!-- 权限检查结果对话框 -->
    <el-dialog v-model="checkResultVisible" title="权限检查结果" width="60%">
      <div v-if="permissionCheckResults.length === 0" class="no-issues">
        <el-result icon="success" title="权限检查通过" sub-title="未发现权限问题" />
      </div>
      
      <el-table v-else :data="permissionCheckResults" style="width: 100%" max-height="400px">
        <el-table-column prop="path" label="路径" min-width="250" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === 'dir' ? 'success' : 'info'">
              {{ row.type === 'dir' ? '目录' : '文件' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentMode" label="当前权限" width="120" />
        <el-table-column prop="expectedMode" label="期望权限" width="120" />
        <el-table-column prop="issue" label="问题描述" show-overflow-tooltip />
      </el-table>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="checkResultVisible = false">关闭</el-button>
          <el-button type="primary" @click="fixSelectedIssues" :disabled="permissionCheckResults.length === 0">修复所有问题</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Warning, Check } from '@element-plus/icons-vue';

const props = defineProps({
  website: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['save']);

// 状态
const saving = ref(false);
const checking = ref(false);
const fixing = ref(false);

// 权限检查结果对话框
const checkResultVisible = ref(false);
const permissionCheckResults = ref([]);

// 权限表单
const permissionsForm = reactive({
  // 默认权限设置
  defaultDirMode: '755',
  defaultFileMode: '644',
  owner: 'www-data',
  group: 'www-data',
  
  // 特殊权限规则
  rules: [],
  
  // 修复选项
  autoFix: true,
  fixInterval: 'weekly',
  lastFixTime: '从未执行'
});

// 添加权限规则
const addPermissionRule = () => {
  permissionsForm.rules.push({
    path: '',
    type: 'dir',
    mode: '755',
    recursive: true
  });
};

// 移除权限规则
const removePermissionRule = (index) => {
  permissionsForm.rules.splice(index, 1);
};

// 选择路径
const selectPath = async (row) => {
  try {
    // 这里应该调用系统的文件/目录选择对话框
    // 模拟路径选择
    const selectedPath = await new Promise(resolve => {
      setTimeout(() => {
        if (row.type === 'dir') {
          resolve('/uploads');
        } else {
          resolve('/index.php');
        }
      }, 500);
    });
    row.path = selectedPath;
  } catch (error) {
    ElMessage.error('选择路径失败：' + error.message);
  }
};

// 运行权限检查
const runPermissionCheck = async () => {
  checking.value = true;
  
  try {
    // 这里应该调用权限检查API
    // const response = await axios.post(`/api/websites/${props.website.id}/permissions/check`, permissionsForm);
    // permissionCheckResults.value = response.data.issues;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模拟检查结果
    permissionCheckResults.value = [
      {
        path: '/uploads',
        type: 'dir',
        currentMode: '777',
        expectedMode: '755',
        issue: '目录权限过高，存在安全风险'
      },
      {
        path: '/cache',
        type: 'dir',
        currentMode: '644',
        expectedMode: '755',
        issue: '目录权限不足，可能导致写入失败'
      },
      {
        path: '/config.php',
        type: 'file',
        currentMode: '666',
        expectedMode: '644',
        issue: '文件权限过高，存在安全风险'
      }
    ];
    
    checkResultVisible.value = true;
    
    if (permissionCheckResults.value.length > 0) {
      ElMessage.warning(`发现 ${permissionCheckResults.value.length} 个权限问题`);
    } else {
      ElMessage.success('权限检查通过，未发现问题');
    }
  } catch (error) {
    ElMessage.error('权限检查失败：' + error.message);
  } finally {
    checking.value = false;
  }
};

// 修复所选问题
const fixSelectedIssues = async () => {
  try {
    ElMessageBox.confirm('确定要修复所有权限问题吗？', '权限修复', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      runPermissionFix();
    });
  } catch (error) {
    // 用户取消操作
  }
};

// 运行权限修复
const runPermissionFix = async () => {
  fixing.value = true;
  
  try {
    // 这里应该调用权限修复API
    // const response = await axios.post(`/api/websites/${props.website.id}/permissions/fix`, permissionsForm);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 更新最后修复时间
    const now = new Date();
    permissionsForm.lastFixTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    
    // 清空检查结果
    permissionCheckResults.value = [];
    checkResultVisible.value = false;
    
    ElMessage.success('权限修复完成');
  } catch (error) {
    ElMessage.error('权限修复失败：' + error.message);
  } finally {
    fixing.value = false;
  }
};

// 保存配置
const saveConfig = async () => {
  saving.value = true;
  try {
    emit('save', permissionsForm);
  } finally {
    saving.value = false;
  }
};

// 重置表单
const resetForm = () => {
  // 默认权限设置
  permissionsForm.defaultDirMode = '755';
  permissionsForm.defaultFileMode = '644';
  permissionsForm.owner = 'www-data';
  permissionsForm.group = 'www-data';
  
  // 特殊权限规则
  permissionsForm.rules = [];
  
  // 修复选项
  permissionsForm.autoFix = true;
  permissionsForm.fixInterval = 'weekly';
  // 保留上次修复时间
};

// 加载权限配置
onMounted(async () => {
  try {
    // 这里应该调用获取权限配置API
    // const response = await axios.get(`/api/websites/${props.website.id}/permissions`);
    // Object.assign(permissionsForm, response.data);
    
    // 模拟加载数据
    const lastFixTime = new Date();
    lastFixTime.setDate(lastFixTime.getDate() - 5);
    
    permissionsForm.lastFixTime = lastFixTime.toLocaleDateString() + ' ' + lastFixTime.toLocaleTimeString();
    
    permissionsForm.rules = [
      {
        path: '/uploads',
        type: 'dir',
        mode: '775',
        recursive: true
      },
      {
        path: '/cache',
        type: 'dir',
        mode: '775',
        recursive: true
      },
      {
        path: '/config.php',
        type: 'file',
        mode: '640',
        recursive: false
      }
    ];
  } catch (error) {
    ElMessage.error('加载权限配置失败：' + error.message);
  }
});
</script>

<style scoped>
.permissions-config {
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

.permissions-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.switch-hint {
  margin-left: 10px;
  color: #909399;
  font-size: 13px;
}

.tool-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.no-rules, .no-issues {
  padding: 20px 0;
}

.tip {
  margin-top: 0;
  margin-bottom: 20px;
  color: #909399;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
}
</style> 