<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="logo-container">
        <img src="./assets/logo.svg" alt="PHP环境管理器" class="logo">
        <h1 class="app-name">PHP环境管理器</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        router
        @select="handleMenuClick"
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
        <el-menu-item index="/software" v-if="isWindowsPlatform">
          <el-icon><Download /></el-icon>
          <span>软件管理</span>
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
        <!-- 使用路由视图显示组件 -->
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Monitor, SetUp, Menu, DataLine, 
  Connection, Setting, ArrowDown, Download
} from '@element-plus/icons-vue';

// 当前路由
const route = useRoute();
// 路由器实例
const router = useRouter();

// 计算当前页面名称
const currentPage = computed(() => {
  const routeMap = {
    '/': '控制面板',
    '/services': '服务管理',
    '/websites': '网站管理',
    '/databases': '数据库管理',
    '/php': 'PHP管理',
    '/software': '软件管理',
    '/settings': '系统设置'
  };
  return routeMap[route.path] || '未知页面';
});

// 判断是否为首页
const isHome = computed(() => route.path === '/');

// 判断是否为Windows平台
const isWindowsPlatform = computed(() => {
  // 浏览器环境下默认显示
  if (typeof window !== 'undefined' && !window?.electron) {
    return true;
  }
  
  // 从electron上下文获取平台信息
  const platform = window?.electron?.platform || 'win32'; // 默认为win32
  return platform === 'win32';
});

// 当前激活的菜单项
const activeMenu = computed(() => route.path);

// 菜单项点击处理函数
const handleMenuClick = (key) => {
  router.push(key);
};
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
</style> 