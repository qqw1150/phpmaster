<template>
  <div class="app-container">
    <!-- 导航侧边栏 -->
    <aside class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="logo-container">
        <img src="./assets/logo.png" alt="PHP环境管理器" class="logo" />
        <span v-if="!sidebarCollapsed" class="title">PHP环境管理器</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="sidebarCollapsed"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><Monitor /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <el-menu-item index="/services">
          <el-icon><Cpu /></el-icon>
          <template #title>服务管理</template>
        </el-menu-item>
        
        <el-menu-item index="/sites">
          <el-icon><Document /></el-icon>
          <template #title>站点管理</template>
        </el-menu-item>
        
        <el-menu-item index="/php">
          <el-icon><Connection /></el-icon>
          <template #title>PHP管理</template>
        </el-menu-item>
        
        <el-menu-item index="/database">
          <el-icon><DataLine /></el-icon>
          <template #title>数据库管理</template>
        </el-menu-item>
        
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>设置</template>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <el-tooltip
          :content="sidebarCollapsed ? '展开菜单' : '收起菜单'"
          placement="right"
        >
          <el-button
            class="collapse-btn"
            @click="toggleSidebar"
            :icon="sidebarCollapsed ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'"
            circle
          ></el-button>
        </el-tooltip>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="left">
          <span class="breadcrumb">{{ currentRoute }}</span>
        </div>
        <div class="right">
          <el-tooltip content="刷新" placement="bottom">
            <el-button circle @click="refreshPage">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-dropdown trigger="click">
            <span class="user-dropdown">
              <el-avatar :size="32" icon="el-icon-user"></el-avatar>
              <span class="username">Admin</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openSettingsPage">系统设置</el-dropdown-item>
                <el-dropdown-item divided @click="showAboutInfo">关于</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区域 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Monitor, Cpu, Document, Connection, DataLine, Setting, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    Monitor,
    Cpu,
    Document,
    Connection,
    DataLine,
    Setting,
    Refresh
  },
  setup() {
    // 侧边栏状态
    const sidebarCollapsed = ref(false)
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
      // 将状态保存到localStorage
      localStorage.setItem('sidebarStatus', sidebarCollapsed.value ? '1' : '0')
    }

    // 路由相关
    const route = useRoute()
    const router = useRouter()
    const activeMenu = computed(() => route.path)
    const currentRoute = computed(() => {
      return route.meta.title || route.name || '仪表盘'
    })
    
    // 缓存页面
    const cachedViews = ref(['Dashboard', 'Services', 'Sites', 'PHP', 'Database'])
    
    // 页面刷新
    const refreshPage = () => {
      ElMessage({
        message: '页面刷新中...',
        type: 'info',
        duration: 1000
      })
      
      // 模拟页面刷新效果
      setTimeout(() => {
        router.go(0)
      }, 500)
    }
    
    // 打开设置页面
    const openSettingsPage = () => {
      router.push('/settings')
    }
    
    // 显示关于信息
    const showAboutInfo = () => {
      ElMessageBox.alert(
        'PHP环境管理器 v1.0.0\n一个跨平台的PHP开发环境管理工具',
        '关于',
        {
          confirmButtonText: '确定',
          callback: () => {}
        }
      )
    }
    
    // 监听后端事件
    const setupBackendListeners = () => {
      // 监听服务状态变化
      window.phpEnvManager.events.onServiceStatusChange((event, data) => {
        console.log('服务状态变化:', data)
        // 可以在此处理服务状态变化，例如更新UI或显示通知
      })
      
      // 监听后端服务终止
      window.phpEnvManager.events.onBackendTerminated((event) => {
        ElMessageBox.alert(
          '后端服务已终止，应用将无法正常工作。请重启应用。',
          '错误',
          {
            type: 'error',
            confirmButtonText: '退出应用',
            callback: () => {
              // 通知主进程关闭应用
              window.phpEnvManager.system.quit()
            }
          }
        )
      })
    }
    
    // 组件挂载时
    onMounted(() => {
      // 从localStorage读取侧边栏状态
      const sidebarStatus = localStorage.getItem('sidebarStatus')
      sidebarCollapsed.value = sidebarStatus === '1'
      
      // 设置后端事件监听
      setupBackendListeners()
    })
    
    // 组件卸载时
    onUnmounted(() => {
      // 清理工作（如有需要）
    })
    
    return {
      sidebarCollapsed,
      toggleSidebar,
      activeMenu,
      currentRoute,
      cachedViews,
      refreshPage,
      openSettingsPage,
      showAboutInfo
    }
  }
}
</script>

<style>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 220px;
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
  position: relative;
  overflow-y: auto;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 64px;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-bottom: 1px solid #424f63;
}

.logo {
  width: 32px;
  height: 32px;
}

.title {
  margin-left: 10px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  background-color: #273246;
  display: flex;
  justify-content: center;
  align-items: center;
}

.collapse-btn {
  color: #bfcbd9;
}

/* 主内容区域样式 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
}

.breadcrumb {
  font-size: 18px;
  color: #606266;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 