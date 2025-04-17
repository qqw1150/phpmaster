<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="logo-container">
        <img src="./assets/logo.png" alt="PHP环境管理器" class="logo">
        <h1 class="app-name">PHP环境管理器</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/">
          <el-icon><Monitor /></el-icon>
          <span>控制面板</span>
        </el-menu-item>
        <el-menu-item index="/services">
          <el-icon><SetUp /></el-icon>
          <span>服务管理</span>
        </el-menu-item>
        <el-menu-item index="/websites">
          <el-icon><Menu /></el-icon>
          <span>网站管理</span>
        </el-menu-item>
        <el-menu-item index="/databases">
          <el-icon><DataLine /></el-icon>
          <span>数据库管理</span>
        </el-menu-item>
        <el-menu-item index="/php">
          <el-icon><Connection /></el-icon>
          <span>PHP管理</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <div class="top-navbar">
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="!isHome">{{ currentPage }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="user-info">
          <el-dropdown>
            <span class="user-dropdown-link">
              管理员 <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 路由视图 -->
      <div class="content-area">
        <div class="service-dashboard">
          <h2 class="dashboard-title">服务状态概览</h2>
          
          <div class="service-cards">
            <el-row :gutter="20">
              <el-col :span="8" v-for="(service, key) in services" :key="key">
                <el-card class="service-card" :body-style="{ padding: '0px' }">
                  <div class="service-header" :class="{'active': service.running, 'inactive': !service.running}">
                    <h3 class="service-name">{{ getServiceDisplayName(key) }}</h3>
                    <div class="status-indicator">
                      <span class="status-dot" :class="{'active': service.running, 'inactive': !service.running}"></span>
                      {{ service.running ? '运行中' : '已停止' }}
                    </div>
                  </div>
                  <div class="service-body">
                    <div class="service-info">
                      <p><strong>端口:</strong> {{ service.port }}</p>
                      <p><strong>版本:</strong> {{ service.version || '默认' }}</p>
                    </div>
                    <div class="service-actions">
                      <el-button 
                        type="success" 
                        size="small" 
                        :disabled="service.running"
                        @click="startService(key)"
                      >
                        启动
                      </el-button>
                      <el-button 
                        type="danger" 
                        size="small" 
                        :disabled="!service.running"
                        @click="stopService(key)"
                      >
                        停止
                      </el-button>
                      <el-button 
                        type="primary" 
                        size="small" 
                        :disabled="!service.running"
                        @click="restartService(key)"
                      >
                        重启
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { 
  Monitor, SetUp, Menu, DataLine, 
  Connection, Setting, ArrowDown
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 当前路由
const route = useRoute();

// 计算当前页面名称
const currentPage = computed(() => {
  const routeMap = {
    '/': '控制面板',
    '/services': '服务管理',
    '/websites': '网站管理',
    '/databases': '数据库管理',
    '/php': 'PHP管理',
    '/settings': '系统设置'
  };
  return routeMap[route.path] || '未知页面';
});

// 判断是否为首页
const isHome = computed(() => route.path === '/');

// 当前激活的菜单项
const activeMenu = computed(() => route.path);

// 服务列表
const services = ref({});

// 获取服务显示名称
const getServiceDisplayName = (serviceKey) => {
  const displayNames = {
    nginx: 'Nginx服务器',
    apache: 'Apache服务器',
    mysql: 'MySQL数据库',
    mariadb: 'MariaDB数据库',
    php7: 'PHP 7.4',
    php8: 'PHP 8.1'
  };
  return displayNames[serviceKey] || serviceKey;
};

// 启动服务
const startService = async (serviceName) => {
  try {
    const result = await window.phpEnvManager.service.startService(serviceName);
    if (result.success) {
      ElMessage.success(result.message);
      services.value[serviceName].running = true;
    } else {
      ElMessage.error(result.message || '启动服务失败');
    }
  } catch (error) {
    ElMessage.error(`启动服务出错: ${error.message}`);
  }
};

// 停止服务
const stopService = async (serviceName) => {
  try {
    const result = await window.phpEnvManager.service.stopService(serviceName);
    if (result.success) {
      ElMessage.success(result.message);
      services.value[serviceName].running = false;
    } else {
      ElMessage.error(result.message || '停止服务失败');
    }
  } catch (error) {
    ElMessage.error(`停止服务出错: ${error.message}`);
  }
};

// 重启服务
const restartService = async (serviceName) => {
  try {
    const result = await window.phpEnvManager.service.restartService(serviceName);
    if (result.success) {
      ElMessage.success(result.message);
    } else {
      ElMessage.error(result.message || '重启服务失败');
    }
  } catch (error) {
    ElMessage.error(`重启服务出错: ${error.message}`);
  }
};

// 获取所有服务状态
const getServiceStatus = async () => {
  try {
    const servicesData = await window.phpEnvManager.service.getServiceStatus();
    services.value = {
      ...servicesData,
      // 添加缺少的版本信息
      nginx: { ...servicesData.nginx, version: '1.20.2' },
      apache: { ...servicesData.apache, version: '2.4.54' },
      mysql: { ...servicesData.mysql, version: '8.0.30' },
      mariadb: { ...servicesData.mariadb, version: '10.6.8' },
      php7: { ...servicesData.php7, version: '7.4.30' },
      php8: { ...servicesData.php8, version: '8.1.10' }
    };
  } catch (error) {
    ElMessage.error(`获取服务状态失败: ${error.message}`);
  }
};

// 组件挂载时获取服务状态
onMounted(() => {
  getServiceStatus();
});
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background-color: #001529;
  color: white;
  height: 100%;
  overflow-y: auto;
}

.logo-container {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.logo {
  width: 60px;
  height: 60px;
}

.app-name {
  margin-top: 10px;
  font-size: 18px;
  color: white;
}

.sidebar-menu {
  border-right: none;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-navbar {
  height: 64px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.user-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

.dashboard-title {
  margin-bottom: 20px;
  font-weight: 500;
  color: #333;
}

.service-cards {
  margin-bottom: 20px;
}

.service-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.service-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.service-header {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-header.active {
  background-color: #f0f9eb;
}

.service-header.inactive {
  background-color: #fef0f0;
}

.service-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-dot.active {
  background-color: #67c23a;
}

.status-dot.inactive {
  background-color: #f56c6c;
}

.service-body {
  padding: 15px;
}

.service-info {
  margin-bottom: 15px;
}

.service-actions {
  display: flex;
  justify-content: space-between;
}
</style> 