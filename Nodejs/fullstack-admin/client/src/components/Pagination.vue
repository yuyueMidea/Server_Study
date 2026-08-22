<template>
  <div class="pagination">
    <span class="summary">共 <b class="mono">{{ total }}</b> 条，第 {{ page }} / {{ totalPages }} 页</span>
    <div class="controls">
      <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="$emit('change', page - 1)">
        上一页
      </button>
      <button
        class="btn btn-ghost btn-sm"
        :disabled="page >= totalPages"
        @click="$emit('change', page + 1)"
      >
        下一页
      </button>
      <select class="page-size" :value="pageSize" @change="onPageSizeChange">
        <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }} 条/页</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  page: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  total: { type: Number, required: true },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50] },
});
const emit = defineEmits(['change', 'page-size-change']);

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

function onPageSizeChange(event) {
  emit('page-size-change', Number(event.target.value));
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border);
  font-size: 13px;
  color: var(--color-ink-muted);
  flex-wrap: wrap;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size {
  height: 30px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  padding: 0 8px;
  font-size: 13px;
  background: #fff;
}
</style>
