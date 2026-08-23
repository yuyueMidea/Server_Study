import { getDb } from './connection.js';

const CREATE_PRODUCTS_TABLE = `
CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  price       REAL    NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status      TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  description TEXT    DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
`;

const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`,
  `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`,
  `CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);`,
];

// ---- 进销存：库存流水表 ----
// 每一次入库 / 出库都会写入一条不可变的流水记录，并原子性地同步更新 products.stock。
// 简化说明：product_id 使用 ON DELETE CASCADE，即删除产品会级联清空其流水；
// 生产系统通常会改为“禁止删除有流水的产品”或对产品做软删除，这里作为后续可扩展点。
const CREATE_STOCK_RECORDS_TABLE = `
CREATE TABLE IF NOT EXISTS stock_records (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type         TEXT    NOT NULL CHECK (type IN ('in', 'out')),
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  reason       TEXT    NOT NULL,
  before_stock INTEGER NOT NULL,
  after_stock  INTEGER NOT NULL,
  note         TEXT    DEFAULT '',
  created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
`;

const CREATE_STOCK_RECORD_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_stock_records_product ON stock_records(product_id);`,
  `CREATE INDEX IF NOT EXISTS idx_stock_records_type ON stock_records(type);`,
  `CREATE INDEX IF NOT EXISTS idx_stock_records_created_at ON stock_records(created_at);`,
];

const SEED_PRODUCTS = [
  { name: '机械键盘 K1', category: '外设', price: 399, stock: 120, status: 'active', description: '87键茶轴机械键盘，支持热插拔。' },
  { name: '无线鼠标 M2', category: '外设', price: 129, stock: 300, status: 'active', description: '2.4G 无线连接，续航 6 个月。' },
  { name: '27寸 2K 显示器', category: '显示器', price: 1299, stock: 45, status: 'active', description: 'IPS 面板，165Hz 刷新率。' },
  { name: '4K 显示器 Pro', category: '显示器', price: 2599, stock: 18, status: 'active', description: '专业色彩校准，支持 HDR400。' },
  { name: 'USB-C 扩展坞', category: '配件', price: 199, stock: 210, status: 'active', description: '7合1接口，支持 100W PD 快充。' },
  { name: '降噪耳机 H3', category: '音频', price: 899, stock: 60, status: 'active', description: '主动降噪，40小时续航。' },
  { name: '蓝牙音箱 S1', category: '音频', price: 349, stock: 80, status: 'inactive', description: '已停产型号，仅剩库存。' },
  { name: '笔记本支架', category: '配件', price: 89, stock: 500, status: 'active', description: '铝合金材质，可折叠收纳。' },
  { name: '人体工学椅', category: '家具', price: 1899, stock: 25, status: 'active', description: '腰部支撑可调，透气网布。' },
  { name: '升降办公桌', category: '家具', price: 2199, stock: 12, status: 'active', description: '电动升降，记忆高度。' },
  { name: '摄像头 C1080', category: '外设', price: 259, stock: 0, status: 'inactive', description: '暂时缺货，等待补货。' },
  { name: '移动固态硬盘 1TB', category: '存储', price: 649, stock: 150, status: 'active', description: 'USB 3.2，读速 1050MB/s。' },
  { name: '路由器 Mesh Pro', category: '网络', price: 799, stock: 40, status: 'active', description: '三节点组网，覆盖 300㎡。' },
  { name: '智能台灯', category: '家居', price: 259, stock: 90, status: 'active', description: '护眼无频闪，App 调光。' },
  { name: '车载支架', category: '配件', price: 59, stock: 400, status: 'active', description: '磁吸式，兼容主流机型。' },
];

/**
 * 建表（幂等，可安全重复调用）。
 */
function createSchema(db) {
  db.exec(CREATE_PRODUCTS_TABLE);
  for (const stmt of CREATE_INDEXES) db.exec(stmt);
  db.exec(CREATE_STOCK_RECORDS_TABLE);
  for (const stmt of CREATE_STOCK_RECORD_INDEXES) db.exec(stmt);
}

/**
 * 若数据表为空，写入初始测试数据。
 */
function seedIfEmpty(db) {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM products').get();
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO products (name, category, price, stock, status, description)
    VALUES (@name, @category, @price, @stock, @status, @description)
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(SEED_PRODUCTS);
}

/**
 * 初始化数据库：建库（文件系统层面自动创建）、建表、播种测试数据。
 * 在应用启动时调用一次即可。
 */
export function initDatabase() {
  const db = getDb();
  createSchema(db);
  seedIfEmpty(db);
  return db;
}

/**
 * 支持通过 `npm run db:reset` 命令行直接重置数据库（清空并重新播种）。
 */
if (process.argv.includes('--reset')) {
  const db = getDb();
  db.exec('DROP TABLE IF EXISTS stock_records;');
  db.exec('DROP TABLE IF EXISTS products;');
  createSchema(db);
  seedIfEmpty(db);
  console.log('[db] 数据库已重置并重新播种测试数据。');
  process.exit(0);
}

export default initDatabase;
