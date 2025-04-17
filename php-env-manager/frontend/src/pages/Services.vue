<template>
  <div class="services-container">
    <div class="page-header">
      <h1>服务管理</h1>
      <div class="page-tools">
        <el-button type="primary" @click="refreshServices">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
        <el-button type="success" @click="startAllServices">
          <el-icon><VideoPlay /></el-icon>启动全部
        </el-button>
        <el-button type="danger" @click="stopAllServices">
          <el-icon><VideoPause /></el-icon>停止全部
        </el-button>
      </div>
    </div>

    <el-card class="services-card">
      <template #header>
        <div class="card-header">
          <span>系统服务</span>
        </div>
      </template>
      
      <el-table :data="services" border stripe style="width: 100%">
        <el-table-column prop="name" label="服务名称" width="180" />
        <el-table-column prop="description" label="服务描述" min-width="200" />
        <el-table-column prop="port" label="端口" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.running ? 'success' : 'danger'">
              {{ scope.row.running ? '运行中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              :type="scope.row.running ? 'danger' : 'success'" 
              @click="toggleService(scope.row)"
            >
              {{ scope.row.running ? '停止' : '启动' }}
            </el-button>
            <el-button 
              size="small" 
              type="warning" 
              :disabled="!scope.row.running"
              @click="restartService(scope.row)"
            >
              重启
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="configureService(scope.row)"
            >
              配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, VideoPlay, VideoPause } from '@element-plus/icons-vue';

// 服务列表
const services = ref([
  {
    id: 'nginx',
    name: 'Nginx',
    description: 'Web服务器',
    port: 80,
    running: true
  },
  {
    id: 'apache',
    name: 'Apache',
    description: '备用Web服务器',
    port: 8080,
    running: false
  },
  {
    id: 'mysql',
    name: 'MySQL',
    description: '数据库服务器',
    port: 3306,
    running: true
  },
  {
    id: 'mariadb',
    name: 'MariaDB',
    description: '备用数据库服务器',
    port: 3307,
    running: false
  },
  {
    id: 'redis',
    name: 'Redis',
    description: '缓存服务器',
    port: 6379,
    running: true
  },
  {
    id: 'memcached',
    name: 'Memcached',
    description: '备用缓存服务器',
    port: 11211,
    running: false
  }
]);

// 刷新服务状态
const refreshServices = async () => {
  ElMessage.info('正在刷新服务状态...');
  // 这里应该调用API获取最新的服务状态
  setTimeout(() => {
    ElMessage.success('服务状态已更新');
  }, 1000);
};

// 切换单个服务的启停状态
const toggleService = (service) => {
  const action = service.running ? '停止' : '启动';
  
  ElMessageBox.confirm(
    `确定要${action}服务 ${service.name} 吗？`,
    `${action}确认`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API来启动/停止服务
    service.running = !service.running;
    ElMessage.success(`服务 ${service.name} 已${action}`);
  }).catch(() => {
    // 取消操作
  });
};

// 重启服务
const restartService = (service) => {
  if (!service.running) {
    ElMessage.warning(`服务 ${service.name} 未运行，无法重启`);
    return;
  }
  
  ElMessageBox.confirm(
    `确定要重启服务 ${service.name} 吗？`,
    '重启确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API来重启服务
    ElMessage.success(`服务 ${service.name} 已重启`);
  }).catch(() => {
    // 取消操作
  });
};

// 配置服务
const configureService = (service) => {
  ElMessage.info(`打开 ${service.name} 的配置页面`);
  // 这里应该打开服务配置对话框或导航到配置页面
};

// 启动所有服务
const startAllServices = () => {
  ElMessageBox.confirm(
    '确定要启动所有服务吗？',
    '启动所有服务',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用API来启动所有服务
    services.value.forEach(service => {
      service.running = true;
    });
    ElMessage.success('所有服务已启动');
  }).catch(() => {
    // 取消操作
  });
};

// 停止所有服务
const stopAllServices = () => {
  ElMessageBox.confirm(
    '确定要停止所有服务吗？这可能会中断当前所有的运行中服务。',
    '停止所有服务',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(() => {
    // 这里应该调用API来停止所有服务
    services.value.forEach(service => {
      service.running = false;
    });
    ElMessage.success('所有服务已停止');
  }).catch(() => {
    // 取消操作
  });
};
</script>

<style scoped>
.services-container {
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

.page-tools {
  display: flex;
  gap: 10px;
}

.services-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 