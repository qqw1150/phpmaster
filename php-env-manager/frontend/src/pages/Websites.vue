<template>
  <div class="websites-container">
    <div class="page-header">
      <h1>网站管理</h1>
      <div class="page-tools">
        <el-button type="primary" @click="addWebsite">
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
      
      <el-table :data="filteredWebsites" border stripe style="width: 100%">
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
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openWebsite(scope.row)">
              访问
            </el-button>
            <el-button size="small" type="success" @click="editWebsite(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="warning" @click="configureSSL(scope.row)">
              SSL
            </el-button>
            <el-button size="small" type="danger" @click="deleteWebsite(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';

// 网站列表
const websites = ref([
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
]);

// 搜索关键词
const searchQuery = ref('');

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

// 添加网站
const addWebsite = () => {
  ElMessage.info('打开添加网站对话框');
  // 这里应该打开添加网站的对话框
};

// 编辑网站
const editWebsite = (website) => {
  ElMessage.info(`编辑网站: ${website.name}`);
  // 这里应该打开编辑网站的对话框
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
  ).then(() => {
    // 这里应该调用删除API
    ElMessage.success(`网站 "${website.name}" 已成功删除`);
    // 从列表中移除
    websites.value = websites.value.filter(item => item.id !== website.id);
  }).catch(() => {
    // 取消操作
  });
};

// 配置SSL
const configureSSL = (website) => {
  ElMessage.info(`配置网站 "${website.name}" 的SSL证书`);
  // 这里应该打开SSL配置对话框
};

// 访问网站
const openWebsite = (website) => {
  const protocol = website.sslEnabled ? 'https' : 'http';
  const url = `${protocol}://${website.domain}`;
  // 这里应该打开网站链接
  window.open(url, '_blank');
  ElMessage.success(`正在打开: ${url}`);
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
</style> 