<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="$emit('cancel')">
      <div class="dialog" role="alertdialog" aria-modal="true">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="actions">
          <button class="btn btn-ghost btn-sm" @click="$emit('cancel')">取消</button>
          <button class="btn btn-danger btn-sm" :disabled="loading" @click="$emit('confirm')">
            {{ loading ? '删除中...' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '确认删除' },
  message: { type: String, default: '此操作无法撤销，确定要继续吗？' },
  confirmText: { type: String, default: '确认删除' },
  loading: { type: Boolean, default: false },
});
defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(27, 33, 48, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  width: 320px;
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: 0 20px 48px -12px rgba(27, 33, 48, 0.35);
}

.dialog h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.dialog p {
  font-size: 13px;
  color: var(--color-ink-muted);
  margin: 0 0 20px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
