<template>
  <div class="state-block">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" />
      <path d="M12 8V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
    <p class="title">加载失败</p>
    <p class="hint">{{ message || '数据请求出现问题，请重试。' }}</p>
    <button class="btn btn-ghost btn-sm" @click="$emit('retry')">重新加载</button>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: '' },
});
defineEmits(['retry']);
</script>

<style scoped>
.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 64px 20px;
  color: var(--color-danger);
  text-align: center;
}

.title {
  font-weight: 600;
  margin: 4px 0 0;
}

.hint {
  font-size: 13px;
  color: var(--color-ink-muted);
  margin: 0 0 6px;
  max-width: 320px;
}
</style>
