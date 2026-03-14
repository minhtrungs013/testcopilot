import mongoose from 'mongoose';

import Category from '../../models/category.model.js';
import ApiError from '../../utils/ApiError.js';

function getTenantId(tenant) {
  const tenantId = tenant?.tenant_id;
  if (!tenantId || !mongoose.Types.ObjectId.isValid(String(tenantId))) {
    throw new ApiError(400, 'Invalid tenant context.');
  }
  return String(tenantId);
}

async function createCategory(payload, tenant) {
  const tenantId = getTenantId(tenant);
  const { name, sort_order = 0 } = payload;

  if (!name || !String(name).trim()) {
    throw new ApiError(400, 'Category name is required.');
  }

  try {
    const category = await Category.create({
      tenant_id: tenantId,
      name: String(name).trim(),
      sort_order: Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0,
    });

    return category;
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'Category name already exists in this tenant.');
    }
    throw error;
  }
}

async function listCategories(tenant) {
  const tenantId = getTenantId(tenant);

  return Category.find({ tenant_id: tenantId }).sort({ sort_order: 1, createdAt: 1 });
}

async function updateCategory(categoryId, payload, tenant) {
  const tenantId = getTenantId(tenant);

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, 'Invalid categoryId.');
  }

  const updateData = {};

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();
    if (!name) {
      throw new ApiError(400, 'Category name cannot be empty.');
    }
    updateData.name = name;
  }

  if (payload.sort_order !== undefined) {
    const sortOrder = Number(payload.sort_order);
    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      throw new ApiError(400, 'sort_order must be a non-negative number.');
    }
    updateData.sort_order = sortOrder;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'No valid fields to update.');
  }

  try {
    const updated = await Category.findOneAndUpdate(
      { _id: categoryId, tenant_id: tenantId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new ApiError(404, 'Category not found.');
    }

    return updated;
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'Category name already exists in this tenant.');
    }
    throw error;
  }
}

async function deleteCategory(categoryId, tenant) {
  const tenantId = getTenantId(tenant);

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, 'Invalid categoryId.');
  }

  const deleted = await Category.findOneAndDelete({
    _id: categoryId,
    tenant_id: tenantId,
  });

  if (!deleted) {
    throw new ApiError(404, 'Category not found.');
  }
}

export default {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
};
