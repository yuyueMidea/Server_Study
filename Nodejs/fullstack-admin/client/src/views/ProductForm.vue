<template>
  <div class="form-page">
    <LoadingState v-if="loadingDetail" text="正在加载产品信息..." />
    <ErrorState v-else-if="loadError" :message="loadError" @retry="loadDetail" />
    <form v-else class="card form-card" @submit.prevent="onSubmit">
      <div class="grid">
        <div class="field" :class="{ 'has-error': errors.name }">
          <label for="name">产品名称 *</label>
          <input id="name" v-model="form.name" type="text" placeholder="例如：机械键盘 K1" maxlength="100" />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="field" :class="{ 'has-error': errors.category }">
          <label for="category">分类 *</label>
          <input id="category" v-model="form.category" list="category-options" placeholder="例如：外设" />
          <datalist id="category-options">
            <option v-for="cat in categories" :key="cat" :value="cat" />
          </datalist>
          <span v-if="errors.category" class="field-error">{{ errors.category }}</span>
        </div>

        <div class="field" :class="{ 'has-error': errors.price }">
          <label for="price">价格（¥）*</label>
          <input id="price" v-model.number="form.price" type="number" min="0" step="0.01" />
          <span v-if="errors.price" class="field-error">{{ errors.price }}</span>
        </div>

        <div class="field" :class="{ 'has-error': errors.stock }">
          <label for="stock">库存数量 *</label>
          <input id="stock" v-model.number="form.stock" type="number" min="0" step="1" />
          <span v-if="errors.stock" class="field-error">{{ errors.stock }}</span>
        </div>

        <div class="field">
          <label for="status">状态</label>
          <select id="status" v-model="form.status">
            <option value="active">在售</option>
            <option value="inactive">已下架</option>
          </select>
        </div>
      </div>

      <div class="field" :class="{ 'has-error': errors.description }">
        <label for="description">描述</label>
        <textarea
          id="description"
          v-model="form.description"
          maxlength="500"
          placeholder="产品的规格、卖点等补充说明（选填）"
        ></textarea>
        <span v-if="errors.description" class="field-error">{{ errors.description }}</span>
      </div>

      <div class="actions">
        <router-link :to="{ name: 'product-list' }" class="btn btn-ghost">取消</router-link>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? '保存中...' : isEdit ? '保存修改' : '创建产品' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchProduct, createProduct, updateProduct, fetchCategories } from '@/api/product';
import { validateProductForm, hasErrors } from '@/utils/validators';
import LoadingState from '@/components/LoadingState.vue';
import ErrorState from '@/components/ErrorState.vue';
import { toast } from '@/utils/toast';

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => Boolean(route.params.id));
const productId = computed(() => Number(route.params.id));

const form = reactive({
  name: '',
  category: '',
  price: null,
  stock: null,
  status: 'active',
  description: '',
});

const errors = reactive({});
const categories = ref([]);
const loadingDetail = ref(false);
const loadError = ref('');
const submitting = ref(false);

async function loadDetail() {
  if (!isEdit.value) return;
  loadingDetail.value = true;
  loadError.value = '';
  try {
    const product = await fetchProduct(productId.value);
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

async function loadCategories() {
  try {
    categories.value = await fetchCategories();
  } catch {
    // 分类建议加载失败不阻断表单使用
  }
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
      await updateProduct(productId.value, payload);
      toast.success('产品信息已更新');
    } else {
      await createProduct(payload);
      toast.success('产品创建成功');
    }
    router.push({ name: 'product-list' });
  } catch (err) {
    if (err.errors) {
      Object.assign(errors, err.errors);
    }
    toast.error(err.message || '保存失败，请重试');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadDetail();
  loadCategories();
});
</script>

<style scoped>
.form-page {
  max-width: 720px;
}

.form-card {
  padding: 28px;
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

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
</style>
