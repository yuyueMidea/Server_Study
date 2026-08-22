import { buildApp } from './app.js';
import { initDatabase } from './db/init.js';
import { config } from './config/index.js';

async function start() {
  // 数据库自动创建 + 数据表初始化 + 测试数据播种
  initDatabase();

  const app = buildApp();

  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`环境: ${config.env}`);
    app.log.info(`API 前缀: http://localhost:${config.port}/api`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const shutdown = async (signal) => {
    app.log.info(`收到 ${signal}，正在优雅关闭...`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
