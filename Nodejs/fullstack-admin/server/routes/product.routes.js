import { ProductController } from '../controllers/product.controller.js';
import { productBodySchema, productListQuerySchema, idParamSchema } from '../utils/schemas.js';

/**
 * 产品相关 RESTful 路由：
 *   GET    /api/products            列表（分页 / 搜索 / 筛选）
 *   GET    /api/products/categories 全部分类（用于筛选下拉框）
 *   GET    /api/products/:id        详情
 *   POST   /api/products            新增
 *   PUT    /api/products/:id        更新
 *   DELETE /api/products/:id        删除
 */
export default async function productRoutes(fastify) {
  fastify.get('/', { schema: { querystring: productListQuerySchema } }, ProductController.list);

  fastify.get('/categories', {}, ProductController.categories);

  fastify.get('/:id', { schema: { params: idParamSchema } }, ProductController.detail);

  fastify.post('/', { schema: { body: productBodySchema } }, ProductController.create);

  fastify.put(
    '/:id',
    { schema: { params: idParamSchema, body: productBodySchema } },
    ProductController.update
  );

  fastify.delete('/:id', { schema: { params: idParamSchema } }, ProductController.remove);
}
