import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from '../config/index.js';

let dbInstance = null;

/**
 * 获取全局唯一的数据库连接（单例）。
 * 首次调用时会确保 db 目录存在，并开启 WAL 模式与外键约束。
 */
export function getDb() {
  if (dbInstance) return dbInstance;

  const dbDir = path.dirname(config.dbFile);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new Database(config.dbFile);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export default getDb;
