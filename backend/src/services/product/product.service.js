import mongoose from 'mongoose';

import Category from '../../models/category.model.js';
import Product from '../../models/product.model.js';
import ApiError from '../../utils/ApiError.js';

const PRODUCT_STATUSES = new Set(['active', 'out_of_stock']);

function getTenantId(tenant) {
  const tenantId = tenant?.tenant_id;
  if (!tenantId || !mongoose.Types.ObjectId.isValid(String(tenantId))) {
    throw new ApiError(400, 'Invalid tenant context.');
  }
  return String(tenantId);
}

function normalizeOptions(options) {
  if (options === undefined) {
    return undefined;
  }

  if (!Array.isArray(options)) {
    throw new ApiError(400, 'options must be an array.');
  }

  return options.map((option, index) => {
    const name = String(option?.name || '').trim();
    const price = Number(option?.price);

    if (!name) {
      throw new ApiError(400, `options[${index}].name is required.`);
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new ApiError(400, `options[${index}].price must be a non-negative number.`);
    }

    return { name, price };
  });
}

async function ensureCategoryBelongsToTenant(categoryId, tenantId) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, 'Invalid category_id.');
  }

  const category = await Category.findOne({
    _id: categoryId,
    tenant_id: tenantId,
  }).select('_id');

  if (!category) {
    throw new ApiError(404, 'Category not found in this tenant.');
  }
}

async function createProduct(payload, tenant) {
  const tenantId = getTenantId(tenant);

  const {
    category_id,
    name,
    description = '',
    image = '',
    price,
    status = 'active',
    options,
  } = payload;

  if (!category_id || !name || price === undefined) {
    throw new ApiError(400, 'category_id, name, and price are required.');
  }

  const normalizedName = String(name).trim();
  if (!normalizedName) {
    throw new ApiError(400, 'name cannot be empty.');
  }

  const normalizedPrice = Number(price);
  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
    throw new ApiError(400, 'price must be a non-negative number.');
  }

  if (!PRODUCT_STATUSES.has(status)) {
    throw new ApiError(400, 'status must be either active or out_of_stock.');
  }

  await ensureCategoryBelongsToTenant(category_id, tenantId);

  const normalizedOptions = normalizeOptions(options);

  const product = await Product.create({
    tenant_id: tenantId,
    category_id,
    name: normalizedName,
    description: String(description || '').trim(),
    image: String(image || '').trim(),
    price: normalizedPrice,
    status,
    options: normalizedOptions || [],
  });

  return product;
}

async function listProducts(tenant) {
  const tenantId = getTenantId(tenant);

  return Product.find({ tenant_id: tenantId }).sort({ createdAt: -1 });
}

async function updateProduct(productId, payload, tenant) {
  const tenantId = getTenantId(tenant);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, 'Invalid productId.');
  }

  const updateData = {};

  if (payload.category_id !== undefined) {
    await ensureCategoryBelongsToTenant(payload.category_id, tenantId);
    updateData.category_id = payload.category_id;
  }

  if (payload.name !== undefined) {
    const normalizedName = String(payload.name).trim();
    if (!normalizedName) {
      throw new ApiError(400, 'name cannot be empty.');
    }
    updateData.name = normalizedName;
  }

  if (payload.description !== undefined) {
    updateData.description = String(payload.description || '').trim();
  }

  if (payload.image !== undefined) {
    updateData.image = String(payload.image || '').trim();
  }

  if (payload.price !== undefined) {
    const normalizedPrice = Number(payload.price);
    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      throw new ApiError(400, 'price must be a non-negative number.');
    }
    updateData.price = normalizedPrice;
  }

  if (payload.status !== undefined) {
    if (!PRODUCT_STATUSES.has(payload.status)) {
      throw new ApiError(400, 'status must be either active or out_of_stock.');
    }
    updateData.status = payload.status;
  }

  if (payload.options !== undefined) {
    updateData.options = normalizeOptions(payload.options);
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'No valid fields to update.');
  }

  const updated = await Product.findOneAndUpdate(
    { _id: productId, tenant_id: tenantId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new ApiError(404, 'Product not found.');
  }

  return updated;
}

async function deleteProduct(productId, tenant) {
  const tenantId = getTenantId(tenant);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, 'Invalid productId.');
  }

  const deleted = await Product.findOneAndDelete({
    _id: productId,
    tenant_id: tenantId,
  });

  if (!deleted) {
    throw new ApiError(404, 'Product not found.');
  }
}

export default {
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
};
