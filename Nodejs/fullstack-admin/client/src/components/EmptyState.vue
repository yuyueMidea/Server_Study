<template>
  <div class="state-block">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7L12 3L20 7V17L12 21L4 17V7Z"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <path d="M4 7L12 11L20 7" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
      <path d="M12 11V21" stroke="currentColor" stroke-width="1.4" />
    </svg>
    <p class="title">{{ title }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
    <button v-if="actionText" class="btn btn-primary btn-sm" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  hint: { type: String, default: '' },
  actionText: { type: String, default: '' },
});
defineEmits(['action']);
</script>

<style scoped>
.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 64px 20px;
  color: var(--color-ink-muted);
  text-align: center;
}

.title {
  font-weight: 600;
  color: var(--color-ink);
  margin: 4px 0 0;
}

.hint {
  font-size: 13px;
  margin: 0 0 6px;
  max-width: 320px;
}
</style>
