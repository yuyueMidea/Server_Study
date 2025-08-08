package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

// User 用户模型
type User struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Age       int       `json:"age"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UserService 用户服务
type UserService struct {
	db *sql.DB
}

// NewUserService 创建用户服务
func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

// 初始化数据库表
func (s *UserService) InitDB() error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT UNIQUE NOT NULL,
		age INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`

	_, err := s.db.Exec(query)
	if err != nil {
		return fmt.Errorf("创建用户表失败: %v", err)
	}

	log.Println("数据库表初始化完成")
	return nil
}

// 创建用户
func (s *UserService) CreateUser(user *User) (*User, error) {
	query := `
	INSERT INTO users (name, email, age, created_at, updated_at) 
	VALUES (?, ?, ?, ?, ?)`

	now := time.Now()
	result, err := s.db.Exec(query, user.Name, user.Email, user.Age, now, now)
	if err != nil {
		return nil, fmt.Errorf("创建用户失败: %v", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("获取用户ID失败: %v", err)
	}

	user.ID = int(id)
	user.CreatedAt = now
	user.UpdatedAt = now

	return user, nil
}

// 根据ID获取用户
func (s *UserService) GetUserByID(id int) (*User, error) {
	query := `
	SELECT id, name, email, age, created_at, updated_at 
	FROM users WHERE id = ?`

	user := &User{}
	err := s.db.QueryRow(query, id).Scan(
		&user.ID, &user.Name, &user.Email, &user.Age,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("用户不存在")
		}
		return nil, fmt.Errorf("查询用户失败: %v", err)
	}

	return user, nil
}

// 获取所有用户
func (s *UserService) GetAllUsers() ([]*User, error) {
	query := `
	SELECT id, name, email, age, created_at, updated_at 
	FROM users ORDER BY created_at DESC`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("查询用户列表失败: %v", err)
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		user := &User{}
		err := rows.Scan(
			&user.ID, &user.Name, &user.Email, &user.Age,
			&user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("扫描用户数据失败: %v", err)
		}
		users = append(users, user)
	}

	return users, nil
}

// 更新用户
func (s *UserService) UpdateUser(id int, user *User) (*User, error) {
	query := `
	UPDATE users SET name = ?, email = ?, age = ?, updated_at = ?
	WHERE id = ?`

	now := time.Now()
	result, err := s.db.Exec(query, user.Name, user.Email, user.Age, now, id)
	if err != nil {
		return nil, fmt.Errorf("更新用户失败: %v", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("检查更新结果失败: %v", err)
	}

	if affected == 0 {
		return nil, fmt.Errorf("用户不存在")
	}

	// 获取更新后的用户信息
	return s.GetUserByID(id)
}

// 删除用户
func (s *UserService) DeleteUser(id int) error {
	query := `DELETE FROM users WHERE id = ?`

	result, err := s.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("删除用户失败: %v", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("检查删除结果失败: %v", err)
	}

	if affected == 0 {
		return fmt.Errorf("用户不存在")
	}

	return nil
}

// Server HTTP服务器
type Server struct {
	userService *UserService
}

// NewServer 创建服务器
func NewServer(userService *UserService) *Server {
	return &Server{userService: userService}
}

// 响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// 发送JSON响应
func (s *Server) sendJSON(w http.ResponseWriter, code int, response Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(response)
}

// 用户路由处理器
func (s *Server) userHandler(w http.ResponseWriter, r *http.Request) {
	// 设置CORS头
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/users")

	switch r.Method {
	case "GET":
		if path == "" || path == "/" {
			// 获取所有用户
			users, err := s.userService.GetAllUsers()
			if err != nil {
				s.sendJSON(w, http.StatusInternalServerError, Response{
					Code:    500,
					Message: err.Error(),
				})
				return
			}
			s.sendJSON(w, http.StatusOK, Response{
				Code:    200,
				Message: "获取用户列表成功",
				Data:    users,
			})
		} else {
			// 获取单个用户
			idStr := strings.TrimPrefix(path, "/")
			id, err := strconv.Atoi(idStr)
			if err != nil {
				s.sendJSON(w, http.StatusBadRequest, Response{
					Code:    400,
					Message: "无效的用户ID",
				})
				return
			}

			user, err := s.userService.GetUserByID(id)
			if err != nil {
				s.sendJSON(w, http.StatusNotFound, Response{
					Code:    404,
					Message: err.Error(),
				})
				return
			}

			s.sendJSON(w, http.StatusOK, Response{
				Code:    200,
				Message: "获取用户成功",
				Data:    user,
			})
		}

	case "POST":
		// 创建用户
		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			s.sendJSON(w, http.StatusBadRequest, Response{
				Code:    400,
				Message: "请求参数格式错误",
			})
			return
		}

		// 基本验证
		if user.Name == "" || user.Email == "" || user.Age <= 0 {
			s.sendJSON(w, http.StatusBadRequest, Response{
				Code:    400,
				Message: "姓名、邮箱不能为空，年龄必须大于0",
			})
			return
		}

		createdUser, err := s.userService.CreateUser(&user)
		if err != nil {
			s.sendJSON(w, http.StatusInternalServerError, Response{
				Code:    500,
				Message: err.Error(),
			})
			return
		}

		s.sendJSON(w, http.StatusCreated, Response{
			Code:    201,
			Message: "创建用户成功",
			Data:    createdUser,
		})

	case "PUT":
		// 更新用户
		idStr := strings.TrimPrefix(path, "/")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			s.sendJSON(w, http.StatusBadRequest, Response{
				Code:    400,
				Message: "无效的用户ID",
			})
			return
		}

		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			s.sendJSON(w, http.StatusBadRequest, Response{
				Code:    400,
				Message: "请求参数格式错误",
			})
			return
		}

		// 基本验证
		if user.Name == "" || user.Email == "" || user.Age <= 0 {
			s.sendJSON(w, http.StatusBadRequest, Response{
				Code:    400,
				Message: "姓名、邮箱不能为空，年龄必须大于0",
			})
			return
		}

		updatedUser, err := s.userService.UpdateUser(id, &user)
		if err != nil {
			code := http.StatusInternalServerError
			if strings.Contains(err.Error(), "不存在") {
				code = http.StatusNotFound
			}
			s.sendJSON(w, code, Response{
				Code:    code,
				Message: err.Error(),
			})
			return
		}

		s.sendJSON(w, http.StatusOK, Response{
			Code:    200,
			Message: "更新用户成功",
			Data:    updatedUser,
		})

	case "DELETE":
		// 删除用户
		idStr := strings.TrimPrefix(path, "/")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			s.sendJSON(w, http.StatusBadRequest, Response{
				Code:    400,
				Message: "无效的用户ID",
			})
			return
		}

		err = s.userService.DeleteUser(id)
		if err != nil {
			code := http.StatusInternalServerError
			if strings.Contains(err.Error(), "不存在") {
				code = http.StatusNotFound
			}
			s.sendJSON(w, code, Response{
				Code:    code,
				Message: err.Error(),
			})
			return
		}

		s.sendJSON(w, http.StatusOK, Response{
			Code:    200,
			Message: "删除用户成功",
		})

	default:
		s.sendJSON(w, http.StatusMethodNotAllowed, Response{
			Code:    405,
			Message: "不支持的请求方法",
		})
	}
}

// 健康检查处理器
func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	s.sendJSON(w, http.StatusOK, Response{
		Code:    200,
		Message: "服务运行正常",
		Data: map[string]string{
			"status":    "healthy",
			"timestamp": time.Now().Format("2006-01-02 15:04:05"),
		},
	})
}

// openFile 根据操作系统执行相应命令打开文件
func openFile(path string) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", "", path)
	case "darwin": // macOS
		cmd = exec.Command("open", path)
	case "linux":
		cmd = exec.Command("xdg-open", path)
	default:
		return fmt.Errorf("unsupported platform")
	}

	return cmd.Start()
}

// 主函数
func main() {
	// 连接SQLite数据库
	db, err := sql.Open("sqlite3", "./users.db")
	if err != nil {
		log.Fatal("连接数据库失败:", err)
	}
	defer db.Close()

	// 测试数据库连接
	if err := db.Ping(); err != nil {
		log.Fatal("数据库连接测试失败:", err)
	}

	log.Println("数据库连接成功")

	// 创建用户服务
	userService := NewUserService(db)
	if err := userService.InitDB(); err != nil {
		log.Fatal("数据库初始化失败:", err)
	}

	// 创建服务器
	server := NewServer(userService)

	// 注册路由
	http.HandleFunc("/api/users", server.userHandler)
	http.HandleFunc("/api/users/", server.userHandler)
	http.HandleFunc("/health", server.healthHandler)

	// 静态文件服务 (可选)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			fmt.Fprintf(w, `
<!DOCTYPE html>
<html>
<head>
    <title>Go CRUD API Server</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Go CRUD API 服务器</h1>
    <h2>API 端点:</h2>
    <ul>
        <li><strong>GET</strong> /api/users - 获取所有用户</li>
        <li><strong>GET</strong> /api/users/{id} - 获取指定用户</li>
        <li><strong>POST</strong> /api/users - 创建新用户</li>
        <li><strong>PUT</strong> /api/users/{id} - 更新用户</li>
        <li><strong>DELETE</strong> /api/users/{id} - 删除用户</li>
        <li><strong>GET</strong> /health - 健康检查</li>
    </ul>
    <h2>用户数据格式:</h2>
    <pre>{
  "name": "张三",
  "email": "zhangsan@example.com",
  "age": 25
}</pre>
</body>
</html>`)
		} else {
			http.NotFound(w, r)
		}
	})

	// 启动服务器
	port := ":8080"
	log.Printf("服务器启动，监听端口%s", port)
	log.Printf("访问 http://localhost%s 查看API文档", port)
	log.Printf("访问 http://localhost%s/health 进行健康检查", port)

	// 3秒后自动打开index.html
	log.Println("3秒后自动打开index.html")
	time.Sleep(3 * time.Second)
	err2 := openFile("index.html")
	if err2 != nil {
		log.Println("Failed to open index.html:", err2)
	}
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("启动服务器失败:", err)
	}
}
