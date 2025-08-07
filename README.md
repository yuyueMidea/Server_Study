# Server_Study
Server side learning

**各语言服务端实现方式对比表**
| 语言          | 实现方式              | 启动复杂度 | 性能    | 开发效率 | 学习曲线 | 部署难度 | 生态丰富度 | 适用场景            |
| ----------- | ----------------- | ----- | ----- | ---- | ---- | ---- | ----- | --------------- |
| **Go**      | net/http / Gin    | ⭐⭐    | ⭐⭐⭐⭐  | ⭐⭐⭐⭐ | ⭐⭐⭐  | ⭐⭐   | ⭐⭐⭐⭐  | 后端、高并发、微服务      |
| **Node.js** | Express / Fastify | ⭐     | ⭐⭐⭐   | ⭐⭐⭐⭐ | ⭐⭐   | ⭐    | ⭐⭐⭐⭐  | 快速 API 开发、前后端融合 |
| **Python**  | Flask / FastAPI   | ⭐     | ⭐⭐    | ⭐⭐⭐⭐ | ⭐⭐   | ⭐    | ⭐⭐⭐⭐  | 教育、原型设计、AI 接口   |
| **Java**    | Spring Boot       | ⭐⭐⭐   | ⭐⭐⭐⭐  | ⭐⭐   | ⭐⭐⭐  | ⭐⭐   | ⭐⭐⭐⭐⭐ | 企业级、复杂业务        |
| **Rust**    | Actix / Axum      | ⭐⭐    | ⭐⭐⭐⭐⭐ | ⭐⭐   | ⭐⭐⭐⭐ | ⭐⭐   | ⭐⭐    | 高性能服务、系统编程      |
| **C#**      | ASP.NET Core      | ⭐⭐    | ⭐⭐⭐⭐  | ⭐⭐   | ⭐⭐⭐  | ⭐⭐   | ⭐⭐⭐⭐  | 企业级系统、桌面+Web    |
| **PHP**     | 原生 / Laravel      | ⭐     | ⭐⭐    | ⭐⭐⭐  | ⭐    | ⭐    | ⭐⭐⭐⭐  | 小型网站、CMS        |
| **Deno**    | 原生 HTTP API       | ⭐     | ⭐⭐⭐   | ⭐⭐⭐  | ⭐⭐   | ⭐    | ⭐⭐    | 现代 JS 服务、轻量 API |


常用流行编程语言中，**快速启动一个 Web 服务（或本地服务）**的实现方式，适合快速开发/测试 API 或 Web 页面：

一、🌐 JavaScript / Node.js (Express)

```
//安装依赖：
npm init -y
npm install express
```
```
//快速服务代码（server.js）：
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

```

二、🐍 Python (Flask)
```
//安装依赖
pip install flask
```
```
//快速服务代码（app.py）：
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from Flask!"

if __name__ == '__main__':
    app.run(port=5000)

```

三、🧵  Go (net/http)
```
//快速服务代码（main.go）：
package main
import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "Hello from Go!")
}

func main() {
    http.HandleFunc("/", handler)
    http.ListenAndServe(":8080", nil)
}

```
```
//启动：
go run main.go
```




