<template>
  <div class="databases-container">
    <div class="page-header">
      <h1>数据库管理</h1>
      <div class="page-tools">
        <el-button type="primary" @click="addDatabase">
          <el-icon><Plus /></el-icon>创建数据库
        </el-button>
        <el-button type="success" @click="addUser">
          <el-icon><User /></el-icon>创建用户
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="数据库" name="databases">
        <el-card class="database-card">
          <template #header>
            <div class="card-header">
              <span>数据库列表</span>
              <el-input 
                v-model="dbSearchQuery" 
                placeholder="搜索数据库..." 
                style="width: 250px;"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          
          <el-table :data="filteredDatabases" border stripe style="width: 100%">
            <el-table-column prop="name" label="数据库名称" min-width="200" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="charset" label="字符集" width="150" />
            <el-table-column prop="collation" label="排序规则" width="150" />
            <el-table-column prop="size" label="大小" width="120" />
            <el-table-column prop="tables" label="表数量" width="120" />
            <el-table-column label="操作" width="320" fixed="right">
              <template #default="scope">
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="openPhpMyAdmin(scope.row)"
                >
                  管理
                </el-button>
                <el-button 
                  size="small" 
                  type="success" 
                  @click="backupDatabase(scope.row)"
                >
                  备份
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteDatabase(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="用户" name="users">
        <el-card class="user-card">
          <template #header>
            <div class="card-header">
              <span>用户列表</span>
              <el-input 
                v-model="userSearchQuery" 
                placeholder="搜索用户..." 
                style="width: 250px;"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          
          <el-table :data="filteredUsers" border stripe style="width: 100%">
            <el-table-column prop="username" label="用户名" min-width="200" />
            <el-table-column prop="host" label="主机" width="150" />
            <el-table-column label="权限" min-width="300">
              <template #default="scope">
                <el-tag 
                  v-for="(privilege, index) in scope.row.privileges" 
                  :key="index"
                  class="privilege-tag"
                >
                  {{ privilege }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="270" fixed="right">
              <template #default="scope">
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="editUserPrivileges(scope.row)"
                >
                  权限
                </el-button>
                <el-button 
                  size="small" 
                  type="warning" 
                  @click="resetUserPassword(scope.row)"
                >
                  重置密码
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteUser(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, User } from '@element-plus/icons-vue';

// 当前活动Tab
const activeTab = ref('databases');

// 数据库列表
const databases = ref([
  {
    id: 1,
    name: 'wordpress',
    type: 'MySQL',
    charset: 'utf8mb4',
    collation: 'utf8mb4_general_ci',
    size: '15.2 MB',
    tables: 12
  },
  {
    id: 2,
    name: 'shop',
    type: 'MySQL',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    size: '45.7 MB',
    tables: 35
  },
  {
    id: 3,
    name: 'blog',
    type: 'MariaDB',
    charset: 'utf8',
    collation: 'utf8_general_ci',
    size: '8.3 MB',
    tables: 8
  }
]);

// 用户列表
const users = ref([
  {
    id: 1,
    username: 'root',
    host: 'localhost',
    privileges: ['ALL PRIVILEGES']
  },
  {
    id: 2,
    username: 'wordpress_user',
    host: 'localhost',
    privileges: ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
  },
  {
    id: 3,
    username: 'backup_user',
    host: '%',
    privileges: ['SELECT', 'LOCK TABLES']
  }
]);

// 搜索关键词
const dbSearchQuery = ref('');
const userSearchQuery = ref('');

// 过滤后的数据库列表
const filteredDatabases = computed(() => {
  if (!dbSearchQuery.value) {
    return databases.value;
  }
  
  const query = dbSearchQuery.value.toLowerCase();
  return databases.value.filter(db => {
    return db.name.toLowerCase().includes(query) || 
           db.type.toLowerCase().includes(query);
  });
});

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) {
    return users.value;
  }
  
  const query = userSearchQuery.value.toLowerCase();
  return users.value.filter(user => {
    return user.username.toLowerCase().includes(query) || 
           user.host.toLowerCase().includes(query);
  });
});

// 添加数据库
const addDatabase = () => {
  ElMessage.info('打开创建数据库对话框');
  // 这里应该打开创建数据库的对话框
};

// 添加用户
const addUser = () => {
  ElMessage.info('打开创建用户对话框');
  // 这里应该打开创建用户的对话框
};

// 删除数据库
const deleteDatabase = (database) => {
  ElMessageBox.confirm(
    `确定要删除数据库 "${database.name}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用删除API
    ElMessage.success(`数据库 "${database.name}" 已成功删除`);
    // 从列表中移除
    databases.value = databases.value.filter(item => item.id !== database.id);
  }).catch(() => {
    // 取消操作
  });
};

// 打开phpMyAdmin
const openPhpMyAdmin = (database) => {
  ElMessage.success(`正在打开数据库 "${database.name}" 的phpMyAdmin管理界面`);
  // 这里应该打开phpMyAdmin链接
  window.open(`http://localhost/phpmyadmin/index.php?db=${database.name}`, '_blank');
};

// 备份数据库
const backupDatabase = (database) => {
  ElMessage.info(`正在备份数据库 "${database.name}"...`);
  // 这里应该调用备份API
  setTimeout(() => {
    ElMessage.success(`数据库 "${database.name}" 备份成功`);
  }, 1500);
};

// 删除用户
const deleteUser = (user) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${user.username}"@"${user.host}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该调用删除API
    ElMessage.success(`用户 "${user.username}"@"${user.host}" 已成功删除`);
    // 从列表中移除
    users.value = users.value.filter(item => item.id !== user.id);
  }).catch(() => {
    // 取消操作
  });
};

// 编辑用户权限
const editUserPrivileges = (user) => {
  ElMessage.info(`编辑用户 "${user.username}"@"${user.host}" 的权限`);
  // 这里应该打开权限编辑对话框
};

// 重置用户密码
const resetUserPassword = (user) => {
  ElMessage.info(`重置用户 "${user.username}"@"${user.host}" 的密码`);
  // 这里应该打开密码重置对话框
};
</script>

<style scoped>
.databases-container {
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

.database-card,
.user-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.privilege-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style> 