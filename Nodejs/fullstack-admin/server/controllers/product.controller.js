import { ProductService } from '../services/product.service.js';
import { success, paginated } from '../utils/response.js';

export const ProductController = {
  async list(request, reply) {
    const { list, page, pageSize, total } = ProductService.list(request.query);
    return reply.send(success(paginated(list, { page, pageSize, total })));
  },

  async detail(request, reply) {
    const product = ProductService.getById(Number(request.params.id));
    return reply.send(success(product));
  },

  async create(request, reply) {
    const product = ProductService.create(request.body);
    return reply.code(201).send(success(product, '创建成功'));
  },

  async update(request, reply) {
    const product = ProductService.update(Number(request.params.id), request.body);
    return reply.send(success(product, '更新成功'));
  },

  async remove(request, reply) {
    ProductService.remove(Number(request.params.id));
    return reply.send(success(null, '删除成功'));
  },

  async categories(request, reply) {
    const categories = ProductService.categories();
    return reply.send(success(categories));
  },

  async dashboardStats(request, reply) {
    const stats = ProductService.dashboardStats();
    return reply.send(success(stats));
  },
};

export default ProductController;
