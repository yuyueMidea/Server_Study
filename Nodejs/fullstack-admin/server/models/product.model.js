import { getDb } from '../db/connection.js';

/**
 * 数据访问层：只负责与 SQLite 交互，所有 SQL 均使用参数化查询防止注入。
 * 不包含业务规则（业务规则放在 services 层）。
 */

function buildWhereClause({ keyword, category, status }) {
  const clauses = [];
  const params = {};

  if (keyword) {
    clauses.push('(name LIKE @keyword OR description LIKE @keyword)');
    params.keyword = `%${keyword}%`;
  }
  if (category) {
    clauses.push('category = @category');
    params.category = category;
  }
  if (status) {
    clauses.push('status = @status');
    params.status = status;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

export const ProductModel = {
  findMany({ keyword, category, status, page, pageSize, sortBy, sortOrder }) {
    const db = getDb();
    const { where, params } = buildWhereClause({ keyword, category, status });

    const allowedSort = new Set(['id', 'name', 'price', 'stock', 'created_at', 'updated_at']);
    const safeSortBy = allowedSort.has(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const offset = (page - 1) * pageSize;

    const rows = db
      .prepare(
        `SELECT * FROM products ${where}
         ORDER BY ${safeSortBy} ${safeSortOrder}
         LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit: pageSize, offset });

    const { total } = db
      .prepare(`SELECT COUNT(*) AS total FROM products ${where}`)
      .get(params);

    return { rows, total };
  },

  findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  },

  findByName(name, excludeId = null) {
    const db = getDb();
    if (excludeId) {
      return db
        .prepare('SELECT * FROM products WHERE name = ? AND id != ?')
        .get(name, excludeId);
    }
    return db.prepare('SELECT * FROM products WHERE name = ?').get(name);
  },

  create(data) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO products (name, category, price, stock, status, description)
      VALUES (@name, @category, @price, @stock, @status, @description)
    `);
    const result = stmt.run(data);
    return this.findById(result.lastInsertRowid);
  },

  update(id, data) {
    const db = getDb();
    const stmt = db.prepare(`
      UPDATE products SET
        name = @name,
        category = @category,
        price = @price,
        stock = @stock,
        status = @status,
        description = @description,
        updated_at = datetime('now', 'localtime')
      WHERE id = @id
    `);
    stmt.run({ ...data, id });
    return this.findById(id);
  },

  /**
   * 仅更新库存数量与 updated_at，供进销存模块在事务中调用。
   * 不走通用 update()，避免入库/出库时误改其它字段。
   */
  adjustStock(id, newStock) {
    const db = getDb();
    db.prepare(
      `UPDATE products SET stock = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`
    ).run(newStock, id);
    return this.findById(id);
  },

  remove(id) {
    const db = getDb();
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return result.changes > 0;
  },

  distinctCategories() {
    const db = getDb();
    return db
      .prepare('SELECT DISTINCT category FROM products ORDER BY category ASC')
      .all()
      .map((row) => row.category);
  },

  stats() {
    const db = getDb();
    const totals = db
      .prepare(
        `SELECT
           COUNT(*) AS totalProducts,
           COALESCE(SUM(stock), 0) AS totalStock,
           COALESCE(SUM(price * stock), 0) AS totalInventoryValue,
           COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) AS activeCount,
           COALESCE(SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END), 0) AS outOfStockCount,
           COALESCE(SUM(CASE WHEN stock > 0 AND stock <= 20 THEN 1 ELSE 0 END), 0) AS lowStockCount
         FROM products`
      )
      .get();

    const byCategory = db
      .prepare(
        `SELECT category, COUNT(*) AS count, COALESCE(SUM(stock), 0) AS stock
         FROM products GROUP BY category ORDER BY count DESC`
      )
      .all();

    const recent = db
      .prepare('SELECT * FROM products ORDER BY created_at DESC LIMIT 5')
      .all();

    return { ...totals, byCategory, recent };
  },
};

export default ProductModel;
