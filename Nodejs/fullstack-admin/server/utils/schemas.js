/**
 * Fastify 基于 JSON Schema 做请求参数校验（body / querystring / params）。
 * 校验失败会被全局错误处理中间件捕获，并转换为统一的 422 响应结构。
 */

export const productBodySchema = {
  type: 'object',
  required: ['name', 'category', 'price', 'stock'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    category: { type: 'string', minLength: 1, maxLength: 50 },
    price: { type: 'number', minimum: 0, maximum: 1000000 },
    stock: { type: 'integer', minimum: 0, maximum: 1000000 },
    status: { type: 'string', enum: ['active', 'inactive'] },
    description: { type: 'string', maxLength: 500 },
  },
};

export const productListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    keyword: { type: 'string', maxLength: 100 },
    category: { type: 'string', maxLength: 50 },
    status: { type: 'string', enum: ['active', 'inactive', ''] },
    sortBy: { type: 'string', enum: ['id', 'name', 'price', 'stock', 'created_at', 'updated_at'] },
    sortOrder: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', pattern: '^[0-9]+$' },
  },
};
