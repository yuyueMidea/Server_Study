import { config } from '../config/index.js';

/**
 * 将任意来源的 page / pageSize 归一化为安全的分页参数。
 * 供各 service 层统一复用，避免重复实现。
 */
export function normalizePagination({ page, pageSize }) {
  const safePage = Math.max(1, Number(page) || config.pagination.defaultPage);
  const safePageSize = Math.min(
    config.pagination.maxPageSize,
    Math.max(1, Number(pageSize) || config.pagination.defaultPageSize)
  );
  return { page: safePage, pageSize: safePageSize };
}

export default normalizePagination;
