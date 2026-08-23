import { createRouter, createWebHistory } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';

const routes = [
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘' },
      },
      {
        path: 'products',
        name: 'product-list',
        component: () => import('@/views/ProductList.vue'),
        meta: { title: '产品列表' },
      },
      {
        path: 'stock-records',
        name: 'stock-records',
        component: () => import('@/views/StockRecords.vue'),
        meta: { title: '进销存流水' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} · 产品库存管理` : '产品库存管理';
});

export default router;
