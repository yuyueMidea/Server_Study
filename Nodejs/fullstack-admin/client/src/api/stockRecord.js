import request from './request';

export function fetchStockRecords(params) {
  return request.get('/stock-records', { params });
}

export function createStockRecord(payload) {
  return request.post('/stock-records', payload);
}

export function fetchStockReasons() {
  return request.get('/stock-records/reasons');
}
