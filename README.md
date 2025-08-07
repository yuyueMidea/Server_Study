# Server_Study
Server side learning

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




