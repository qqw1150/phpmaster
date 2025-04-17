# PHP环境管理器

PHP环境管理器是一个跨平台的桌面应用程序，用于简化PHP开发环境的搭建和管理。它提供了对Nginx、Apache、MySQL、PHP等服务的统一管理界面，让开发者能够快速搭建、切换和管理不同的PHP开发环境。

## 功能特点

- 服务管理：统一管理Nginx、Apache、MySQL、PHP等服务
- 多版本PHP支持：同时管理多个PHP版本
- 网站管理：快速创建和配置本地开发站点
- 数据库管理：图形化管理MySQL/MariaDB数据库
- 跨平台支持：兼容Windows和Linux系统

## 系统要求

### Windows系统
- Windows 7 SP1 或更高版本（推荐 Windows 10/11）
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间
- 管理员权限

### Linux系统
- Ubuntu 18.04+、CentOS 7+、Debian 10+或其他主流发行版
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间
- sudo/root权限

## 快速开始

### 安装依赖

```bash
# 前端依赖安装
cd php-env-manager/frontend
npm install

# 后端依赖安装（如果需要）
cd ../backend
go mod tidy
```

### 开发模式运行

```bash
# 开发模式启动前端
cd php-env-manager/frontend
npm run dev

# 开发模式启动Electron应用
npm start
```

### 构建应用

```bash
# 构建前端
cd php-env-manager/frontend
npm run build

# 打包Windows应用
npm run package-win

# 打包Linux应用
npm run package-linux
```

## 项目结构

```
php-env-manager/
├── backend/              # Go后端代码
│   ├── cmd/              # 入口命令
│   ├── internal/         # 内部包
│   │   ├── api/          # API定义
│   │   ├── config/       # 配置处理
│   │   ├── models/       # 数据模型
│   │   └── services/     # 核心服务
│   └── pkg/              # 可重用包
├── frontend/             # Electron+Vue前端
│   ├── public/           # 静态资源
│   ├── src/              # 源代码
│   │   ├── assets/       # 资源文件
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── router/       # 路由
│   │   ├── services/     # 服务
│   │   ├── store/        # 状态管理
│   │   └── utils/        # 工具函数
│   ├── main.js           # Electron入口
│   └── preload.js        # 预加载脚本
└── docs/                 # 文档
```

## 贡献指南

欢迎贡献代码、报告问题或提出建议。请参阅[贡献指南](./CONTRIBUTING.md)了解更多信息。

## 许可证

本项目采用MIT许可证。详见[LICENSE](./LICENSE)文件。 