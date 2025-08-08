# 下载依赖
go mod tidy

#运行服务器
go run main.go

数据结构如下：
```
{
  "id": 1,
  "name": "张三",
  "email": "zhangsan@example.com",
  "age": 25,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

💡 主要技术点

- SQLite驱动：使用github.com/mattn/go-sqlite3
- 数据库连接池：自动管理连接
- SQL注入防护：使用参数化查询
- 时间戳：自动管理创建和更新时间
- 输入验证：基本的数据验证

服务器启动后会在8080端口运行，访问 http://localhost:8080 可以看到API文档页面。数据库文件users.db会自动创建在项目根目录。
