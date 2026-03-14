import mongoose from 'mongoose';

import Category from '../../models/category.model.js';
import Product from '../../models/product.model.js';
import ApiError from '../../utils/ApiError.js';

function getTenantId(tenant) {
  const tenantId = tenant?.tenant_id;
  if (!tenantId || !mongoose.Types.ObjectId.isValid(String(tenantId))) {
    throw new ApiError(400, 'Invalid tenant context.');
  }
  return String(tenantId);
}

async function getMenuByTenant(tenant) {
  const tenantId = getTenantId(tenant);

  const [categories, products] = await Promise.all([
    Category.find({ tenant_id: tenantId })
      .select('_id name sort_order')
      .sort({ sort_order: 1, createdAt: 1 })
      .lean(),
    Product.find({ tenant_id: tenantId, status: 'active' })
      .select('_id category_id name description image price options')
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const productsByCategory = new Map();
  for (const product of products) {
    const categoryKey = String(product.category_id);
    const current = productsByCategory.get(categoryKey) || [];
    current.push({
      id: String(product._id),
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      options: (product.options || []).map((option) => ({
        name: option.name,
        price: option.price,
      })),
    });
    productsByCategory.set(categoryKey, current);
  }

  const groupedCategories = categories
    .map((category) => {
      const categoryProducts = productsByCategory.get(String(category._id)) || [];
      return {
        id: String(category._id),
        name: category.name,
        sort_order: category.sort_order,
        products: categoryProducts,
      };
    })
    .filter((category) => category.products.length > 0);

  return {
    tenant: {
      id: tenantId,
      slug: tenant.slug,
      name: tenant.name,
    },
    categories: groupedCategories,
    meta: {
      total_categories: groupedCategories.length,
      total_products: products.length,
      generated_at: new Date().toISOString(),
    },
  };
}

export default {
  getMenuByTenant,
};