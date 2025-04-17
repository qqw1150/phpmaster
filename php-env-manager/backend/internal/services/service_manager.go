package services

import (
	"errors"
	"fmt"
	"log"
	"os"
	"runtime"
	"sync"

	"github.com/qqw1150/phpmaster/internal/config"
)

// 定义错误
var (
	ErrServiceNotFound       = errors.New("服务未找到")
	ErrServiceAlreadyRunning = errors.New("服务已经在运行中")
	ErrServiceNotRunning     = errors.New("服务未运行")
	ErrDependencyFailed      = errors.New("依赖服务启动失败")
)

// ServiceManager 管理所有服务
type ServiceManager struct {
	config      *config.Config
	services    map[string]Service
	serviceLock sync.RWMutex
	// 平台特定的服务管理器
	platformManager PlatformServiceManager
}

// Service 表示可管理的服务
type Service interface {
	// 获取服务ID
	ID() string
	// 获取服务名称
	Name() string
	// 获取服务类型
	Type() string
	// 启动服务
	Start() error
	// 停止服务
	Stop() error
	// 重启服务
	Restart() error
	// 检查服务状态
	Status() (ServiceStatus, error)
	// 获取服务配置
	GetConfig() (map[string]interface{}, error)
	// 更新服务配置
	UpdateConfig(config map[string]interface{}) error
}

// ServiceStatus 表示服务状态
type ServiceStatus struct {
	Running     bool    `json:"running"`     // 是否运行中
	Pid         int     `json:"pid"`         // 进程ID
	Uptime      int64   `json:"uptime"`      // 运行时间(秒)
	MemoryUsage int64   `json:"memoryUsage"` // 内存使用(KB)
	CPUUsage    float64 `json:"cpuUsage"`    // CPU使用率(%)
	Port        int     `json:"port"`        // 监听端口
	Error       string  `json:"error"`       // 错误信息(如有)
}

// PlatformServiceManager 定义平台特定的服务管理接口
type PlatformServiceManager interface {
	// 启动服务
	StartService(name string, binPath string, args []string, env []string) error
	// 停止服务
	StopService(name string) error
	// 获取服务状态
	GetServiceStatus(name string) (ServiceStatus, error)
	// 检查端口是否被占用
	IsPortInUse(port int) bool
	// 安装服务组件
	InstallServiceComponent(name string, version string) error
	// 卸载服务组件
	UninstallServiceComponent(name string, version string) error
}

// NewServiceManager 创建服务管理器
func NewServiceManager(cfg *config.Config) (*ServiceManager, error) {
	sm := &ServiceManager{
		config:   cfg,
		services: make(map[string]Service),
	}

	// 根据平台初始化平台特定的服务管理器
	var err error
	switch runtime.GOOS {
	case "windows":
		sm.platformManager, err = NewWindowsServiceManager(cfg)
	default: // linux and others
		sm.platformManager, err = NewLinuxServiceManager(cfg)
	}

	if err != nil {
		return nil, fmt.Errorf("初始化平台服务管理器失败: %w", err)
	}

	// 初始化服务
	if err := sm.initServices(); err != nil {
		return nil, fmt.Errorf("初始化服务失败: %w", err)
	}

	return sm, nil
}

// initServices 初始化所有服务
func (sm *ServiceManager) initServices() error {
	// 创建必要的目录
	dirs := []string{
		sm.config.DataDir,
		sm.config.LogDir,
		sm.config.BinariesDir,
	}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("创建目录失败 %s: %w", dir, err)
		}
	}

	// 初始化Web服务器
	if sm.config.Services.Nginx.Enabled {
		nginx, err := NewNginxService(sm.config, sm.platformManager)
		if err != nil {
			log.Printf("初始化Nginx服务失败: %v", err)
		} else {
			sm.RegisterService(nginx)
		}
	}

	if sm.config.Services.Apache.Enabled {
		apache, err := NewApacheService(sm.config, sm.platformManager)
		if err != nil {
			log.Printf("初始化Apache服务失败: %v", err)
		} else {
			sm.RegisterService(apache)
		}
	}

	// 初始化数据库服务
	if sm.config.Services.MySQL.Enabled {
		mysql, err := NewMySQLService(sm.config, sm.platformManager)
		if err != nil {
			log.Printf("初始化MySQL服务失败: %v", err)
		} else {
			sm.RegisterService(mysql)
		}
	}

	if sm.config.Services.MariaDB.Enabled {
		mariadb, err := NewMariaDBService(sm.config, sm.platformManager)
		if err != nil {
			log.Printf("初始化MariaDB服务失败: %v", err)
		} else {
			sm.RegisterService(mariadb)
		}
	}

	// 初始化PHP服务
	for version, phpInfo := range sm.config.Services.PHP {
		if phpInfo.Enabled {
			php, err := NewPHPService(version, sm.config, sm.platformManager)
			if err != nil {
				log.Printf("初始化PHP %s服务失败: %v", version, err)
			} else {
				sm.RegisterService(php)
			}
		}
	}

	// 初始化其他服务
	if sm.config.Services.PhpMyAdmin.Enabled {
		phpMyAdmin, err := NewPhpMyAdminService(sm.config, sm.platformManager)
		if err != nil {
			log.Printf("初始化PhpMyAdmin服务失败: %v", err)
		} else {
			sm.RegisterService(phpMyAdmin)
		}
	}

	// 启动自动启动的服务
	go sm.startAutoStartServices()

	return nil
}

// RegisterService 注册服务
func (sm *ServiceManager) RegisterService(service Service) {
	sm.serviceLock.Lock()
	defer sm.serviceLock.Unlock()
	sm.services[service.ID()] = service
	log.Printf("服务已注册: %s (%s)", service.Name(), service.ID())
}

// GetService 获取服务
func (sm *ServiceManager) GetService(id string) (Service, error) {
	sm.serviceLock.RLock()
	defer sm.serviceLock.RUnlock()

	service, exists := sm.services[id]
	if !exists {
		return nil, ErrServiceNotFound
	}
	return service, nil
}

// GetAllServices 获取所有服务
func (sm *ServiceManager) GetAllServices() []Service {
	sm.serviceLock.RLock()
	defer sm.serviceLock.RUnlock()

	services := make([]Service, 0, len(sm.services))
	for _, service := range sm.services {
		services = append(services, service)
	}
	return services
}

// StartService 启动服务
func (sm *ServiceManager) StartService(id string) error {
	service, err := sm.GetService(id)
	if err != nil {
		return err
	}

	// 检查依赖
	if err := sm.startDependencies(service); err != nil {
		return fmt.Errorf("启动依赖服务失败: %w", err)
	}

	// 启动服务
	if err := service.Start(); err != nil {
		return fmt.Errorf("启动服务失败: %w", err)
	}

	log.Printf("服务已启动: %s", service.Name())
	return nil
}

// StopService 停止服务
func (sm *ServiceManager) StopService(id string) error {
	service, err := sm.GetService(id)
	if err != nil {
		return err
	}

	// 检查依赖服务
	dependentServices := sm.findDependentServices(id)
	if len(dependentServices) > 0 {
		// 先停止依赖于此服务的服务
		for _, depService := range dependentServices {
			if err := depService.Stop(); err != nil {
				log.Printf("停止依赖服务失败 %s: %v", depService.Name(), err)
			}
		}
	}

	// 停止服务
	if err := service.Stop(); err != nil {
		return fmt.Errorf("停止服务失败: %w", err)
	}

	log.Printf("服务已停止: %s", service.Name())
	return nil
}

// RestartService 重启服务
func (sm *ServiceManager) RestartService(id string) error {
	service, err := sm.GetService(id)
	if err != nil {
		return err
	}

	if err := service.Restart(); err != nil {
		return fmt.Errorf("重启服务失败: %w", err)
	}

	log.Printf("服务已重启: %s", service.Name())
	return nil
}

// GetServiceStatus 获取服务状态
func (sm *ServiceManager) GetServiceStatus(id string) (ServiceStatus, error) {
	service, err := sm.GetService(id)
	if err != nil {
		return ServiceStatus{}, err
	}

	return service.Status()
}

// StopAll 停止所有服务
func (sm *ServiceManager) StopAll() {
	services := sm.GetAllServices()

	// 创建等待组
	var wg sync.WaitGroup
	wg.Add(len(services))

	// 并行停止所有服务
	for _, service := range services {
		go func(s Service) {
			defer wg.Done()
			if err := s.Stop(); err != nil {
				log.Printf("停止服务失败 %s: %v", s.Name(), err)
			} else {
				log.Printf("服务已停止: %s", s.Name())
			}
		}(service)
	}

	// 等待所有服务停止
	wg.Wait()
	log.Println("所有服务已停止")
}

// startDependencies 启动依赖服务
func (sm *ServiceManager) startDependencies(service Service) error {
	// 获取服务ID
	id := service.ID()

	// 获取依赖列表
	var dependencies []string

	// 根据服务类型获取依赖
	if id == "nginx" || id == "apache" {
		// Web服务器不依赖其他服务
	} else if id == "mysql" || id == "mariadb" {
		// 数据库服务不依赖其他服务
	} else if id == "phpmyadmin" {
		// PhpMyAdmin依赖PHP和数据库
		dependencies = append(dependencies, "php")
		if sm.config.Services.MySQL.Enabled {
			dependencies = append(dependencies, "mysql")
		} else if sm.config.Services.MariaDB.Enabled {
			dependencies = append(dependencies, "mariadb")
		}
	} else if id == "redis" || id == "memcached" {
		// 缓存服务不依赖其他服务
	} else if id == "ftp" {
		// FTP服务不依赖其他服务
	} else if len(id) >= 3 && id[:3] == "php" {
		// PHP服务不依赖其他服务
	}

	// 启动所有依赖
	for _, depID := range dependencies {
		depService, err := sm.GetService(depID)
		if err != nil {
			log.Printf("依赖服务未找到 %s", depID)
			continue
		}

		status, err := depService.Status()
		if err != nil {
			return fmt.Errorf("获取依赖服务状态失败 %s: %w", depID, err)
		}

		if !status.Running {
			if err := depService.Start(); err != nil {
				return fmt.Errorf("启动依赖服务失败 %s: %w", depID, err)
			}
			log.Printf("依赖服务已启动: %s", depService.Name())
		}
	}

	return nil
}

// findDependentServices 找出依赖于某个服务的所有服务
func (sm *ServiceManager) findDependentServices(id string) []Service {
	sm.serviceLock.RLock()
	defer sm.serviceLock.RUnlock()

	var dependentServices []Service

	// 简化版依赖检查，实际实现应该检查config.Services.xxx.Dependencies
	// 这里仅演示基本逻辑
	if id == "php" {
		// 如果是PHP服务，PhpMyAdmin依赖它
		if phpMyAdmin, exists := sm.services["phpmyadmin"]; exists {
			status, _ := phpMyAdmin.Status()
			if status.Running {
				dependentServices = append(dependentServices, phpMyAdmin)
			}
		}
	} else if id == "mysql" || id == "mariadb" {
		// 如果是数据库服务，PhpMyAdmin依赖它
		if phpMyAdmin, exists := sm.services["phpmyadmin"]; exists {
			status, _ := phpMyAdmin.Status()
			if status.Running {
				dependentServices = append(dependentServices, phpMyAdmin)
			}
		}
	}

	return dependentServices
}

// startAutoStartServices 启动设置为自动启动的服务
func (sm *ServiceManager) startAutoStartServices() {
	services := sm.GetAllServices()

	// 首先启动基础服务
	for _, service := range services {
		id := service.ID()
		// 启动数据库和Web服务器
		if id == "mysql" || id == "mariadb" || id == "nginx" || id == "apache" {
			// 检查是否设置为自动启动
			autoStart := false

			switch id {
			case "mysql":
				autoStart = sm.config.Services.MySQL.AutoStart
			case "mariadb":
				autoStart = sm.config.Services.MariaDB.AutoStart
			case "nginx":
				autoStart = sm.config.Services.Nginx.AutoStart
			case "apache":
				autoStart = sm.config.Services.Apache.AutoStart
			}

			if autoStart {
				if err := sm.StartService(id); err != nil {
					log.Printf("自动启动服务失败 %s: %v", service.Name(), err)
				}
			}
		}
	}

	// 然后启动PHP服务
	for _, service := range services {
		id := service.ID()
		if len(id) >= 3 && id[:3] == "php" {
			// 检查是否设置为自动启动
			version := id[3:] // 提取版本号
			if phpInfo, exists := sm.config.Services.PHP[version]; exists && phpInfo.AutoStart {
				if err := sm.StartService(id); err != nil {
					log.Printf("自动启动服务失败 %s: %v", service.Name(), err)
				}
			}
		}
	}

	// 最后启动其他服务
	for _, service := range services {
		id := service.ID()
		if id != "mysql" && id != "mariadb" && id != "nginx" && id != "apache" && (len(id) < 3 || id[:3] != "php") {
			// 检查是否设置为自动启动
			autoStart := false

			switch id {
			case "phpmyadmin":
				autoStart = sm.config.Services.PhpMyAdmin.AutoStart
			case "redis":
				autoStart = sm.config.Services.Redis.AutoStart
			case "memcached":
				autoStart = sm.config.Services.Memcached.AutoStart
			case "ftp":
				autoStart = sm.config.Services.FTP.AutoStart
			}

			if autoStart {
				if err := sm.StartService(id); err != nil {
					log.Printf("自动启动服务失败 %s: %v", service.Name(), err)
				}
			}
		}
	}
}

// IsPortInUse 检查端口是否被占用
func (sm *ServiceManager) IsPortInUse(port int) bool {
	return sm.platformManager.IsPortInUse(port)
}

// InstallComponent 安装组件
func (sm *ServiceManager) InstallComponent(name, version string) error {
	return sm.platformManager.InstallServiceComponent(name, version)
}

// UninstallComponent 卸载组件
func (sm *ServiceManager) UninstallComponent(name, version string) error {
	return sm.platformManager.UninstallServiceComponent(name, version)
}
