// Main process entry file
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

// 保持对window对象的全局引用，避免JavaScript对象被垃圾回收时，窗口自动关闭
let mainWindow;

// 创建浏览器窗口函数
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false, // 不直接集成Node
      contextIsolation: true, // 上下文隔离
      preload: path.join(__dirname, 'preload.js') // 预加载脚本
    }
  });

  // 设置环境变量以便于区分开发和生产环境
  // 通过检查dist目录是否存在来确定
  const isDev = !require('fs').existsSync(path.join(__dirname, 'dist', 'index.html'));
  
  // 加载应用的index.html
  // 本地开发环境使用http://localhost:5173
  // 打包后使用file://协议加载HTML文件
  const startUrl = isDev
    ? 'http://localhost:5173' 
    : url.format({
        pathname: path.join(__dirname, './dist/index.html'),
        protocol: 'file:',
        slashes: true
      });
  
  console.log('当前环境:', isDev ? '开发环境' : '生产环境');
  console.log('加载URL:', startUrl);
  
  mainWindow.loadURL(startUrl);

  // 打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 当window被关闭时，触发下面的事件
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时，调用此方法
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', function () {
  // 在macOS上，除非用户用Cmd + Q确定地退出，否则应用和菜单栏会保持活动状态
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，通常在应用程序中重新创建一个窗口
  if (mainWindow === null) createWindow();
});

// 在这里可以添加主进程的其他代码

// 添加同步IPC处理程序用于获取应用是否打包的信息
ipcMain.on('is-app-packaged', (event) => {
  event.returnValue = app.isPackaged;
});

// 应用准备就绪处理程序
ipcMain.handle('app-ready', async () => {
  console.log('App ready signal received from renderer process');
  return { success: true, message: 'App is ready' };
});

// 获取系统信息
ipcMain.handle('get-system-info', async () => {
  console.log('Getting system info');
  // 返回模拟系统信息
  return {
    os: process.platform === 'win32' ? 'Windows' : process.platform,
    release: require('os').release(),
    uptime: `${Math.floor(require('os').uptime() / 86400)}天${Math.floor((require('os').uptime() % 86400) / 3600)}小时${Math.floor((require('os').uptime() % 3600) / 60)}分钟`,
    cpu: `${require('os').cpus().length} Core`,
    memory: `${Math.round(require('os').totalmem() / (1024 * 1024 * 1024))}GB`
  };
});

// 示例IPC通信
ipcMain.handle('get-service-status', async () => {
  // 此处应与后端通信获取服务状态
  // 这里仅返回模拟数据
  return {
    nginx: { running: true, port: 80 },
    apache: { running: false, port: 8080 },
    mysql: { running: true, port: 3306 },
    mariadb: { running: false, port: 3307 },
    php7: { running: true, port: 9000 },
    php8: { running: false, port: 9001 }
  };
});

// 启动服务
ipcMain.handle('start-service', async (event, serviceName) => {
  console.log(`Starting service: ${serviceName}`);
  // 此处应与后端通信启动服务
  // 模拟返回成功
  return { success: true, message: `${serviceName}启动成功` };
});

// 停止服务
ipcMain.handle('stop-service', async (event, serviceName) => {
  console.log(`Stopping service: ${serviceName}`);
  // 此处应与后端通信停止服务
  // 模拟返回成功
  return { success: true, message: `${serviceName}停止成功` };
});

// 重启服务
ipcMain.handle('restart-service', async (event, serviceName) => {
  console.log(`Restarting service: ${serviceName}`);
  // 此处应与后端通信重启服务
  // 模拟返回成功
  return { success: true, message: `${serviceName}重启成功` };
});
