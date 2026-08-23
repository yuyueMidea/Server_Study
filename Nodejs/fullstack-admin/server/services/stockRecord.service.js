import { getDb } from '../db/connection.js';
import { ProductModel } from '../models/product.model.js';
import { StockRecordModel } from '../models/stockRecord.model.js';
import { NotFoundError, ValidationError } from '../utils/AppError.js';
import { normalizePagination } from '../utils/pagination.js';

// 入库 / 出库的预设原因，供前端下拉框使用，也用于兜底默认值
const IN_REASONS = ['采购入库', '退货入库', '盘盈入库', '其他入库'];
const OUT_REASONS = ['销售出库', '报损出库', '盘亏出库', '其他出库'];

export const StockRecordService = {
  reasons() {
    return { in: IN_REASONS, out: OUT_REASONS };
  },

  list(query) {
    const { page, pageSize } = normalizePagination(query);
    const { rows, total } = StockRecordModel.findMany({
      productId: query.productId ? Number(query.productId) : null,
      type: query.type || '',
      page,
      pageSize,
    });
    return { list: rows, page, pageSize, total };
  },

  /**
   * 登记一笔入库或出库流水，并在同一数据库事务中同步更新产品库存，
   * 保证「流水」与「库存快照」始终一致（要么都成功，要么都不生效）。
   */
  create(payload) {
    const productId = Number(payload.productId);
    const product = ProductModel.findById(productId);
    if (!product) throw new NotFoundError('产品不存在');

    const type = payload.type;
    if (!['in', 'out'].includes(type)) {
      throw new ValidationError('类型必须为 in（入库）或 out（出库）', { type: '类型不合法' });
    }

    const quantity = Number(payload.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationError('数量必须为大于 0 的整数', { quantity: '数量必须为大于 0 的整数' });
    }

    if (type === 'out' && quantity > product.stock) {
      throw new ValidationError(`库存不足，当前可用库存 ${product.stock}`, {
        quantity: `库存不足，当前可用库存 ${product.stock}`,
      });
    }

    const beforeStock = product.stock;
    const afterStock = type === 'in' ? beforeStock + quantity : beforeStock - quantity;
    const reason = payload.reason?.trim() || (type === 'in' ? '其他入库' : '其他出库');

    const db = getDb();
    const runInTransaction = db.transaction(() => {
      const record = StockRecordModel.create({
        productId: product.id,
        type,
        quantity,
        reason,
        note: payload.note?.trim() || '',
        beforeStock,
        afterStock,
      });
      ProductModel.adjustStock(product.id, afterStock);
      return record;
    });

    return runInTransaction();
  },
};

export default StockRecordService;
