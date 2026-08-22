import { ProductController } from '../controllers/product.controller.js';

/**
 * GET /api/dashboard/stats  仪表盘聚合统计数据
 */
export default async function dashboardRoutes(fastify) {
  fastify.get('/stats', {}, ProductController.dashboardStats);
}
