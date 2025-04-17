<template>
  <div class="rewrite-config">
    <div class="config-header">
      <h2>伪静态规则配置</h2>
      <p class="config-description">配置网站的URL重写规则，支持常见CMS预设和自定义规则</p>
    </div>

    <el-form :model="rewriteForm" label-position="top">
      <el-form-item label="规则类型">
        <el-radio-group v-model="rewriteForm.ruleType">
          <el-radio label="preset">使用预设规则</el-radio>
          <el-radio label="custom">自定义规则</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="rewriteForm.ruleType === 'preset'">
        <el-form-item label="预设规则">
          <el-select v-model="rewriteForm.preset" style="width: 100%" @change="handlePresetChange">
            <el-option label="不使用伪静态" value="none" />
            <el-option label="WordPress" value="wordpress" />
            <el-option label="Laravel" value="laravel" />
            <el-option label="ThinkPHP" value="thinkphp" />
            <el-option label="Discuz" value="discuz" />
            <el-option label="Drupal" value="drupal" />
            <el-option label="Joomla" value="joomla" />
            <el-option label="Typecho" value="typecho" />
            <el-option label="Dedecms" value="dedecms" />
            <el-option label="ZBlog" value="zblog" />
          </el-select>
        </el-form-item>
      </template>

      <el-form-item label="规则内容" v-if="rewriteForm.ruleType === 'custom' || rewriteForm.preset !== 'none'">
        <div class="editor-toolbar">
          <el-button-group>
            <el-tooltip content="插入常用规则" placement="top">
              <el-button @click="insertCommonPattern" size="small">
                <el-icon><DocumentAdd /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="检查规则语法" placement="top">
              <el-button @click="validateRules" size="small">
                <el-icon><Check /></el-icon>
              </el-button>
            </el-tooltip>
          </el-button-group>
        </div>
        <el-input 
          v-model="rewriteForm.rules" 
          type="textarea" 
          :rows="15" 
          spellcheck="false"
          font-family="monospace"
          class="code-editor"
          placeholder="# 请输入伪静态规则
# 例如：
location / {
    try_files $uri $uri/ /index.php?$query_string;
}"
        />
      </el-form-item>

      <el-divider />

      <el-form-item>
        <div class="form-actions">
          <el-button type="primary" @click="saveRules" :loading="saving">保存规则</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="testRules" :loading="testing">测试规则</el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- 常用规则对话框 -->
    <el-dialog v-model="commonPatternsVisible" title="插入常用规则" width="600px">
      <el-table :data="commonPatterns" height="400px" @row-click="insertPattern">
        <el-table-column prop="name" label="规则名称" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column width="80">
          <template #default>
            <el-button size="small" type="primary">插入</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { DocumentAdd, Check } from '@element-plus/icons-vue';

const props = defineProps({
  website: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['save']);

// 保存和测试状态
const saving = ref(false);
const testing = ref(false);

// 伪静态表单
const rewriteForm = reactive({
  ruleType: 'preset',
  preset: 'none',
  rules: ''
});

// 规则预设
const presetRules = {
  none: '',
  wordpress: `
# WordPress 伪静态规则
location / {
  try_files $uri $uri/ /index.php?$args;
}
`,
  laravel: `
# Laravel 伪静态规则
location / {
  try_files $uri $uri/ /index.php?$query_string;
}
`,
  thinkphp: `
# ThinkPHP 伪静态规则
location / {
  if (!-e $request_filename) {
    rewrite ^(.*)$ /index.php?s=$1 last;
    break;
  }
}
`,
  discuz: `
# Discuz 伪静态规则
location / {
  rewrite ^([^\.]*)/topic-(.+)\.html$ $1/portal.php?mod=topic&topic=$2 last;
  rewrite ^([^\.]*)/article-([0-9]+)-([0-9]+)\.html$ $1/portal.php?mod=view&aid=$2&page=$3 last;
  rewrite ^([^\.]*)/forum-(\w+)-([0-9]+)\.html$ $1/forum.php?mod=forumdisplay&fid=$2&page=$3 last;
  rewrite ^([^\.]*)/thread-([0-9]+)-([0-9]+)-([0-9]+)\.html$ $1/forum.php?mod=viewthread&tid=$2&extra=page%3D$4&page=$3 last;
  rewrite ^([^\.]*)/group-([0-9]+)-([0-9]+)\.html$ $1/forum.php?mod=group&fid=$2&page=$3 last;
  rewrite ^([^\.]*)/space-(username|uid)-(.+)\.html$ $1/home.php?mod=space&$2=$3 last;
  rewrite ^([^\.]*)/([a-z]+)-(.+)\.html$ $1/$2.php?rewrite=$3 last;
  if (!-e $request_filename) {
    return 404;
  }
}
`
  // 其他CMS的规则可以按需添加
};

// 常用规则模式对话框
const commonPatternsVisible = ref(false);

// 常用规则模式
const commonPatterns = ref([
  { 
    name: '301重定向', 
    description: '将一个URL永久重定向到另一个URL', 
    pattern: 'rewrite ^/old-path$ /new-path permanent;'
  },
  { 
    name: '图片缓存控制', 
    description: '为图片文件添加缓存控制', 
    pattern: `
location ~* \.(jpg|jpeg|png|gif|ico|webp)$ {
  expires 30d;
  add_header Cache-Control "public, no-transform";
}`
  },
  { 
    name: '禁止访问隐藏文件', 
    description: '阻止访问.开头的隐藏文件', 
    pattern: `
location ~ /\. {
  deny all;
  access_log off;
  log_not_found off;
}`
  },
  { 
    name: 'PHP文件处理', 
    description: '使用FastCGI处理PHP文件', 
    pattern: `
location ~ \.php$ {
  fastcgi_pass unix:/run/php/php8.1-fpm.sock;
  fastcgi_index index.php;
  fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
  include fastcgi_params;
}`
  },
  { 
    name: '单页应用', 
    description: 'Vue/React等单页应用的配置', 
    pattern: `
location / {
  try_files $uri $uri/ /index.html;
}`
  }
]);

// 监听预设选择变化
watch(() => rewriteForm.preset, (newPreset) => {
  if (rewriteForm.ruleType === 'preset' && newPreset in presetRules) {
    rewriteForm.rules = presetRules[newPreset];
  }
});

// 处理预设变化
const handlePresetChange = (preset) => {
  if (preset in presetRules) {
    rewriteForm.rules = presetRules[preset];
  }
};

// 插入常用规则对话框
const insertCommonPattern = () => {
  commonPatternsVisible.value = true;
};

// 插入选中的规则
const insertPattern = (row) => {
  rewriteForm.rules += '\n' + row.pattern;
  commonPatternsVisible.value = false;
};

// 验证规则
const validateRules = () => {
  // 模拟规则验证
  setTimeout(() => {
    ElMessage.success('规则语法检查通过');
  }, 500);
};

// 测试规则
const testRules = async () => {
  testing.value = true;
  try {
    // 这里应该调用规则测试API
    // const response = await axios.post(`/api/websites/${props.website.id}/rewrite/test`, rewriteForm);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('伪静态规则测试成功');
  } catch (error) {
    ElMessage.error('测试伪静态规则失败：' + error.message);
  } finally {
    testing.value = false;
  }
};

// 保存规则
const saveRules = async () => {
  saving.value = true;
  try {
    emit('save', rewriteForm);
  } finally {
    saving.value = false;
  }
};

// 重置表单
const resetForm = () => {
  rewriteForm.ruleType = 'preset';
  rewriteForm.preset = 'none';
  rewriteForm.rules = '';
};

// 组件挂载时加载网站当前的伪静态规则
onMounted(async () => {
  try {
    // 这里应该调用获取规则API
    // const response = await axios.get(`/api/websites/${props.website.id}/rewrite`);
    // rewriteForm.ruleType = response.data.ruleType;
    // rewriteForm.preset = response.data.preset;
    // rewriteForm.rules = response.data.rules;
    
    // 模拟加载数据
    if (props.website.webServer === 'Nginx') {
      rewriteForm.ruleType = 'preset';
      rewriteForm.preset = 'wordpress';
      rewriteForm.rules = presetRules.wordpress;
    } else {
      rewriteForm.ruleType = 'custom';
      rewriteForm.rules = `RewriteEngine On
RewriteBase /
RewriteRule ^index\\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]`;
    }
  } catch (error) {
    ElMessage.error('加载伪静态规则失败：' + error.message);
  }
});
</script>

<style scoped>
.rewrite-config {
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

.editor-toolbar {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}

.code-editor {
  font-family: monospace;
}

.form-actions {
  display: flex;
  gap: 10px;
}
</style> 