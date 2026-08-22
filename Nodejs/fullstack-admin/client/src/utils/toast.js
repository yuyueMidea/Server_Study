import { reactive } from 'vue';

let uid = 0;
export const toastState = reactive({ items: [] });

function push(type, message, duration = 3000) {
  const id = ++uid;
  toastState.items.push({ id, type, message });
  setTimeout(() => remove(id), duration);
}

function remove(id) {
  const index = toastState.items.findIndex((item) => item.id === id);
  if (index > -1) toastState.items.splice(index, 1);
}

export const toast = {
  success: (message) => push('success', message),
  error: (message) => push('error', message, 4000),
  remove,
};

export default toast;
