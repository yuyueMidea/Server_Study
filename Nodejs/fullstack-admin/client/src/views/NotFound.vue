<template>
  <div class="not-found">
    <p class="code mono">404</p>
    <h1>页面不存在</h1>
    <p class="hint">你访问的页面不存在，或已被移动。</p>
    <router-link to="/" class="btn btn-primary">返回仪表盘</router-link>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  background: var(--color-bg);
}

.code {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary);
}

.hint {
  color: var(--color-ink-muted);
  margin: 0 0 16px;
}
</style>
