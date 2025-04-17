<template>
  <div class="dashboard-container">
    <h1 class="page-title">控制面板</h1>
    
    <!-- 系统状态卡片 -->
    <el-row :gutter="20" class="status-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="status-card system-status">
          <div class="card-header">
            <el-icon><Monitor /></el-icon>
            <span>系统状态</span>
          </div>
          <div class="card-content">
            <div class="status-value">{{ systemStatus }}</div>
            <div class="status-info">
              <div>操作系统: {{ osInfo.platform }} {{ osInfo.release }}</div>
              <div>运行时间: {{ uptime }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="status-card running-services">
          <div class="card-header">
            <el-icon><SetUp /></el-icon>
            <span>运行中服务</span>
          </div>
          <div class="card-content">
            <div class="status-value">{{ runningServicesCount }}/{{ totalServices }}</div>
            <div class="status-info">
              <el-progress :percentage="servicesPercentage" :status="servicesStatus" />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="status-card cpu-usage">
          <div class="card-header">
            <el-icon><Cpu /></el-icon>
            <span>CPU使用率</span>
          </div>
          <div class="card-content">
            <div class="status-value">{{ cpuUsage }}%</div>
            <div class="status-info">
              <el-progress :percentage="cpuUsage" :status="getCpuStatus(cpuUsage)" />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="status-card memory-usage">
          <div class="card-header">
            <el-icon><Histogram /></el-icon>
            <span>内存使用率</span>
          </div>
          <div class="card-content">
            <div class="status-value">{{ memoryUsage }}%</div>
            <div class="status-info">
              <el-progress :percentage="memoryUsage" :status="getMemoryStatus(memoryUsage)" />
              <div>{{ usedMemory }}GB / {{ totalMemory }}GB</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 服务状态和系统图表 -->
    <el-row :gutter="20" class="charts-container">
      <el-col :xs="24" :lg="14">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>服务状态</span>
              <el-button type="primary" size="small" @click="refreshServices">
                <el-icon><Refresh /></el-icon>刷新
              </el-button>
            </div>
          </template>
          <div class="services-table-container">
            <el-table :data="servicesList" stripe style="width: 100%">
              <el-table-column prop="name" label="服务" width="180" />
              <el-table-column prop="version" label="版本" width="120" />
              <el-table-column prop="port" label="端口" width="100" />
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.running ? 'success' : 'danger'">
                    {{ scope.row.running ? '运行中' : '已停止' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" fixed="right">
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
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>系统资源监控</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button label="hour">1小时</el-radio-button>
                <el-radio-button label="day">24小时</el-radio-button>
                <el-radio-button label="week">7天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="resource-charts">
            <div class="chart-container">
              <Line 
                :data="cpuChartData" 
                :options="cpuChartOptions"
              />
            </div>
            <div class="chart-container">
              <Line 
                :data="memoryChartData" 
                :options="memoryChartOptions"
              />
            </div>
            <div class="chart-container" v-if="isWindowsPlatform">
              <div class="disk-usage-container">
                <h4>磁盘使用情况</h4>
                <div v-for="(disk, index) in diskUsage" :key="index" class="disk-item">
                  <div class="disk-label">{{ disk.drive }}</div>
                  <div class="disk-progress">
                    <el-progress 
                      :percentage="disk.usagePercentage" 
                      :status="getDiskStatus(disk.usagePercentage)"
                    />
                  </div>
                  <div class="disk-info">
                    {{ disk.used }}GB / {{ disk.total }}GB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作和最近活动 -->
    <el-row :gutter="20" class="action-logs-container">
      <el-col :xs="24" :lg="12" style="margin-bottom: 20px;">
        <el-card class="quick-actions-card">
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card shadow="hover" class="action-card" @click="openWebsiteManager">
                  <el-icon class="action-icon"><Document /></el-icon>
                  <div class="action-name">创建网站</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover" class="action-card" @click="openDatabaseManager">
                  <el-icon class="action-icon"><DataLine /></el-icon>
                  <div class="action-name">创建数据库</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover" class="action-card" @click="openPHPManager">
                  <el-icon class="action-icon"><Connection /></el-icon>
                  <div class="action-name">PHP设置</div>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="8">
                <el-card shadow="hover" class="action-card" @click="openPhpMyAdmin">
                  <el-icon class="action-icon"><Management /></el-icon>
                  <div class="action-name">phpMyAdmin</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card shadow="hover" class="action-card" @click="backupAll">
                  <el-icon class="action-icon"><Download /></el-icon>
                  <div class="action-name">备份全部</div>
                </el-card>
              </el-col>
              <el-col :span="8" v-if="isWindowsPlatform">
                <el-card shadow="hover" class="action-card" @click="openSoftwareManager">
                  <el-icon class="action-icon"><Box /></el-icon>
                  <div class="action-name">软件管理</div>
                </el-card>
              </el-col>
              <el-col :span="8" v-else>
                <el-card shadow="hover" class="action-card" @click="openSettings">
                  <el-icon class="action-icon"><Setting /></el-icon>
                  <div class="action-name">系统设置</div>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;" v-if="isWindowsPlatform">
              <el-col :span="8">
                <el-card shadow="hover" class="action-card" @click="openSettings">
                  <el-icon class="action-icon"><Setting /></el-icon>
                  <div class="action-name">系统设置</div>
                </el-card>
              </el-col>
              <el-col :span="16">
                <!-- 预留位置，可以添加其他Windows专用功能 -->
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="recent-logs-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
              <el-button type="primary" link @click="clearLogs">清除</el-button>
            </div>
          </template>
          <div class="logs-list">
            <div v-for="(log, index) in recentLogs" :key="index" class="log-item">
              <div class="log-time">{{ formatTime(log.time) }}</div>
              <div class="log-content">
                <el-tag size="small" :type="getLogTypeClass(log.type)">
                  {{ log.type }}
                </el-tag>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
            <div v-if="recentLogs.length === 0" class="empty-logs">
              暂无活动记录
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { 
  Monitor, SetUp, Cpu, Histogram, Refresh, Document, 
  DataLine, Connection, Management, Download, Setting, Box 
} from '@element-plus/icons-vue';

// 注册ChartJS组件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const router = useRouter();

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

// 系统状态数据
const systemStatus = ref('正常');
const uptime = ref('0天0小时0分钟');
const osInfo = ref({
  platform: 'Windows',
  release: '10'
});

// 初始化服务数据
const servicesList = ref([]);
const runningServicesCount = computed(() => servicesList.value.filter(service => service.running).length);
const totalServices = computed(() => servicesList.value.length);
const servicesPercentage = computed(() => {
  return totalServices.value === 0 ? 0 : Math.round((runningServicesCount.value / totalServices.value) * 100);
});
const servicesStatus = computed(() => {
  return servicesPercentage.value < 50 ? 'exception' : (servicesPercentage.value < 80 ? 'warning' : 'success');
});

// 系统资源使用数据
const cpuUsage = ref(0);
const memoryUsage = ref(0);
const totalMemory = ref(0);
const usedMemory = ref(0);
const chartTimeRange = ref('hour');

// Windows平台磁盘使用情况
const diskUsage = ref([
  { 
    drive: 'C:',
    total: 256,
    used: 180,
    usagePercentage: 70
  },
  { 
    drive: 'D:',
    total: 512,
    used: 320,
    usagePercentage: 62
  },
  { 
    drive: 'E:',
    total: 1024,
    used: 400,
    usagePercentage: 39
  }
]);

// CPU状态
const getCpuStatus = (usage) => {
  if (usage > 90) return 'exception';
  if (usage > 70) return 'warning';
  return 'success';
};

// 内存状态
const getMemoryStatus = (usage) => {
  if (usage > 90) return 'exception';
  if (usage > 80) return 'warning';
  return 'success';
};

// 磁盘状态
const getDiskStatus = (usage) => {
  if (usage > 90) return 'exception';
  if (usage > 75) return 'warning';
  return 'success';
};

// 图表数据
const cpuChartData = ref({
  labels: [],
  datasets: [
    {
      label: 'CPU使用率 (%)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      data: []
    }
  ]
});

const cpuChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: '使用率 (%)'
      }
    }
  },
  plugins: {
    legend: {
      display: true
    }
  }
};

const memoryChartData = ref({
  labels: [],
  datasets: [
    {
      label: '内存使用率 (%)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      data: []
    }
  ]
});

const memoryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: '使用率 (%)'
      }
    }
  },
  plugins: {
    legend: {
      display: true
    }
  }
};

// 最近活动日志
const recentLogs = ref([
  {
    time: new Date(Date.now() - 5 * 60000),
    type: '信息',
    message: '系统启动完成'
  },
  {
    time: new Date(Date.now() - 3 * 60000),
    type: '成功',
    message: 'MySQL服务已启动'
  },
  {
    time: new Date(Date.now() - 2 * 60000),
    type: '成功',
    message: 'Nginx服务已启动'
  },
  {
    time: new Date(Date.now() - 1 * 60000),
    type: '成功',
    message: 'PHP 7.4服务已启动'
  },
  {
    time: new Date(),
    type: '警告',
    message: 'Apache服务启动失败，端口80已被占用'
  }
]);

// 日志类型对应的样式类
const getLogTypeClass = (type) => {
  const typeMap = {
    '信息': 'info',
    '成功': 'success',
    '警告': 'warning',
    '错误': 'danger'
  };
  return typeMap[type] || 'info';
};

// 格式化时间
const formatTime = (date) => {
  const now = new Date();
  const diff = now - date;
  
  // 如果不到1分钟，显示"刚刚"
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 如果不到1小时，显示"x分钟前"
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }
  
  // 如果不到24小时，显示"x小时前"
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }
  
  // 否则显示具体日期时间
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 切换服务状态
const toggleService = async (service) => {
  try {
    if (service.running) {
      // 停止服务
      if (window?.phpEnvManager?.service?.stopService) {
        const result = await window.phpEnvManager.service.stopService(service.id);
        if (result.success) {
          service.running = false;
          ElMessage.success(`${service.name}已停止`);
          addLog('成功', `${service.name}已停止`);
        } else {
          ElMessage.error(result.message || `停止${service.name}失败`);
          addLog('错误', `停止${service.name}失败`);
        }
      } else {
        // 浏览器环境下模拟操作
        service.running = false;
        ElMessage.success(`${service.name}已停止`);
        addLog('成功', `${service.name}已停止（模拟操作）`);
      }
    } else {
      // 启动服务
      if (window?.phpEnvManager?.service?.startService) {
        const result = await window.phpEnvManager.service.startService(service.id);
        if (result.success) {
          service.running = true;
          ElMessage.success(`${service.name}已启动`);
          addLog('成功', `${service.name}已启动`);
        } else {
          ElMessage.error(result.message || `启动${service.name}失败`);
          addLog('错误', `启动${service.name}失败`);
        }
      } else {
        // 浏览器环境下模拟操作
        service.running = true;
        ElMessage.success(`${service.name}已启动`);
        addLog('成功', `${service.name}已启动（模拟操作）`);
      }
    }
  } catch (error) {
    ElMessage.error(`操作失败: ${error.message}`);
    addLog('错误', `操作${service.name}失败: ${error.message}`);
  }
};

// 重启服务
const restartService = async (service) => {
  try {
    if (window?.phpEnvManager?.service?.restartService) {
      const result = await window.phpEnvManager.service.restartService(service.id);
      if (result.success) {
        ElMessage.success(`${service.name}已重启`);
        addLog('成功', `${service.name}已重启`);
      } else {
        ElMessage.error(result.message || `重启${service.name}失败`);
        addLog('错误', `重启${service.name}失败`);
      }
    } else {
      // 浏览器环境下模拟操作
      ElMessage.success(`${service.name}已重启`);
      addLog('成功', `${service.name}已重启（模拟操作）`);
    }
  } catch (error) {
    ElMessage.error(`操作失败: ${error.message}`);
    addLog('错误', `重启${service.name}失败: ${error.message}`);
  }
};

// 添加日志
const addLog = (type, message) => {
  recentLogs.value.unshift({
    time: new Date(),
    type,
    message
  });
  
  // 限制日志数量，最多显示20条
  if (recentLogs.value.length > 20) {
    recentLogs.value = recentLogs.value.slice(0, 20);
  }
};

// 清除日志
const clearLogs = () => {
  ElMessageBox.confirm('确定要清除所有日志记录吗？', '确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    recentLogs.value = [];
    ElMessage.success('日志已清除');
  }).catch(() => {});
};

// 快速操作函数
const openWebsiteManager = () => {
  router.push('/websites');
  addLog('信息', '打开网站管理页面');
};

const openDatabaseManager = () => {
  router.push('/databases');
  addLog('信息', '打开数据库管理页面');
};

const openPHPManager = () => {
  router.push('/php');
  addLog('信息', '打开PHP管理页面');
};

const openPhpMyAdmin = () => {
  // 打开phpMyAdmin页面
  window.open('http://localhost/phpmyadmin', '_blank');
  addLog('信息', '打开phpMyAdmin');
};

const backupAll = () => {
  ElMessage.info('开始备份所有数据...');
  addLog('信息', '开始全量备份');
  
  // 模拟备份过程
  setTimeout(() => {
    ElMessage.success('备份完成');
    addLog('成功', '全量备份完成');
  }, 3000);
};

const openSettings = () => {
  router.push('/settings');
  addLog('信息', '打开系统设置页面');
};

// 刷新服务列表
const refreshServices = async () => {
  try {
    ElMessage.info('正在刷新服务状态...');
    
    // 检查window.phpEnvManager和service属性是否都存在
    if (window?.phpEnvManager?.service?.getServiceStatus) {
      // 获取服务状态
      const servicesData = await window.phpEnvManager.service.getServiceStatus();
      
      // 转换为数组格式
      const servicesArray = Object.entries(servicesData).map(([id, data]) => ({
        id,
        name: getServiceDisplayName(id),
        running: data.running,
        port: data.port,
        version: getServiceVersion(id)
      }));
      
      servicesList.value = servicesArray;
    } else {
      // 在浏览器环境中使用模拟数据
      const mockServices = {
        nginx: { id: 'nginx', running: true, port: 80 },
        apache: { id: 'apache', running: false, port: 8080 },
        mysql: { id: 'mysql', running: true, port: 3306 },
        mariadb: { id: 'mariadb', running: false, port: 3307 },
        php7: { id: 'php7', running: true, port: 9000 },
        php8: { id: 'php8', running: false, port: 9001 },
        redis: { id: 'redis', running: true, port: 6379 },
        memcached: { id: 'memcached', running: false, port: 11211 }
      };
      
      // 转换为数组格式
      const servicesArray = Object.entries(mockServices).map(([id, data]) => ({
        id,
        name: getServiceDisplayName(id),
        running: data.running,
        port: data.port,
        version: getServiceVersion(id)
      }));
      
      servicesList.value = servicesArray;
    }
    
    ElMessage.success('服务状态已更新');
    addLog('信息', '服务状态已刷新');
  } catch (error) {
    ElMessage.error(`获取服务状态失败: ${error.message}`);
    addLog('错误', `刷新服务状态失败: ${error.message}`);
  }
};

// 获取服务显示名称
const getServiceDisplayName = (serviceId) => {
  const displayNames = {
    nginx: 'Nginx服务器',
    apache: 'Apache服务器',
    mysql: 'MySQL数据库',
    mariadb: 'MariaDB数据库',
    php7: 'PHP 7.4',
    php8: 'PHP 8.1',
    redis: 'Redis缓存',
    memcached: 'Memcached缓存'
  };
  return displayNames[serviceId] || serviceId;
};

// 获取服务版本
const getServiceVersion = (serviceId) => {
  const versions = {
    nginx: '1.20.2',
    apache: '2.4.54',
    mysql: '8.0.30',
    mariadb: '10.6.8',
    php7: '7.4.30',
    php8: '8.1.10',
    redis: '6.2.6',
    memcached: '1.6.12'
  };
  return versions[serviceId] || '';
};

// 更新系统状态
const updateSystemStatus = () => {
  // 在实际应用中，这里应该调用API获取真实的系统资源使用情况
  // 这里使用模拟数据
  
  // 随机生成CPU使用率(30-70%)
  cpuUsage.value = Math.floor(Math.random() * 40) + 30;
  
  // 内存信息
  totalMemory.value = 16; // 16GB
  usedMemory.value = (Math.random() * 8 + 4).toFixed(1); // 4-12GB
  memoryUsage.value = Math.floor((usedMemory.value / totalMemory.value) * 100);
  
  // 更新Windows平台磁盘信息（模拟）
  if (isWindowsPlatform.value) {
    diskUsage.value.forEach(disk => {
      // 轻微随机变化磁盘使用率，模拟真实情况
      const variation = Math.random() * 4 - 2; // -2 到 +2 的随机变化
      disk.usagePercentage = Math.min(Math.max(disk.usagePercentage + variation, 0), 100);
      disk.used = (disk.total * disk.usagePercentage / 100).toFixed(1);
    });
  }
  
  // 更新图表数据
  updateCharts();
  
  // 更新运行时间
  updateUptime();
  
  // 获取操作系统信息
  if (window?.electron?.osInfo) {
    osInfo.value = {
      platform: window.electron.osInfo.platform === 'win32' ? 'Windows' : window.electron.osInfo.platform,
      release: window.electron.osInfo.release
    };
  }
};

// 更新图表数据
const updateCharts = () => {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // 添加新的数据点
  cpuChartData.value.labels.push(timeStr);
  cpuChartData.value.datasets[0].data.push(cpuUsage.value);
  
  memoryChartData.value.labels.push(timeStr);
  memoryChartData.value.datasets[0].data.push(memoryUsage.value);
  
  // 保持最多12个数据点，防止图表过度拥挤
  if (cpuChartData.value.labels.length > 12) {
    cpuChartData.value.labels.shift();
    cpuChartData.value.datasets[0].data.shift();
    
    memoryChartData.value.labels.shift();
    memoryChartData.value.datasets[0].data.shift();
  }
  
  // 强制更新图表
  cpuChartData.value = { ...cpuChartData.value };
  memoryChartData.value = { ...memoryChartData.value };
};

// 更新运行时间
const updateUptime = () => {
  // 模拟运行时间，实际应该从系统获取
  const startTime = new Date('2023-04-01T00:00:00');
  const now = new Date();
  const diff = Math.floor((now - startTime) / 1000); // 秒数差
  
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  
  uptime.value = `${days}天${hours}小时${minutes}分钟`;
};

// 定时器，用于定期更新系统状态
let statusTimer = null;

// 组件挂载时初始化数据
onMounted(async () => {
  // 获取服务状态
  await refreshServices();
  
  // 初始化系统状态
  updateSystemStatus();
  
  // 设置定时更新系统状态(每10秒)
  statusTimer = setInterval(updateSystemStatus, 10000);
  
  // 监听服务状态更新事件 (仅在Electron环境)
  let unsubscribe = null;
  if (window?.phpEnvManager?.events?.onServiceStatusUpdate) {
    unsubscribe = window.phpEnvManager.events.onServiceStatusUpdate(data => {
      // 更新对应的服务状态
      const service = servicesList.value.find(s => s.id === data.id);
      if (service) {
        service.running = data.running;
        addLog(data.running ? '成功' : '信息', `${service.name}已${data.running ? '启动' : '停止'}`);
      }
    });
  }
  
  // 返回取消订阅函数
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
});

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (statusTimer) {
    clearInterval(statusTimer);
  }
});

// 打开软件管理页面
const openSoftwareManager = () => {
  router.push('/software');
  addLog('信息', '打开软件管理页面');
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 500;
}

/* 状态卡片样式 */
.status-cards {
  margin-bottom: 20px;
}

.status-card {
  height: 100%;
  transition: all 0.3s;
}

.status-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header .el-icon {
  margin-right: 8px;
}

.card-content {
  padding: 10px 0;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.status-info {
  color: #606266;
  font-size: 14px;
}

/* 图表容器样式 */
.charts-container {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.resource-charts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-container {
  height: 180px;
  position: relative;
}

/* 磁盘使用情况样式 */
.disk-usage-container {
  height: 100%;
  overflow-y: auto;
}

.disk-usage-container h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
}

.disk-item {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.disk-label {
  width: 40px;
  font-weight: bold;
}

.disk-progress {
  flex: 1;
  margin: 0 10px;
}

.disk-info {
  width: 110px;
  text-align: right;
  color: #606266;
  font-size: 12px;
}

/* 服务表格容器 */
.services-table-container {
  max-height: 400px;
  overflow-y: auto;
}

/* 快速操作样式 */
.action-logs-container {
  margin-bottom: 20px;
}

.quick-actions-card,
.recent-logs-card {
  height: 100%;
  min-height: 350px;
}

.action-card {
  cursor: pointer;
  text-align: center;
  padding: 15px 10px;
  transition: all 0.3s;
}

.action-card:hover {
  background-color: #ecf5ff;
  color: #409EFF;
}

.action-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.action-name {
  font-size: 14px;
}

/* 日志列表样式 */
.logs-list {
  max-height: 280px;
  overflow-y: auto;
}

.log-item {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: flex-start;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  width: 100px;
  color: #909399;
  font-size: 12px;
  padding-top: 2px;
}

.log-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
}

.log-message {
  margin-left: 10px;
  line-height: 1.4;
}

.empty-logs {
  padding: 20px 0;
  text-align: center;
  color: #909399;
}
</style> 