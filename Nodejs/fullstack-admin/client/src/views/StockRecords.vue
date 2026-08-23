<template>
  <div>
    <div class="toolbar card">
      <div class="filters">
        <select v-model="filters.productId" class="filter-select" @change="onFilterChange">
          <option value="">全部产品</option>
          <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select v-model="filters.type" class="filter-select" @change="onFilterChange">
          <option value="">全部类型</option>
          <option value="in">入库</option>
          <option value="out">出库</option>
        </select>
        <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm" @click="resetFilters">重置</button>
      </div>
    </div>

    <div class="card table-card">
      <LoadingState v-if="loading" />
      <ErrorState v-else-if="error" :message="error" @retry="load" />
      <EmptyState
        v-else-if="list.length === 0"
        title="暂无流水记录"
        hint="在「产品列表」中点击某个产品的「入库/出库」按钮即可登记"
      />
      <template v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>产品</th>
              <th>类型</th>
              <th class="num">数量</th>
              <th class="num">变动前</th>
              <th class="num">变动后</th>
              <th>原因</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td class="mono muted">{{ item.created_at }}</td>
              <td>
                <p class="name">{{ item.product_name }}</p>
                <p class="desc">{{ item.product_category }}</p>
              </td>
              <td>
                <span class="badge" :class="item.type === 'in' ? 'badge-active' : 'badge-inactive'">
                  {{ item.type === 'in' ? '入库' : '出库' }}
                </span>
              </td>
              <td class="num mono" :class="item.type === 'in' ? 'qty-in' : 'qty-out'">
                {{ item.type === 'in' ? '+' : '-' }}{{ item.quantity }}
              </td>
              <td class="num mono muted">{{ item.before_stock }}</td>
              <td class="num mono">{{ item.after_stock }}</td>
              <td>{{ item.reason }}</td>
              <td class="desc">{{ item.note || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <Pagination
          :page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @change="onPageChange"
          @page-size-change="onPageSizeChange"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { fetchStockRecords } from '@/api/stockRecord';
import { fetchProducts } from '@/api/product';
import LoadingState from '@/components/LoadingState.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import Pagination from '@/components/Pagination.vue';

const list = ref([]);
const products = ref([]);
const loading = ref(true);
const error = ref('');

const filters = reactive({ productId: '', type: '' });
const pagination = reactive({ page: 1, pageSize: 10, total: 0 });

const hasActiveFilters = computed(() => Boolean(filters.productId) || Boolean(filters.type));

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const result = await fetchStockRecords({
      page: pagination.page,
      pageSize: pagination.pageSize,
      productId: filters.productId || undefined,
      type: filters.type || undefined,
    });
    list.value = result.list;
    pagination.total = result.pagination.total;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function loadProducts() {
  try {
    const result = await fetchProducts({ page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc' });
    products.value = result.list;
  } catch {
    // 产品筛选下拉框加载失败不影响主流程
  }
}

function onFilterChange() {
  pagination.page = 1;
  load();
}

function resetFilters() {
  filters.productId = '';
  filters.type = '';
  onFilterChange();
}

function onPageChange(page) {
  pagination.page = page;
  load();
}

function onPageSizeChange(size) {
  pagination.pageSize = size;
  pagination.page = 1;
  load();
}

onMounted(() => {
  load();
  loadProducts();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-select {
  height: 36px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 13px;
  background: #fff;
  min-width: 140px;
}

.table-card {
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  text-align: left;
  padding: 12px 20px;
  font-size: 12px;
  color: var(--color-ink-muted);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}

.data-table td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: #fafbfd;
}

.name {
  margin: 0;
  font-weight: 600;
}

.desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--color-ink-muted);
}

.num {
  text-align: right;
}

.qty-in {
  color: var(--color-success);
  font-weight: 700;
}
.qty-out {
  color: var(--color-danger);
  font-weight: 700;
}

.muted {
  color: var(--color-ink-muted);
}
</style>
