<template>
  <div>
    <LoadingState v-if="loading" text="正在汇总统计数据..." />
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <template v-else>
      <section class="kpi-grid">
        <div class="kpi-card card">
          <span class="kpi-label">产品总数</span>
          <span class="kpi-value mono">{{ stats.totalProducts }}</span>
        </div>
        <div class="kpi-card card">
          <span class="kpi-label">在售中</span>
          <span class="kpi-value mono">{{ stats.activeCount }}</span>
        </div>
        <div class="kpi-card card">
          <span class="kpi-label">总库存件数</span>
          <span class="kpi-value mono">{{ stats.totalStock }}</span>
        </div>
        <div class="kpi-card card">
          <span class="kpi-label">库存总价值</span>
          <span class="kpi-value mono">¥{{ formatMoney(stats.totalInventoryValue) }}</span>
        </div>
        <div class="kpi-card card warn">
          <span class="kpi-label">低库存（≤20）</span>
          <span class="kpi-value mono">{{ stats.lowStockCount }}</span>
        </div>
        <div class="kpi-card card danger">
          <span class="kpi-label">已售罄</span>
          <span class="kpi-value mono">{{ stats.outOfStockCount }}</span>
        </div>
      </section>

      <section class="panels">
        <div class="card panel">
          <h2>分类分布</h2>
          <div v-if="stats.byCategory.length" class="category-list">
            <div v-for="item in stats.byCategory" :key="item.category" class="category-row">
              <span class="category-name">{{ item.category }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: barWidth(item.count) + '%' }"></div>
              </div>
              <span class="category-count mono">{{ item.count }} 款 · {{ item.stock }} 件</span>
            </div>
          </div>
          <EmptyState v-else title="暂无分类数据" />
        </div>

        <div class="card panel">
          <h2>最近新增</h2>
          <ul v-if="stats.recent.length" class="recent-list">
            <li v-for="item in stats.recent" :key="item.id">
              <div>
                <p class="recent-name">{{ item.name }}</p>
                <p class="recent-meta">{{ item.category }} · {{ item.created_at }}</p>
              </div>
              <span class="mono">¥{{ formatMoney(item.price) }}</span>
            </li>
          </ul>
          <EmptyState v-else title="暂无产品" />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { fetchDashboardStats } from '@/api/product';
import LoadingState from '@/components/LoadingState.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';

const loading = ref(true);
const error = ref('');
const stats = ref({
  totalProducts: 0,
  totalStock: 0,
  totalInventoryValue: 0,
  activeCount: 0,
  outOfStockCount: 0,
  lowStockCount: 0,
  byCategory: [],
  recent: [],
});

function formatMoney(value) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0 });
}

function barWidth(count) {
  const max = Math.max(...stats.value.byCategory.map((c) => c.count), 1);
  return Math.max(6, Math.round((count / max) * 100));
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    stats.value = await fetchDashboardStats();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.kpi-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kpi-label {
  font-size: 12px;
  color: var(--color-ink-muted);
  font-weight: 600;
}

.kpi-value {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
}

.kpi-card.warn .kpi-value {
  color: var(--color-accent-strong);
}
.kpi-card.danger .kpi-value {
  color: var(--color-danger);
}

.panels {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .panels {
    grid-template-columns: 1fr;
  }
}

.panel {
  padding: 20px;
}

.panel h2 {
  font-size: 15px;
  margin-bottom: 16px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-row {
  display: grid;
  grid-template-columns: 88px 1fr auto;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.category-name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  height: 8px;
  border-radius: 999px;
  background: var(--color-primary-soft);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
}

.category-count {
  color: var(--color-ink-muted);
  font-size: 12px;
  white-space: nowrap;
}

.recent-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recent-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
}

.recent-name {
  margin: 0;
  font-weight: 600;
}

.recent-meta {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--color-ink-muted);
}
</style>
