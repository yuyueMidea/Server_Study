import request from './request';

export function fetchProducts(params) {
  return request.get('/products', { params });
}

export function fetchProduct(id) {
  return request.get(`/products/${id}`);
}

export function createProduct(payload) {
  return request.post('/products', payload);
}

export function updateProduct(id, payload) {
  return request.put(`/products/${id}`, payload);
}

export function deleteProduct(id) {
  return request.delete(`/products/${id}`);
}

export function fetchCategories() {
  return request.get('/products/categories');
}

export function fetchDashboardStats() {
  return request.get('/dashboard/stats');
}
