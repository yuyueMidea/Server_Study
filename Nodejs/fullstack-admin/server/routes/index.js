import productRoutes from './product.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import stockRecordRoutes from './stockRecord.routes.js';
import { success } from '../utils/response.js';

export default async function registerRoutes(fastify) {
  fastify.get('/health', async () => success({ status: 'ok', time: new Date().toISOString() }));

  fastify.register(productRoutes, { prefix: '/products' });
  fastify.register(dashboardRoutes, { prefix: '/dashboard' });
  fastify.register(stockRecordRoutes, { prefix: '/stock-records' });
}
