<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="onCancel">
      <div class="dialog card" role="dialog" aria-modal="true">
        <header class="dialog-header">
          <h3>{{ isEdit ? '编辑产品' : '新增产品' }}</h3>
          <button class="close-btn" aria-label="关闭" @click="onCancel">×</button>
        </header>

        <div class="dialog-body">
          <LoadingState v-if="loadingDetail" text="正在加载产品信息..." />
          <ErrorState v-else-if="loadError" :message="loadError" @retry="loadDetail" />
          <form v-else id="product-form" @submit.prevent="onSubmit">
            <div class="grid">
              <div class="field" :class="{ 'has-error': errors.name }">
                <label for="pf-name">产品名称 *</label>
                <input id="pf-name" v-model="form.name" type="text" placeholder="例如：机械键盘 K1" maxlength="100" />
                <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
              </div>

              <div class="field" :class="{ 'has-error': errors.category }">
                <label for="pf-category">分类 *</label>
                <input id="pf-category" v-model="form.category" list="pf-category-options" placeholder="例如：外设" />
                <datalist id="pf-category-options">
                  <option v-for="cat in categories" :key="cat" :value="cat" />
                </datalist>
                <span v-if="errors.category" class="field-error">{{ errors.category }}</span>
              </div>

              <div class="field" :class="{ 'has-error': errors.price }">
                <label for="pf-price">价格（¥）*</label>
                <input id="pf-price" v-model.number="form.price" type="number" min="0" step="0.01" />
                <span v-if="errors.price" class="field-error">{{ errors.price }}</span>
              </div>

              <div class="field" :class="{ 'has-error': errors.stock }">
                <label for="pf-stock">库存数量 *</label>
                <input
                  id="pf-stock"
                  v-model.number="form.stock"
                  type="number"
                  min="0"
                  step="1"
                  :disabled="isEdit"
                />
                <span v-if="errors.stock" class="field-error">{{ errors.stock }}</span>
                <span v-if="isEdit" class="field-hint">库存请通过「进销存 → 入库/出库」调整</span>
              </div>

              <div class="field">
                <label for="pf-status">状态</label>
                <select id="pf-status" v-model="form.status">
                  <option value="active">在售</option>
                  <option value="inactive">已下架</option>
                </select>
              </div>
            </div>

            <div class="field" :class="{ 'has-error': errors.description }">
              <label for="pf-description">描述</label>
              <textarea
                id="pf-description"
                v-model="form.description"
                maxlength="500"
                placeholder="产品的规格、卖点等补充说明（选填）"
              ></textarea>
              <span v-if="errors.description" class="field-error">{{ errors.description }}</span>
            </div>
          </form>
        </div>

        <footer class="dialog-footer">
          <button type="button" class="btn btn-ghost" @click="onCancel">取消</button>
          <button
            type="submit"
            form="product-form"
            class="btn btn-primary"
            :disabled="submitting || loadingDetail || !!loadError"
          >
            {{ submitting ? '保存中...' : isEdit ? '保存修改' : '创建产品' }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue';
import { fetchProduct, createProduct, updateProduct, fetchCategories } from '@/api/product';
import { validateProductForm, hasErrors } from '@/utils/validators';
import LoadingState from '@/components/LoadingState.vue';
import ErrorState from '@/components/ErrorState.vue';
import { toast } from '@/utils/toast';

const props = defineProps({
  open: { type: Boolean, default: false },
  // 传入产品 id 表示编辑模式；为 null/undefined 表示新增模式
  productId: { type: [Number, String, null], default: null },
});
const emit = defineEmits(['close', 'saved']);

const isEdit = computed(() => props.productId !== null && props.productId !== undefined);

const defaultForm = () => ({
  name: '',
  category: '',
  price: null,
  stock: 0,
  status: 'active',
  description: '',
});

const form = reactive(defaultForm());
const errors = reactive({});
const categories = ref([]);
const loadingDetail = ref(false);
const loadError = ref('');
const submitting = ref(false);

async function loadCategories() {
  try {
    categories.value = await fetchCategories();
  } catch {
    // 分类建议加载失败不阻断表单使用
  }
}

async function loadDetail() {
  if (!isEdit.value) return;
  loadingDetail.value = true;
  loadError.value = '';
  try {
    const product = await fetchProduct(props.productId);
    Object.assign(form, {
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      description: product.description || '',
    });
  } catch (err) {
    loadError.value = err.message;
  } finally {
    loadingDetail.value = false;
  }
}

function resetState() {
  Object.assign(form, defaultForm());
  Object.keys(errors).forEach((key) => delete errors[key]);
  loadError.value = '';
  submitting.value = false;
}

// 每次打开弹框时重新初始化：新增模式重置为空表单，编辑模式拉取详情
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetState();
      loadCategories();
      loadDetail();
    }
  }
);

function onCancel() {
  if (submitting.value) return;
  emit('close');
}

async function onSubmit() {
  Object.keys(errors).forEach((key) => delete errors[key]);
  const validationErrors = validateProductForm(form);
  Object.assign(errors, validationErrors);
  if (hasErrors(validationErrors)) return;

  submitting.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      status: form.status,
      description: form.description?.trim() || '',
    };

    if (isEdit.value) {
      await updateProduct(props.productId, payload);
      toast.success('产品信息已更新');
    } else {
      await createProduct(payload);
      toast.success('产品创建成功');
    }
    emit('saved');
  } catch (err) {
    if (err.errors) Object.assign(errors, err.errors);
    toast.error(err.message || '保存失败，请重试');
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
  max-width: 640px;
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
  padding: 22px 24px 4px;
  overflow-y: auto;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 20px;
}

@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.field-hint {
  font-size: 12px;
  color: var(--color-ink-muted);
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
