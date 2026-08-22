import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

export const config = {
  env,
  isProd,
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',

  // 前端开发服务器地址，用于 CORS 白名单（生产环境由同一进程提供静态文件，无需 CORS）
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  // SQLite 数据库文件路径，统一放在 server/db/ 目录下
  dbFile: path.join(rootDir, 'db', 'app.sqlite'),

  // 生产环境下 Vite 构建产物目录（由 npm run build 生成）
  clientDistDir: path.resolve(rootDir, '..', 'client', 'dist'),

  // 分页默认值
  pagination: {
    defaultPage: 1,
    defaultPageSize: 10,
    maxPageSize: 100,
  },

  // 日志
  logLevel: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
};

export default config;
