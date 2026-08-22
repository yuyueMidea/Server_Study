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
        path: 'products/new',
        name: 'product-create',
        component: () => import('@/views/ProductForm.vue'),
        meta: { title: '新增产品' },
      },
      {
        path: 'products/:id/edit',
        name: 'product-edit',
        component: () => import('@/views/ProductForm.vue'),
        meta: { title: '编辑产品' },
        props: true,
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
