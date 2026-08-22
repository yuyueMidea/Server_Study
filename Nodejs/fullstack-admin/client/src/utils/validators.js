/**
 * 轻量表单校验工具：无第三方依赖，返回 { field: message } 形式的错误集合。
 */
export function validateProductForm(form) {
  const errors = {};

  if (!form.name || !form.name.trim()) {
    errors.name = '请输入产品名称';
  } else if (form.name.trim().length > 100) {
    errors.name = '产品名称不能超过 100 个字符';
  }

  if (!form.category || !form.category.trim()) {
    errors.category = '请输入或选择分类';
  }

  if (form.price === null || form.price === '' || form.price === undefined) {
    errors.price = '请输入价格';
  } else if (Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
    errors.price = '价格必须为不小于 0 的数字';
  }

  if (form.stock === null || form.stock === '' || form.stock === undefined) {
    errors.stock = '请输入库存数量';
  } else if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
    errors.stock = '库存必须为不小于 0 的整数';
  }

  if (form.description && form.description.length > 500) {
    errors.description = '描述不能超过 500 个字符';
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
