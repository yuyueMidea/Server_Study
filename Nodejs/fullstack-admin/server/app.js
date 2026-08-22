import path from 'node:path';
import fs from 'node:fs';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import staticPlugin from '@fastify/static';

import { config } from './config/index.js';
import registerRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function buildApp() {
  const fastify = Fastify({
    logger: {
      level: config.logLevel,
      transport: config.isProd
        ? undefined
        : { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } },
    },
  });

  // ---- 基础安全处理 ----
  fastify.register(helmet, {
    // 后台管理页面本身托管前端资源，放宽 CSP 以允许 Vite 构建产物的内联脚本引用
    contentSecurityPolicy: false,
  });

  fastify.register(rateLimit, {
    max: 300, // 每个 IP 每分钟最多 300 次请求
    timeWindow: '1 minute',
  });

  // ---- 跨域（仅开发环境需要，前端由独立的 Vite dev server 提供） ----
  fastify.register(cors, {
    origin: config.isProd ? false : config.clientOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // ---- API 路由 ----
  fastify.register(registerRoutes, { prefix: '/api' });

  // ---- 生产环境：由同一进程托管前端静态资源 ----
  if (config.isProd && fs.existsSync(config.clientDistDir)) {
    fastify.register(staticPlugin, {
      root: config.clientDistDir,
      prefix: '/',
    });

    fastify.setNotFoundHandler((request, reply) => {
      if (request.raw.url?.startsWith('/api')) {
        return notFoundHandler(request, reply);
      }
      // 前端为单页应用，未匹配到静态文件的路由一律回退到 index.html 由 Vue Router 接管
      return reply.sendFile('index.html', config.clientDistDir);
    });
  } else {
    fastify.setNotFoundHandler(notFoundHandler);
  }

  fastify.setErrorHandler(errorHandler);

  return fastify;
}

export default buildApp;
