<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">◈</span>
        <span class="brand-name">库管台</span>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <span class="dot" aria-hidden="true"></span>仪表盘
        </router-link>
        <router-link to="/products" class="nav-item" active-class="active">
          <span class="dot" aria-hidden="true"></span>产品列表
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <p>Vue 3 · Fastify · SQLite3</p>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <h1>{{ pageTitle }}</h1>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
    <ToastStack />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ToastStack from '@/components/ToastStack.vue';

const route = useRoute();
const pageTitle = computed(() => route.meta?.title || '产品库存管理后台');
</script>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-primary-strong);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 24px;
}

.brand-mark {
  color: var(--color-accent);
  font-size: 20px;
}

.brand-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 17px;
  letter-spacing: 0.02em;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-item .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-item.active {
  background: rgba(242, 169, 59, 0.16);
  color: var(--color-accent);
}
.nav-item.active .dot {
  background: var(--color-accent);
  opacity: 1;
}

.sidebar-footer {
  margin-top: auto;
  padding: 10px;
  font-size: 11px;
  font-family: var(--font-mono);
  color: rgba(255, 255, 255, 0.4);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 28px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.topbar h1 {
  font-size: 18px;
}

.content {
  flex: 1;
  padding: 24px 28px 40px;
}

@media (max-width: 720px) {
  .shell {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding: 10px 14px;
  }
  .brand {
    padding: 0 12px 0 0;
  }
  .nav {
    flex-direction: row;
  }
  .sidebar-footer {
    display: none;
  }
  .content {
    padding: 18px;
  }
}
</style>
