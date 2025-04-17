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

// 全局前置守卫：修改页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title 
    ? `${to.meta.title} - PHP环境管理器` 
    : 'PHP环境管理器';
  next();
});

export default router; 