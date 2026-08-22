<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div v-for="item in toastState.items" :key="item.id" class="toast" :class="item.type">
          {{ item.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { toastState } from '@/utils/toast';
</script>

<style scoped>
.toast-stack {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 200;
}

.toast {
  min-width: 220px;
  max-width: 340px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 12px 28px -8px rgba(27, 33, 48, 0.3);
}

.toast.success {
  background: var(--color-success);
}
.toast.error {
  background: var(--color-danger);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
