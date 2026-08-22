import { ProductModel } from '../models/product.model.js';
import { NotFoundError, ValidationError } from '../utils/AppError.js';
import { config } from '../config/index.js';

function normalizePagination({ page, pageSize }) {
  const safePage = Math.max(1, Number(page) || config.pagination.defaultPage);
  const safePageSize = Math.min(
    config.pagination.maxPageSize,
    Math.max(1, Number(pageSize) || config.pagination.defaultPageSize)
  );
  return { page: safePage, pageSize: safePageSize };
}

export const ProductService = {
  list(query) {
    const { page, pageSize } = normalizePagination(query);
    const { rows, total } = ProductModel.findMany({
      keyword: query.keyword?.trim() || '',
      category: query.category?.trim() || '',
      status: query.status?.trim() || '',
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page,
      pageSize,
    });
    return { list: rows, page, pageSize, total };
  },

  getById(id) {
    const product = ProductModel.findById(id);
    if (!product) throw new NotFoundError(`未找到 ID 为 ${id} 的产品`);
    return product;
  },

  create(payload) {
    const existing = ProductModel.findByName(payload.name);
    if (existing) {
      throw new ValidationError('产品名称已存在', { name: '该名称已被使用' });
    }
    return ProductModel.create({
      name: payload.name.trim(),
      category: payload.category.trim(),
      price: payload.price,
      stock: payload.stock,
      status: payload.status || 'active',
      description: payload.description?.trim() || '',
    });
  },

  update(id, payload) {
    const current = ProductModel.findById(id);
    if (!current) throw new NotFoundError(`未找到 ID 为 ${id} 的产品`);

    const duplicated = ProductModel.findByName(payload.name, id);
    if (duplicated) {
      throw new ValidationError('产品名称已存在', { name: '该名称已被使用' });
    }

    return ProductModel.update(id, {
      name: payload.name.trim(),
      category: payload.category.trim(),
      price: payload.price,
      stock: payload.stock,
      status: payload.status,
      description: payload.description?.trim() || '',
    });
  },

  remove(id) {
    const current = ProductModel.findById(id);
    if (!current) throw new NotFoundError(`未找到 ID 为 ${id} 的产品`);
    ProductModel.remove(id);
    return true;
  },

  categories() {
    return ProductModel.distinctCategories();
  },

  dashboardStats() {
    return ProductModel.stats();
  },
};

export default ProductService;
