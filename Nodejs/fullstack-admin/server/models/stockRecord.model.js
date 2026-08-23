import { getDb } from '../db/connection.js';

/**
 * 进销存流水表数据访问层。流水记录本身是不可变的（只增不改不删），
 * 因此这里只提供 findMany / create，没有 update / remove。
 */
export const StockRecordModel = {
  findMany({ productId, type, page, pageSize }) {
    const db = getDb();
    const clauses = [];
    const params = {};

    if (productId) {
      clauses.push('sr.product_id = @productId');
      params.productId = productId;
    }
    if (type) {
      clauses.push('sr.type = @type');
      params.type = type;
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const rows = db
      .prepare(
        `SELECT sr.*, p.name AS product_name, p.category AS product_category
         FROM stock_records sr
         JOIN products p ON p.id = sr.product_id
         ${where}
         ORDER BY sr.created_at DESC, sr.id DESC
         LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit: pageSize, offset });

    const { total } = db
      .prepare(`SELECT COUNT(*) AS total FROM stock_records sr ${where}`)
      .get(params);

    return { rows, total };
  },

  create({ productId, type, quantity, reason, note, beforeStock, afterStock }) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO stock_records (product_id, type, quantity, reason, before_stock, after_stock, note)
      VALUES (@productId, @type, @quantity, @reason, @beforeStock, @afterStock, @note)
    `);
    const result = stmt.run({ productId, type, quantity, reason, beforeStock, afterStock, note });
    return db
      .prepare(
        `SELECT sr.*, p.name AS product_name, p.category AS product_category
         FROM stock_records sr JOIN products p ON p.id = sr.product_id
         WHERE sr.id = ?`
      )
      .get(result.lastInsertRowid);
  },
};

export default StockRecordModel;
