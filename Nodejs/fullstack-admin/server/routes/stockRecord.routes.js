import { StockRecordController } from '../controllers/stockRecord.controller.js';
import { stockRecordBodySchema, stockRecordListQuerySchema } from '../utils/schemas.js';

/**
 * 进销存流水路由：
 *   GET  /api/stock-records          流水列表（按产品 / 类型筛选 + 分页）
 *   GET  /api/stock-records/reasons  入库 / 出库预设原因（下拉框用）
 *   POST /api/stock-records          登记一笔入库或出库（事务内同步更新库存）
 */
export default async function stockRecordRoutes(fastify) {
  fastify.get('/', { schema: { querystring: stockRecordListQuerySchema } }, StockRecordController.list);
  fastify.get('/reasons', {}, StockRecordController.reasons);
  fastify.post('/', { schema: { body: stockRecordBodySchema } }, StockRecordController.create);
}
