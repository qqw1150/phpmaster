<template>
  <div class="databases-container">
    <div class="page-header">
      <h1>数据库管理</h1>
      <div class="page-tools">
        <el-button type="primary" @click="dialogDatabaseVisible = true">
          <el-icon><Plus /></el-icon>创建数据库
        </el-button>
        <el-button type="success" @click="dialogUserVisible = true">
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
          
          <el-table :data="filteredDatabases" border stripe style="width: 100%" v-loading="loading.databases">
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
          
          <el-table :data="filteredUsers" border stripe style="width: 100%" v-loading="loading.users">
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
                  @click="openPrivilegesDialog(scope.row)"
                >
                  权限
                </el-button>
                <el-button 
                  size="small" 
                  type="warning" 
                  @click="openResetPasswordDialog(scope.row)"
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

    <!-- 创建数据库对话框 -->
    <el-dialog
      v-model="dialogDatabaseVisible"
      title="创建数据库"
      width="550px"
    >
      <el-form :model="databaseForm" :rules="databaseRules" ref="databaseFormRef" label-width="100px">
        <el-form-item label="数据库名称" prop="name">
          <el-input v-model="databaseForm.name" placeholder="请输入数据库名称" />
        </el-form-item>
        <el-form-item label="字符集" prop="charset">
          <el-select v-model="databaseForm.charset" placeholder="请选择字符集" style="width: 100%">
            <el-option label="utf8" value="utf8" />
            <el-option label="utf8mb4" value="utf8mb4" />
            <el-option label="latin1" value="latin1" />
            <el-option label="ascii" value="ascii" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序规则" prop="collation">
          <el-select v-model="databaseForm.collation" placeholder="请选择排序规则" style="width: 100%">
            <el-option 
              v-for="collation in filteredCollations" 
              :key="collation.value" 
              :label="collation.label" 
              :value="collation.value" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogDatabaseVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDatabaseForm" :loading="loading.createDatabase">
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 创建用户对话框 -->
    <el-dialog
      v-model="dialogUserVisible"
      title="创建用户"
      width="550px"
    >
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="主机" prop="host">
          <el-input v-model="userForm.host" placeholder="请输入主机 (例如: localhost, %, 192.168.1.%)" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="userForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>
        <el-form-item label="初始权限">
          <el-checkbox-group v-model="userForm.privileges">
            <el-checkbox label="SELECT">SELECT</el-checkbox>
            <el-checkbox label="INSERT">INSERT</el-checkbox>
            <el-checkbox label="UPDATE">UPDATE</el-checkbox>
            <el-checkbox label="DELETE">DELETE</el-checkbox>
            <el-checkbox label="CREATE">CREATE</el-checkbox>
            <el-checkbox label="DROP">DROP</el-checkbox>
            <el-checkbox label="ALL PRIVILEGES">ALL PRIVILEGES</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="授权数据库" prop="database">
          <el-select v-model="userForm.database" placeholder="请选择授权数据库" style="width: 100%">
            <el-option label="*" value="*" />
            <el-option 
              v-for="db in databases" 
              :key="db.name" 
              :label="db.name" 
              :value="db.name" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogUserVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUserForm" :loading="loading.createUser">
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑用户权限对话框 -->
    <el-dialog
      v-model="dialogPrivilegesVisible"
      title="编辑用户权限"
      width="600px"
    >
      <div v-if="currentUser">
        <h3>{{ currentUser.username }}@{{ currentUser.host }}</h3>
        <el-divider />
        
        <el-form :model="privilegesForm" ref="privilegesFormRef" label-width="120px">
          <el-form-item label="数据库">
            <el-select v-model="privilegesForm.database" placeholder="选择数据库" style="width: 100%">
              <el-option label="全局权限 (*)" value="*" />
              <el-option 
                v-for="db in databases" 
                :key="db.name" 
                :label="db.name" 
                :value="db.name" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="权限">
            <el-checkbox-group v-model="privilegesForm.privileges">
              <div class="privileges-grid">
                <el-checkbox label="SELECT">SELECT</el-checkbox>
                <el-checkbox label="INSERT">INSERT</el-checkbox>
                <el-checkbox label="UPDATE">UPDATE</el-checkbox>
                <el-checkbox label="DELETE">DELETE</el-checkbox>
                <el-checkbox label="CREATE">CREATE</el-checkbox>
                <el-checkbox label="DROP">DROP</el-checkbox>
                <el-checkbox label="RELOAD">RELOAD</el-checkbox>
                <el-checkbox label="SHUTDOWN">SHUTDOWN</el-checkbox>
                <el-checkbox label="PROCESS">PROCESS</el-checkbox>
                <el-checkbox label="FILE">FILE</el-checkbox>
                <el-checkbox label="REFERENCES">REFERENCES</el-checkbox>
                <el-checkbox label="INDEX">INDEX</el-checkbox>
                <el-checkbox label="ALTER">ALTER</el-checkbox>
                <el-checkbox label="SHOW DATABASES">SHOW DATABASES</el-checkbox>
                <el-checkbox label="SUPER">SUPER</el-checkbox>
                <el-checkbox label="CREATE TEMPORARY TABLES">CREATE TEMPORARY TABLES</el-checkbox>
                <el-checkbox label="LOCK TABLES">LOCK TABLES</el-checkbox>
                <el-checkbox label="EXECUTE">EXECUTE</el-checkbox>
                <el-checkbox label="REPLICATION SLAVE">REPLICATION SLAVE</el-checkbox>
                <el-checkbox label="REPLICATION CLIENT">REPLICATION CLIENT</el-checkbox>
                <el-checkbox label="CREATE VIEW">CREATE VIEW</el-checkbox>
                <el-checkbox label="SHOW VIEW">SHOW VIEW</el-checkbox>
                <el-checkbox label="CREATE ROUTINE">CREATE ROUTINE</el-checkbox>
                <el-checkbox label="ALTER ROUTINE">ALTER ROUTINE</el-checkbox>
                <el-checkbox label="CREATE USER">CREATE USER</el-checkbox>
                <el-checkbox label="EVENT">EVENT</el-checkbox>
                <el-checkbox label="TRIGGER">TRIGGER</el-checkbox>
                <el-checkbox label="CREATE TABLESPACE">CREATE TABLESPACE</el-checkbox>
              </div>
              <div class="privileges-all">
                <el-checkbox label="ALL PRIVILEGES" @change="handleAllPrivilegesChange">ALL PRIVILEGES</el-checkbox>
              </div>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogPrivilegesVisible = false">取消</el-button>
          <el-button type="primary" @click="updateUserPrivileges" :loading="loading.updatePrivileges">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="dialogPasswordVisible"
      title="重置用户密码"
      width="500px"
    >
      <div v-if="currentUser">
        <h3>{{ currentUser.username }}@{{ currentUser.host }}</h3>
        <el-divider />
        
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
          <el-form-item label="新密码" prop="password">
            <el-input v-model="passwordForm.password" type="password" placeholder="请输入新密码" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogPasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="resetPassword" :loading="loading.resetPassword">
            重置
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, User } from '@element-plus/icons-vue';
import axios from 'axios';

// API基础URL
const API_BASE_URL = '/api';

// 当前活动Tab
const activeTab = ref('databases');

// 数据库列表
const databases = ref([]);

// 用户列表
const users = ref([]);

// 加载状态控制
const loading = reactive({
  databases: false,
  users: false,
  createDatabase: false,
  createUser: false,
  updatePrivileges: false,
  resetPassword: false
});

// 对话框可见性控制
const dialogDatabaseVisible = ref(false);
const dialogUserVisible = ref(false);
const dialogPrivilegesVisible = ref(false);
const dialogPasswordVisible = ref(false);

// 表单引用
const databaseFormRef = ref(null);
const userFormRef = ref(null);
const privilegesFormRef = ref(null);
const passwordFormRef = ref(null);

// 当前选中的用户
const currentUser = ref(null);

// 搜索关键词
const dbSearchQuery = ref('');
const userSearchQuery = ref('');

// 数据库字符集与排序规则映射表
const collationMap = {
  utf8: [
    { label: 'utf8_general_ci', value: 'utf8_general_ci' },
    { label: 'utf8_unicode_ci', value: 'utf8_unicode_ci' },
    { label: 'utf8_bin', value: 'utf8_bin' }
  ],
  utf8mb4: [
    { label: 'utf8mb4_general_ci', value: 'utf8mb4_general_ci' },
    { label: 'utf8mb4_unicode_ci', value: 'utf8mb4_unicode_ci' },
    { label: 'utf8mb4_bin', value: 'utf8mb4_bin' },
    { label: 'utf8mb4_0900_ai_ci', value: 'utf8mb4_0900_ai_ci' }
  ],
  latin1: [
    { label: 'latin1_swedish_ci', value: 'latin1_swedish_ci' },
    { label: 'latin1_general_ci', value: 'latin1_general_ci' },
    { label: 'latin1_bin', value: 'latin1_bin' }
  ],
  ascii: [
    { label: 'ascii_general_ci', value: 'ascii_general_ci' },
    { label: 'ascii_bin', value: 'ascii_bin' }
  ]
};

// 表单数据
const databaseForm = reactive({
  name: '',
  charset: 'utf8mb4',
  collation: 'utf8mb4_general_ci'
});

const userForm = reactive({
  username: '',
  host: 'localhost',
  password: '',
  confirmPassword: '',
  privileges: [],
  database: '*'
});

const privilegesForm = reactive({
  database: '*',
  privileges: []
});

const passwordForm = reactive({
  password: '',
  confirmPassword: ''
});

// 表单验证规则
const databaseRules = {
  name: [
    { required: true, message: '请输入数据库名称', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '数据库名称只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  charset: [
    { required: true, message: '请选择字符集', trigger: 'change' }
  ],
  collation: [
    { required: true, message: '请选择排序规则', trigger: 'change' }
  ]
};

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  host: [
    { required: true, message: '请输入主机', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ],
  database: [
    { required: true, message: '请选择授权数据库', trigger: 'change' }
  ]
};

const passwordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

// 根据选择的字符集过滤排序规则选项
const filteredCollations = computed(() => {
  return collationMap[databaseForm.charset] || [];
});

// 自动更新排序规则
watch(() => databaseForm.charset, (newCharset) => {
  if (collationMap[newCharset] && collationMap[newCharset].length > 0) {
    databaseForm.collation = collationMap[newCharset][0].value;
  }
});

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

// 组件挂载时加载数据
onMounted(() => {
  fetchDatabases();
  fetchUsers();
});

// 获取数据库列表
const fetchDatabases = async () => {
  loading.databases = true;
  try {
    // 模拟API调用，实际使用时请替换为真实API
    // const response = await axios.get(`${API_BASE_URL}/databases`);
    // databases.value = response.data;
    
    // 模拟数据
    setTimeout(() => {
      databases.value = [
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
      ];
      loading.databases = false;
    }, 500);
  } catch (error) {
    ElMessage.error('获取数据库列表失败');
    console.error('获取数据库列表错误:', error);
    loading.databases = false;
  }
};

// 获取用户列表
const fetchUsers = async () => {
  loading.users = true;
  try {
    // 模拟API调用，实际使用时请替换为真实API
    // const response = await axios.get(`${API_BASE_URL}/users`);
    // users.value = response.data;
    
    // 模拟数据
    setTimeout(() => {
      users.value = [
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
      ];
      loading.users = false;
    }, 500);
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error('获取用户列表错误:', error);
    loading.users = false;
  }
};

// 添加数据库
const addDatabase = () => {
  dialogDatabaseVisible.value = true;
  // 重置表单
  if (databaseFormRef.value) {
    databaseFormRef.value.resetFields();
  }
};

// 提交创建数据库表单
const submitDatabaseForm = async () => {
  if (!databaseFormRef.value) return;
  
  await databaseFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.createDatabase = true;
      try {
        // 模拟API调用，实际使用时请替换为真实API
        // await axios.post(`${API_BASE_URL}/databases`, databaseForm);
        
        // 模拟成功
        setTimeout(() => {
          // 添加到列表
          const newDb = {
            id: databases.value.length + 1,
            name: databaseForm.name,
            type: 'MySQL',
            charset: databaseForm.charset,
            collation: databaseForm.collation,
            size: '0 KB',
            tables: 0
          };
          databases.value.push(newDb);
          
          ElMessage.success(`数据库 "${databaseForm.name}" 创建成功`);
          dialogDatabaseVisible.value = false;
          loading.createDatabase = false;
        }, 1000);
      } catch (error) {
        ElMessage.error(`创建数据库失败: ${error.response?.data?.message || error.message}`);
        loading.createDatabase = false;
      }
    }
  });
};

// 添加用户
const addUser = () => {
  dialogUserVisible.value = true;
  // 重置表单
  if (userFormRef.value) {
    userFormRef.value.resetFields();
  }
  // 设置默认值
  userForm.host = 'localhost';
  userForm.privileges = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  userForm.database = '*';
};

// 提交创建用户表单
const submitUserForm = async () => {
  if (!userFormRef.value) return;
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.createUser = true;
      try {
        // 模拟API调用，实际使用时请替换为真实API
        // await axios.post(`${API_BASE_URL}/users`, userForm);
        
        // 模拟成功
        setTimeout(() => {
          // 添加到列表
          const newUser = {
            id: users.value.length + 1,
            username: userForm.username,
            host: userForm.host,
            privileges: userForm.privileges
          };
          users.value.push(newUser);
          
          ElMessage.success(`用户 "${userForm.username}"@"${userForm.host}" 创建成功`);
          dialogUserVisible.value = false;
          loading.createUser = false;
        }, 1000);
      } catch (error) {
        ElMessage.error(`创建用户失败: ${error.response?.data?.message || error.message}`);
        loading.createUser = false;
      }
    }
  });
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
  ).then(async () => {
    try {
      // 模拟API调用，实际使用时请替换为真实API
      // await axios.delete(`${API_BASE_URL}/databases/${database.name}`);
      
      // 模拟成功
      setTimeout(() => {
        // 从列表中移除
        databases.value = databases.value.filter(item => item.id !== database.id);
        ElMessage.success(`数据库 "${database.name}" 已成功删除`);
      }, 500);
    } catch (error) {
      ElMessage.error(`删除数据库失败: ${error.response?.data?.message || error.message}`);
    }
  }).catch(() => {
    // 取消操作
  });
};

// 打开phpMyAdmin
const openPhpMyAdmin = (database) => {
  ElMessage.success(`正在打开数据库 "${database.name}" 的phpMyAdmin管理界面`);
  // 打开phpMyAdmin链接
  window.open(`http://localhost/phpmyadmin/index.php?db=${database.name}`, '_blank');
};

// 备份数据库
const backupDatabase = async (database) => {
  ElMessage.info(`正在备份数据库 "${database.name}"...`);
  try {
    // 模拟API调用，实际使用时请替换为真实API
    // await axios.post(`${API_BASE_URL}/databases/${database.name}/backup`);
    
    // 模拟成功
    setTimeout(() => {
      ElMessage.success(`数据库 "${database.name}" 备份成功`);
    }, 1500);
  } catch (error) {
    ElMessage.error(`备份数据库失败: ${error.response?.data?.message || error.message}`);
  }
};

// 打开权限编辑对话框
const openPrivilegesDialog = (user) => {
  currentUser.value = user;
  dialogPrivilegesVisible.value = true;
  
  // 设置当前用户的权限
  privilegesForm.database = '*';
  privilegesForm.privileges = [...user.privileges];
};

// 处理全部权限变更
const handleAllPrivilegesChange = (checked) => {
  if (checked) {
    // 如果选择了ALL PRIVILEGES，清空其他权限
    privilegesForm.privileges = ['ALL PRIVILEGES'];
  } else {
    // 如果取消了ALL PRIVILEGES，添加一些基本权限
    privilegesForm.privileges = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
  }
};

// 更新用户权限
const updateUserPrivileges = async () => {
  if (!currentUser.value) return;
  
  loading.updatePrivileges = true;
  try {
    // 模拟API调用，实际使用时请替换为真实API
    // await axios.put(`${API_BASE_URL}/users/${currentUser.value.id}/privileges`, privilegesForm);
    
    // 模拟成功
    setTimeout(() => {
      // 更新用户权限
      const userIndex = users.value.findIndex(u => u.id === currentUser.value.id);
      if (userIndex !== -1) {
        users.value[userIndex].privileges = [...privilegesForm.privileges];
      }
      
      ElMessage.success(`用户 "${currentUser.value.username}"@"${currentUser.value.host}" 权限更新成功`);
      dialogPrivilegesVisible.value = false;
      loading.updatePrivileges = false;
    }, 1000);
  } catch (error) {
    ElMessage.error(`更新用户权限失败: ${error.response?.data?.message || error.message}`);
    loading.updatePrivileges = false;
  }
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
  ).then(async () => {
    try {
      // 模拟API调用，实际使用时请替换为真实API
      // await axios.delete(`${API_BASE_URL}/users/${user.id}`);
      
      // 模拟成功
      setTimeout(() => {
        // 从列表中移除
        users.value = users.value.filter(item => item.id !== user.id);
        ElMessage.success(`用户 "${user.username}"@"${user.host}" 已成功删除`);
      }, 500);
    } catch (error) {
      ElMessage.error(`删除用户失败: ${error.response?.data?.message || error.message}`);
    }
  }).catch(() => {
    // 取消操作
  });
};

// 打开重置密码对话框
const openResetPasswordDialog = (user) => {
  currentUser.value = user;
  dialogPasswordVisible.value = true;
  
  // 重置表单
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields();
  }
};

// 重置用户密码
const resetPassword = async () => {
  if (!passwordFormRef.value || !currentUser.value) return;
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.resetPassword = true;
      try {
        // 模拟API调用，实际使用时请替换为真实API
        // await axios.put(`${API_BASE_URL}/users/${currentUser.value.id}/password`, { 
        //   password: passwordForm.password 
        // });
        
        // 模拟成功
        setTimeout(() => {
          ElMessage.success(`用户 "${currentUser.value.username}"@"${currentUser.value.host}" 密码重置成功`);
          dialogPasswordVisible.value = false;
          loading.resetPassword = false;
        }, 1000);
      } catch (error) {
        ElMessage.error(`重置密码失败: ${error.response?.data?.message || error.message}`);
        loading.resetPassword = false;
      }
    }
  });
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

.privileges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.privileges-all {
  margin-top: 10px;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 