# Server_Study
Server side learning

常用流行编程语言中，**快速启动一个 Web 服务（或本地服务）**的实现方式，适合快速开发/测试 API 或 Web 页面：

一、🌐 1. JavaScript / Node.js (Express)

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
