<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="onCancel">
      <div class="dialog card" role="dialog" aria-modal="true">
        <header class="dialog-header">
          <h3>{{ type === 'in' ? '登记入库' : '登记出库' }}</h3>
          <button class="close-btn" aria-label="关闭" @click="onCancel">×</button>
        </header>

        <div class="dialog-body">
          <div v-if="product" class="product-brief">
            <p class="name">{{ product.name }}</p>
            <p class="meta">
              {{ product.category }} · 当前库存
              <b class="mono">{{ product.stock }}</b>
            </p>
          </div>

          <form id="stock-record-form" @submit.prevent="onSubmit">
            <div class="field">
              <label>类型</label>
              <div class="type-toggle">
                <button
                  type="button"
                  class="toggle-btn"
                  :class="{ active: form.type === 'in' }"
                  @click="form.type = 'in'"
                >
                  入库
                </button>
                <button
                  type="button"
                  class="toggle-btn"
                  :class="{ active: form.type === 'out' }"
                  @click="form.type = 'out'"
                >
                  出库
                </button>
              </div>
            </div>

            <div class="field" :class="{ 'has-error': errors.quantity }">
              <label for="sr-quantity">数量 *</label>
              <input id="sr-quantity" v-model.number="form.quantity" type="number" min="1" step="1" />
              <span v-if="errors.quantity" class="field-error">{{ errors.quantity }}</span>
            </div>

            <div class="field">
              <label for="sr-reason">原因</label>
              <select id="sr-reason" v-model="form.reason">
                <option v-for="item in currentReasons" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>

            <div class="field">
              <label for="sr-note">备注</label>
              <textarea id="sr-note" v-model="form.note" maxlength="300" placeholder="选填"></textarea>
            </div>
          </form>
        </div>

        <footer class="dialog-footer">
          <button type="button" class="btn btn-ghost" @click="onCancel">取消</button>
          <button type="submit" form="stock-record-form" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : '确认' }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { createStockRecord, fetchStockReasons } from '@/api/stockRecord';
import { toast } from '@/utils/toast';

const props = defineProps({
  open: { type: Boolean, default: false },
  product: { type: Object, default: null },
  type: { type: String, default: 'in' }, // 'in' | 'out'，作为打开弹框时的默认类型
});
const emit = defineEmits(['close', 'saved']);

const form = reactive({ type: 'in', quantity: 1, reason: '', note: '' });
const errors = reactive({});
const submitting = ref(false);
const reasons = ref({ in: [], out: [] });

const currentReasons = computed(() => (form.type === 'in' ? reasons.value.in : reasons.value.out));

watch(
  () => currentReasons.value,
  (list) => {
    if (list.length && !list.includes(form.reason)) form.reason = list[0];
  }
);

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    Object.assign(form, { type: props.type, quantity: 1, note: '' });
    Object.keys(errors).forEach((key) => delete errors[key]);
    submitting.value = false;
    if (!reasons.value.in.length && !reasons.value.out.length) {
      try {
        reasons.value = await fetchStockReasons();
      } catch {
        reasons.value = {
          in: ['采购入库', '退货入库', '盘盈入库', '其他入库'],
          out: ['销售出库', '报损出库', '盘亏出库', '其他出库'],
        };
      }
    }
    form.reason = currentReasons.value[0] || '';
  }
);

function onCancel() {
  if (submitting.value) return;
  emit('close');
}

async function onSubmit() {
  Object.keys(errors).forEach((key) => delete errors[key]);

  if (!Number.isInteger(form.quantity) || form.quantity <= 0) {
    errors.quantity = '数量必须为大于 0 的整数';
    return;
  }
  if (form.type === 'out' && props.product && form.quantity > props.product.stock) {
    errors.quantity = `库存不足，当前可用库存 ${props.product.stock}`;
    return;
  }

  submitting.value = true;
  try {
    await createStockRecord({
      productId: props.product.id,
      type: form.type,
      quantity: form.quantity,
      reason: form.reason,
      note: form.note?.trim() || '',
    });
    toast.success(form.type === 'in' ? '入库登记成功' : '出库登记成功');
    emit('saved');
  } catch (err) {
    if (err.errors) Object.assign(errors, err.errors);
    toast.error(err.message || '提交失败，请重试');
  } finally {
    submitting.value = false;
  }
}
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
  padding: 20px;
}

.dialog {
  width: 100%;
  max-width: 420px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.dialog-header h3 {
  font-size: 16px;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: var(--color-ink-muted);
  cursor: pointer;
  padding: 4px;
}
.close-btn:hover {
  color: var(--color-ink);
}

.dialog-body {
  padding: 20px 24px 4px;
  overflow-y: auto;
}

.product-brief {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin-bottom: 18px;
}
.product-brief .name {
  margin: 0;
  font-weight: 600;
}
.product-brief .meta {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--color-ink-muted);
}

.type-toggle {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-ink-muted);
}
.toggle-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}
</style>
