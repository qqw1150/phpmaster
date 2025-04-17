<template>
  <div class="security-config">
    <div class="config-header">
      <h2>安全配置</h2>
      <p class="config-description">配置网站的安全策略，增强网站防护能力</p>
    </div>

    <el-form :model="securityForm" label-position="top">
      <el-tabs type="border-card">
        <!-- 基本安全设置 -->
        <el-tab-pane label="基本安全设置">
          <el-form-item label="IP访问控制">
            <el-switch v-model="securityForm.ipRestriction.enabled" />
          </el-form-item>
          
          <template v-if="securityForm.ipRestriction.enabled">
            <el-form-item label="访问模式">
              <el-radio-group v-model="securityForm.ipRestriction.mode">
                <el-radio label="whitelist">白名单 (仅允许列表中的IP访问)</el-radio>
                <el-radio label="blacklist">黑名单 (禁止列表中的IP访问)</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="IP地址列表">
              <el-input 
                v-model="securityForm.ipRestriction.ipList" 
                type="textarea" 
                :rows="5" 
                placeholder="请输入IP地址，每行一个，支持CIDR格式，如：192.168.1.0/24"
              />
            </el-form-item>
          </template>
          
          <el-divider />
          
          <el-form-item label="HTTP认证">
            <el-switch v-model="securityForm.httpAuth.enabled" />
          </el-form-item>
          
          <template v-if="securityForm.httpAuth.enabled">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名">
                  <el-input v-model="securityForm.httpAuth.username" placeholder="请输入HTTP认证用户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密码">
                  <el-input v-model="securityForm.httpAuth.password" placeholder="请输入HTTP认证密码" type="password" show-password />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="认证提示">
              <el-input v-model="securityForm.httpAuth.realm" placeholder="请输入认证提示文字" />
            </el-form-item>
            
            <el-form-item label="排除目录">
              <el-input 
                v-model="securityForm.httpAuth.excludePaths" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入不需要HTTP认证的路径，每行一个，例如：/api, /public"
              />
            </el-form-item>
          </template>
        </el-tab-pane>
        
        <!-- 安全头部 -->
        <el-tab-pane label="安全头部">
          <el-form-item label="启用安全头部">
            <el-switch v-model="securityForm.securityHeaders.enabled" />
          </el-form-item>
          
          <template v-if="securityForm.securityHeaders.enabled">
            <el-divider>内容安全策略 (CSP)</el-divider>
            
            <el-form-item label="启用CSP">
              <el-switch v-model="securityForm.securityHeaders.csp.enabled" />
            </el-form-item>
            
            <template v-if="securityForm.securityHeaders.csp.enabled">
              <el-form-item label="默认源">
                <el-input v-model="securityForm.securityHeaders.csp.defaultSrc" placeholder="例如：'self'" />
              </el-form-item>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="脚本源">
                    <el-input v-model="securityForm.securityHeaders.csp.scriptSrc" placeholder="例如：'self' https://cdn.example.com" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="样式源">
                    <el-input v-model="securityForm.securityHeaders.csp.styleSrc" placeholder="例如：'self' https://fonts.googleapis.com" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="图片源">
                    <el-input v-model="securityForm.securityHeaders.csp.imgSrc" placeholder="例如：'self' data:" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="连接源">
                    <el-input v-model="securityForm.securityHeaders.csp.connectSrc" placeholder="例如：'self'" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="报告URI">
                <el-input v-model="securityForm.securityHeaders.csp.reportUri" placeholder="例如：/csp-report.php" />
              </el-form-item>
            </template>
            
            <el-divider>其他安全头部</el-divider>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="X-XSS-Protection">
                  <el-switch v-model="securityForm.securityHeaders.xssProtection" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="X-Content-Type-Options">
                  <el-switch v-model="securityForm.securityHeaders.contentTypeOptions" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="X-Frame-Options">
                  <el-select v-model="securityForm.securityHeaders.frameOptions" style="width: 100%">
                    <el-option label="不设置" value="" />
                    <el-option label="DENY" value="DENY" />
                    <el-option label="SAMEORIGIN" value="SAMEORIGIN" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Strict-Transport-Security">
                  <el-switch v-model="securityForm.securityHeaders.hsts.enabled" />
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="securityForm.securityHeaders.hsts.enabled">
                <el-form-item label="HSTS最大生存期(秒)">
                  <el-input-number v-model="securityForm.securityHeaders.hsts.maxAge" :min="0" :max="31536000" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Referrer-Policy">
                  <el-select v-model="securityForm.securityHeaders.referrerPolicy" style="width: 100%">
                    <el-option label="不设置" value="" />
                    <el-option label="no-referrer" value="no-referrer" />
                    <el-option label="no-referrer-when-downgrade" value="no-referrer-when-downgrade" />
                    <el-option label="origin" value="origin" />
                    <el-option label="origin-when-cross-origin" value="origin-when-cross-origin" />
                    <el-option label="same-origin" value="same-origin" />
                    <el-option label="strict-origin" value="strict-origin" />
                    <el-option label="strict-origin-when-cross-origin" value="strict-origin-when-cross-origin" />
                    <el-option label="unsafe-url" value="unsafe-url" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Permissions-Policy">
                  <el-input v-model="securityForm.securityHeaders.permissionsPolicy" placeholder="例如：camera=(), microphone=()" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </el-tab-pane>
        
        <!-- 防护规则 -->
        <el-tab-pane label="防护规则">
          <el-form-item label="启用防护规则">
            <el-switch v-model="securityForm.protection.enabled" />
          </el-form-item>
          
          <template v-if="securityForm.protection.enabled">
            <el-card class="protection-card">
              <template #header>
                <div class="protection-header">
                  <h3>基本防护</h3>
                </div>
              </template>
              
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="SQL注入防护">
                    <el-switch v-model="securityForm.protection.sqlInjection" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="XSS攻击防护">
                    <el-switch v-model="securityForm.protection.xss" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="目录遍历防护">
                    <el-switch v-model="securityForm.protection.directoryTraversal" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="文件包含防护">
                    <el-switch v-model="securityForm.protection.fileInclusion" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="命令注入防护">
                    <el-switch v-model="securityForm.protection.commandInjection" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="远程文件执行防护">
                    <el-switch v-model="securityForm.protection.remoteFileExecution" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>
            
            <el-card class="protection-card">
              <template #header>
                <div class="protection-header">
                  <h3>速率限制</h3>
                </div>
              </template>
              
              <el-form-item label="启用请求速率限制">
                <el-switch v-model="securityForm.protection.rateLimit.enabled" />
              </el-form-item>
              
              <template v-if="securityForm.protection.rateLimit.enabled">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="每分钟最大请求数">
                      <el-input-number v-model="securityForm.protection.rateLimit.maxRequests" :min="1" :max="10000" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="突发请求限制">
                      <el-input-number v-model="securityForm.protection.rateLimit.burstLimit" :min="1" :max="1000" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                
                <el-form-item label="白名单IP">
                  <el-input 
                    v-model="securityForm.protection.rateLimit.whitelist" 
                    type="textarea" 
                    :rows="3" 
                    placeholder="请输入不受速率限制的IP地址，每行一个"
                  />
                </el-form-item>
              </template>
            </el-card>
            
            <el-card class="protection-card">
              <template #header>
                <div class="protection-header">
                  <h3>自定义防护规则</h3>
                </div>
              </template>
              
              <div class="custom-rules-toolbar">
                <el-button type="primary" @click="addCustomRule" size="small">添加规则</el-button>
              </div>
              
              <div v-if="securityForm.protection.customRules.length === 0" class="no-rules">
                <el-empty description="暂无自定义规则" />
              </div>
              
              <el-collapse v-else accordion>
                <el-collapse-item v-for="(rule, index) in securityForm.protection.customRules" :key="index" :name="index">
                  <template #title>
                    <div class="rule-title">
                      <span>规则 #{{ index + 1 }}: {{ rule.name || '未命名规则' }}</span>
                    </div>
                  </template>
                  
                  <el-form-item label="规则名称">
                    <el-input v-model="rule.name" placeholder="请输入规则名称" />
                  </el-form-item>
                  
                  <el-form-item label="规则类型">
                    <el-select v-model="rule.type" style="width: 100%">
                      <el-option label="阻止请求路径" value="blockPath" />
                      <el-option label="阻止请求参数" value="blockParam" />
                      <el-option label="阻止User-Agent" value="blockUserAgent" />
                      <el-option label="阻止请求方法" value="blockMethod" />
                      <el-option label="正则表达式匹配" value="regex" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="匹配模式">
                    <el-input v-model="rule.pattern" placeholder="请输入匹配的模式" />
                  </el-form-item>
                  
                  <el-form-item label="动作">
                    <el-select v-model="rule.action" style="width: 100%">
                      <el-option label="返回403禁止访问" value="403" />
                      <el-option label="返回404页面未找到" value="404" />
                      <el-option label="重定向到首页" value="redirect" />
                      <el-option label="仅记录不阻止" value="log" />
                    </el-select>
                  </el-form-item>
                  
                  <div class="rule-actions">
                    <el-button type="danger" size="small" @click.stop="removeCustomRule(index)">删除规则</el-button>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </el-card>
          </template>
        </el-tab-pane>
      </el-tabs>

      <el-divider />

      <el-form-item>
        <div class="form-actions">
          <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="testConfig" :loading="testing">测试配置</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  website: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['save']);

// 保存状态
const saving = ref(false);
const testing = ref(false);

// 安全配置表单
const securityForm = reactive({
  // IP访问控制
  ipRestriction: {
    enabled: false,
    mode: 'blacklist',
    ipList: ''
  },
  
  // HTTP认证
  httpAuth: {
    enabled: false,
    username: '',
    password: '',
    realm: '请输入用户名和密码',
    excludePaths: ''
  },
  
  // 安全头部
  securityHeaders: {
    enabled: false,
    
    // 内容安全策略
    csp: {
      enabled: false,
      defaultSrc: "'self'",
      scriptSrc: "'self'",
      styleSrc: "'self'",
      imgSrc: "'self' data:",
      connectSrc: "'self'",
      reportUri: ''
    },
    
    // 其他安全头部
    xssProtection: true,
    contentTypeOptions: true,
    frameOptions: 'SAMEORIGIN',
    hsts: {
      enabled: false,
      maxAge: 31536000
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: ''
  },
  
  // 防护规则
  protection: {
    enabled: false,
    
    // 基本防护
    sqlInjection: true,
    xss: true,
    directoryTraversal: true,
    fileInclusion: true,
    commandInjection: true,
    remoteFileExecution: true,
    
    // 速率限制
    rateLimit: {
      enabled: false,
      maxRequests: 300,
      burstLimit: 50,
      whitelist: ''
    },
    
    // 自定义规则
    customRules: []
  }
});

// 添加自定义规则
const addCustomRule = () => {
  securityForm.protection.customRules.push({
    name: '',
    type: 'blockPath',
    pattern: '',
    action: '403'
  });
};

// 删除自定义规则
const removeCustomRule = (index) => {
  securityForm.protection.customRules.splice(index, 1);
};

// 保存配置
const saveConfig = async () => {
  saving.value = true;
  try {
    emit('save', securityForm);
  } finally {
    saving.value = false;
  }
};

// 测试配置
const testConfig = async () => {
  testing.value = true;
  try {
    // 这里应该调用配置测试API
    // const response = await axios.post(`/api/websites/${props.website.id}/security/test`, securityForm);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    ElMessage.success('安全配置测试通过');
  } catch (error) {
    ElMessage.error('测试安全配置失败：' + error.message);
  } finally {
    testing.value = false;
  }
};

// 重置表单
const resetForm = () => {
  // IP访问控制
  securityForm.ipRestriction.enabled = false;
  securityForm.ipRestriction.mode = 'blacklist';
  securityForm.ipRestriction.ipList = '';
  
  // HTTP认证
  securityForm.httpAuth.enabled = false;
  securityForm.httpAuth.username = '';
  securityForm.httpAuth.password = '';
  securityForm.httpAuth.realm = '请输入用户名和密码';
  securityForm.httpAuth.excludePaths = '';
  
  // 安全头部
  securityForm.securityHeaders.enabled = false;
  securityForm.securityHeaders.csp.enabled = false;
  securityForm.securityHeaders.csp.defaultSrc = "'self'";
  securityForm.securityHeaders.csp.scriptSrc = "'self'";
  securityForm.securityHeaders.csp.styleSrc = "'self'";
  securityForm.securityHeaders.csp.imgSrc = "'self' data:";
  securityForm.securityHeaders.csp.connectSrc = "'self'";
  securityForm.securityHeaders.csp.reportUri = '';
  securityForm.securityHeaders.xssProtection = true;
  securityForm.securityHeaders.contentTypeOptions = true;
  securityForm.securityHeaders.frameOptions = 'SAMEORIGIN';
  securityForm.securityHeaders.hsts.enabled = false;
  securityForm.securityHeaders.hsts.maxAge = 31536000;
  securityForm.securityHeaders.referrerPolicy = 'strict-origin-when-cross-origin';
  securityForm.securityHeaders.permissionsPolicy = '';
  
  // 防护规则
  securityForm.protection.enabled = false;
  securityForm.protection.sqlInjection = true;
  securityForm.protection.xss = true;
  securityForm.protection.directoryTraversal = true;
  securityForm.protection.fileInclusion = true;
  securityForm.protection.commandInjection = true;
  securityForm.protection.remoteFileExecution = true;
  securityForm.protection.rateLimit.enabled = false;
  securityForm.protection.rateLimit.maxRequests = 300;
  securityForm.protection.rateLimit.burstLimit = 50;
  securityForm.protection.rateLimit.whitelist = '';
  securityForm.protection.customRules = [];
};

// 加载安全配置
onMounted(async () => {
  try {
    // 这里应该调用获取安全配置API
    // const response = await axios.get(`/api/websites/${props.website.id}/security`);
    // Object.assign(securityForm, response.data);
    
    // 模拟加载数据
    if (props.website.name.includes('博客')) {
      securityForm.securityHeaders.enabled = true;
      securityForm.securityHeaders.xssProtection = true;
      securityForm.securityHeaders.contentTypeOptions = true;
      securityForm.securityHeaders.frameOptions = 'SAMEORIGIN';
      
      securityForm.protection.enabled = true;
      securityForm.protection.sqlInjection = true;
      securityForm.protection.xss = true;
      
      securityForm.protection.customRules = [
        {
          name: '阻止常见后台探测',
          type: 'blockPath',
          pattern: '/wp-admin, /admin, /administrator',
          action: '404'
        }
      ];
    }
  } catch (error) {
    ElMessage.error('加载安全配置失败：' + error.message);
  }
});
</script>

<style scoped>
.security-config {
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

.protection-card {
  margin-bottom: 20px;
}

.protection-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.custom-rules-toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.rule-title {
  display: flex;
  align-items: center;
}

.rule-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.no-rules {
  padding: 20px 0;
}

.form-actions {
  display: flex;
  gap: 10px;
}
</style> 