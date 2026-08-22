<template>
  <div>
    <div class="toolbar card">
      <div class="filters">
        <input
          v-model.trim="filters.keyword"
          type="search"
          placeholder="搜索产品名称或描述"
          class="search-input"
          @keyup.enter="onSearch"
        />
        <select v-model="filters.category" class="filter-select" @change="onSearch">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="filters.status" class="filter-select" @change="onSearch">
          <option value="">全部状态</option>
          <option value="active">在售</option>
          <option value="inactive">已下架</option>
        </select>
        <button class="btn btn-ghost btn-sm" @click="onSearch">搜索</button>
        <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm" @click="resetFilters">重置</button>
      </div>
      <router-link :to="{ name: 'product-create' }" class="btn btn-primary">+ 新增产品</router-link>
    </div>

    <div class="card table-card">
      <LoadingState v-if="loading" />
      <ErrorState v-else-if="error" :message="error" @retry="load" />
      <EmptyState
        v-else-if="list.length === 0"
        title="没有找到匹配的产品"
        :hint="hasActiveFilters ? '试试调整搜索条件或筛选项' : '点击右上角新增第一个产品'"
        :action-text="hasActiveFilters ? '清除筛选' : ''"
        @action="resetFilters"
      />
      <template v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>产品名称</th>
              <th>分类</th>
              <th class="num">价格</th>
              <th class="num">库存</th>
              <th>状态</th>
              <th>更新时间</th>
              <th class="ops">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td>
                <p class="name">{{ item.name }}</p>
                <p class="desc">{{ item.description || '—' }}</p>
              </td>
              <td>{{ item.category }}</td>
              <td class="num mono">¥{{ item.price.toLocaleString('zh-CN') }}</td>
              <td class="num mono" :class="{ 'low-stock': item.stock <= 20 }">{{ item.stock }}</td>
              <td>
                <span class="badge" :class="item.status === 'active' ? 'badge-active' : 'badge-inactive'">
                  {{ item.status === 'active' ? '在售' : '已下架' }}
                </span>
              </td>
              <td class="mono muted">{{ item.updated_at }}</td>
              <td class="ops">
                <router-link :to="{ name: 'product-edit', params: { id: item.id } }" class="btn btn-ghost btn-sm">
                  编辑
                </router-link>
                <button class="btn btn-danger btn-sm" @click="askDelete(item)">删除</button>
              </td>
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

    <ConfirmDialog
      :open="deleteTarget !== null"
      :loading="deleting"
      :message="deleteTarget ? `确定要删除「${deleteTarget.name}」吗？此操作无法撤销。` : ''"
      @cancel="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { fetchProducts, fetchCategories, deleteProduct } from '@/api/product';
import LoadingState from '@/components/LoadingState.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import Pagination from '@/components/Pagination.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { toast } from '@/utils/toast';

const list = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref('');
const deleteTarget = ref(null);
const deleting = ref(false);

const filters = reactive({ keyword: '', category: '', status: '' });
const pagination = reactive({ page: 1, pageSize: 10, total: 0 });

const hasActiveFilters = computed(
  () => Boolean(filters.keyword) || Boolean(filters.category) || Boolean(filters.status)
);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const result = await fetchProducts({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      category: filters.category,
      status: filters.status,
      sortBy: 'updated_at',
      sortOrder: 'desc',
    });
    list.value = result.list;
    pagination.total = result.pagination.total;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  try {
    categories.value = await fetchCategories();
  } catch {
    // 分类下拉框加载失败不影响主流程，静默忽略
  }
}

function onSearch() {
  pagination.page = 1;
  load();
}

function resetFilters() {
  filters.keyword = '';
  filters.category = '';
  filters.status = '';
  onSearch();
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

function askDelete(item) {
  deleteTarget.value = item;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await deleteProduct(deleteTarget.value.id);
    toast.success(`已删除「${deleteTarget.value.name}」`);
    deleteTarget.value = null;
    if (list.value.length === 1 && pagination.page > 1) {
      pagination.page -= 1;
    }
    await load();
    await loadCategories();
  } catch (err) {
    toast.error(err.message || '删除失败');
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  load();
  loadCategories();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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

.search-input {
  height: 36px;
  width: 220px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 13px;
}
.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.filter-select {
  height: 36px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 13px;
  background: #fff;
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
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.num {
  text-align: right;
}

.low-stock {
  color: var(--color-accent-strong);
  font-weight: 700;
}

.muted {
  color: var(--color-ink-muted);
}

.ops {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

th.ops {
  text-align: left;
}
</style>
