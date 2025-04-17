// 路由配置文件
import { createRouter, createWebHashHistory } from 'vue-router';

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Dashboard.vue'),
    meta: { title: '控制面板' }
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../pages/Services.vue'),
    meta: { title: '服务管理' }
  },
  {
    path: '/websites',
    name: 'Websites',
    component: () => import('../pages/Websites.vue'),
    meta: { title: '网站管理' }
  },
  {
    path: '/databases',
    name: 'Databases',
    component: () => import('../pages/Databases.vue'),
    meta: { title: '数据库管理' }
  },
  {
    path: '/php',
    name: 'PHP',
    component: () => import('../pages/PHP.vue'),
    meta: { title: 'PHP管理' }
  },
  {
    path: '/software',
    name: 'Software',
    component: () => import('../pages/Software.vue'),
    meta: { title: '软件管理', platform: 'win32' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/Settings.vue'),
    meta: { title: '系统设置' }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue')
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 全局前置守卫：修改页面标题，处理平台兼容
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title 
    ? `${to.meta.title} - PHP环境管理器` 
    : 'PHP环境管理器';
    
  // 检查路由是否有平台限制
  if (to.meta.platform && !isRunningOnPlatform(to.meta.platform)) {
    // 如果不在指定平台上，重定向到首页
    next({ path: '/' });
    return;
  }
  
  next();
});

// 检查当前运行平台
function isRunningOnPlatform(platform) {
  // 在浏览器环境直接返回true用于开发测试
  if (typeof window !== 'undefined' && !window.electron) {
    return true;
  }
  
  // 从electron上下文获取平台信息
  const currentPlatform = window.electron?.platform || 'win32'; // 默认为win32
  return currentPlatform === platform;
}

export default router; 