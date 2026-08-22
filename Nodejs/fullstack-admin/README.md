# 产品库存管理后台（Vue 3 + Fastify + SQLite3）

一个前后端一体化的全栈后台管理系统示例，可作为真实生产项目的起始模板。

## 一、项目整体架构

```
浏览器
  │  (开发环境: 5173 端口, Vite Dev Server, /api 反向代理到 3000)
  │  (生产环境: 3000 端口, 由 Fastify 同时提供静态资源与 API)
  ▼
┌─────────────────────────────┐
│  Vue 3 前端 (client/)         │  Composition API + Vue Router + Axios
└──────────────┬────────────────┘
               │ RESTful API (/api/**), 统一 JSON 响应结构
               ▼
┌─────────────────────────────┐
│  Fastify 后端 (server/)       │  routes → controllers → services → models
└──────────────┬────────────────┘
               │ 参数化 SQL
               ▼
┌─────────────────────────────┐
│  SQLite3 (server/db/app.sqlite) │  better-sqlite3，WAL 模式
└─────────────────────────────┘
```

后端采用经典四层架构：
- **routes**：只做路由注册 + Schema 校验绑定，不含业务逻辑
- **controllers**：解析请求 / 组装响应，调用 service
- **services**：业务规则（唯一性校验、分页归一化、聚合统计等）
- **models**：纯数据访问层，只写参数化 SQL，不包含业务判断

## 二、技术栈说明

| 层次 | 技术 | 说明 |
|---|---|---|
| 前端框架 | Vue 3（Composition API） | 全部使用 `<script setup>`，纯 JavaScript，无 TypeScript |
| 构建工具 | Vite 5 | 开发热更新 + 生产构建 |
| 路由 | Vue Router 4 | 布局路由 + 懒加载子路由 |
| HTTP 客户端 | Axios | 统一拦截器解包 `{success,data,message}` |
| 后端框架 | Fastify 4 | 高性能、内置 JSON Schema 校验、内置 pino 日志 |
| 数据库 | SQLite3（better-sqlite3 驱动） | 同步 API、WAL 模式、零配置文件型数据库 |
| 安全 | @fastify/helmet、@fastify/rate-limit、@fastify/cors | 基础安全响应头、限流、跨域白名单 |
| 进程编排 | npm workspaces + concurrently | 一次 `npm install`，一条 `npm run dev` 同时启动前后端 |

> 说明：SQLite 驱动选用 `better-sqlite3` 而非 `sqlite3` 包 —— 前者是同步 API、性能更好、无回调地狱，是 Node.js 生态中操作 SQLite3 数据库文件的主流选择，数据库引擎本身仍是 SQLite3。

## 三、目录结构

```
fullstack-admin/
├── package.json                 # 根 workspace，统一 install / dev / build 脚本
├── server/                      # Fastify 后端
│   ├── server.js                 # 入口：初始化数据库 → 启动 HTTP 服务 → 优雅关闭
│   ├── app.js                    # Fastify 实例构建：注册安全插件、CORS、路由、静态资源、错误处理
│   ├── config/index.js           # 环境变量集中管理
│   ├── db/
│   │   ├── connection.js         # 数据库连接单例（WAL 模式、外键约束）
│   │   └── init.js               # 自动建表 + 播种测试数据 + `--reset` 命令行重置
│   ├── models/product.model.js   # 数据访问层，纯参数化 SQL
│   ├── services/product.service.js # 业务逻辑层（唯一性校验、分页归一化、统计聚合）
│   ├── controllers/product.controller.js # 请求处理，调用 service，返回统一结构
│   ├── routes/                   # 路由注册 + Schema 绑定
│   │   ├── index.js
│   │   ├── product.routes.js
│   │   └── dashboard.routes.js
│   ├── middleware/errorHandler.js # 全局错误处理 + 404 处理
│   └── utils/                    # AppError、统一响应结构、JSON Schema 定义
├── client/                      # Vue 3 前端
│   ├── vite.config.js            # /api 反向代理到 3000 端口
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── router/index.js       # 路由表（Dashboard / 列表 / 新增 / 编辑）
│       ├── api/                  # request.js（Axios 实例 + 拦截器）、product.js（接口封装）
│       ├── layouts/AdminLayout.vue # 侧边栏 + 顶栏 + 路由出口
│       ├── views/                # Dashboard、ProductList、ProductForm、NotFound
│       ├── components/           # LoadingState / EmptyState / ErrorState / Pagination / ConfirmDialog / ToastStack
│       ├── utils/                # 表单校验、Toast 全局状态
│       └── assets/styles.css     # 设计 Token（色彩 / 字体 / 圆角）与基础组件样式
└── .gitignore
```

## 四、数据库设计

数据库文件：`server/db/app.sqlite`（首次启动自动创建，随代码库通过 `.gitignore` 排除）。

**`products` 表**

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 主键 |
| name | TEXT | NOT NULL | 产品名称，业务层保证唯一 |
| category | TEXT | NOT NULL | 分类 |
| price | REAL | NOT NULL, CHECK ≥ 0 | 价格 |
| stock | INTEGER | NOT NULL DEFAULT 0, CHECK ≥ 0 | 库存 |
| status | TEXT | NOT NULL DEFAULT 'active', CHECK IN ('active','inactive') | 上架状态 |
| description | TEXT | DEFAULT '' | 描述 |
| created_at | TEXT | DEFAULT now | 创建时间 |
| updated_at | TEXT | DEFAULT now | 更新时间（更新时自动刷新） |

索引：`category`、`status`、`name` 均建立索引以加速筛选与搜索。

启动时自动执行：**建库（文件系统自动创建）→ 建表（幂等 `CREATE TABLE IF NOT EXISTS`）→ 空表时播种 15 条测试数据**。也可执行 `npm run db:reset` 清空并重新播种。

## 五、API 设计

统一响应结构：

```json
// 成功
{ "success": true, "data": { /* ... */ }, "message": "success" }

// 失败（含参数校验 / 业务错误 / 服务器错误）
{ "success": false, "data": null, "message": "错误信息", "errors": { "字段名": "错误说明" } }
```

| 方法 | 路径 | 说明 | 请求参数 |
|---|---|---|---|
| GET | `/api/health` | 健康检查 | — |
| GET | `/api/products` | 分页列表 | `page, pageSize, keyword, category, status, sortBy, sortOrder` |
| GET | `/api/products/categories` | 全部分类（筛选下拉框用） | — |
| GET | `/api/products/:id` | 产品详情 | — |
| POST | `/api/products` | 新增产品 | `name, category, price, stock, status?, description?` |
| PUT | `/api/products/:id` | 更新产品 | 同上 |
| DELETE | `/api/products/:id` | 删除产品 | — |
| GET | `/api/dashboard/stats` | 仪表盘聚合统计 | — |

所有写接口均通过 Fastify JSON Schema 做请求体校验（类型 / 长度 / 数值范围 / 枚举），并在 service 层做业务校验（如产品名称唯一性）。

## 六、前端页面

- **Dashboard**：产品总数 / 在售数 / 总库存 / 库存总价值 / 低库存 / 已售罄等 KPI 卡片，分类分布条形图，最近新增列表
- **产品列表**：关键字搜索、分类筛选、状态筛选、分页、编辑跳转、删除二次确认
- **新增 / 编辑表单**：前端实时校验 + 后端错误回填（如名称重复），Loading / Error / Empty 状态在列表页均已覆盖

## 七、快速开始

```bash
# 1. 安装依赖（root workspace 会一次性安装 client + server 全部依赖）
npm install

# 2. 启动开发环境（同时启动 Vite 前端 5173 + Fastify 后端 3000，/api 自动代理）
npm run dev

# 浏览器访问 http://localhost:5173
```

生产部署：

```bash
npm run build   # 构建前端产物到 client/dist
npm start        # 以生产模式启动 Fastify，同一进程托管静态资源 + API + SPA 路由回退
# 浏览器访问 http://localhost:3000
```

重置数据库（清空并重新播种测试数据）：

```bash
npm run db:reset
```

## 八、环境变量（可选，均有默认值）

| 变量 | 默认值 | 说明 |
|---|---|---|
| PORT | 3000 | 后端端口 |
| HOST | 0.0.0.0 | 监听地址 |
| CLIENT_ORIGIN | http://localhost:5173 | 开发环境 CORS 白名单 |
| LOG_LEVEL | development: debug / production: info | 日志级别 |
| NODE_ENV | development | development / production |
