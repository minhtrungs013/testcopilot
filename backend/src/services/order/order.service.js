import mongoose from 'mongoose';

import Order from '../../models/order.model.js';
import Product from '../../models/product.model.js';
import Table from '../../models/table.model.js';
import ApiError from '../../utils/ApiError.js';

const ORDER_STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'served', 'paid'];

function getTenantId(tenant) {
  const tenantId = tenant?.tenant_id;
  if (!tenantId || !mongoose.Types.ObjectId.isValid(String(tenantId))) {
    throw new ApiError(400, 'Invalid tenant context.');
  }
  return String(tenantId);
}

async function generateOrderCode(tenantId) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = `OD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const exists = await Order.exists({ tenant_id: tenantId, order_code: code });
    if (!exists) {
      return code;
    }
  }

  throw new ApiError(500, 'Could not generate unique order code.');
}

function normalizeSelectedOptions(selectedOptions, productOptions, itemIndex) {
  if (selectedOptions === undefined || selectedOptions === null) {
    return [];
  }

  if (!Array.isArray(selectedOptions)) {
    throw new ApiError(400, `items[${itemIndex}].selected_options must be an array.`);
  }

  const normalized = [];

  for (let optionIndex = 0; optionIndex < selectedOptions.length; optionIndex += 1) {
    const selected = selectedOptions[optionIndex];
    const selectedName =
      typeof selected === 'string' ? selected.trim() : String(selected?.name || '').trim();

    if (!selectedName) {
      throw new ApiError(400, `items[${itemIndex}].selected_options[${optionIndex}] is invalid.`);
    }

    const matchedOption = productOptions.find((option) => option.name === selectedName);
    if (!matchedOption) {
      throw new ApiError(400, `Option ${selectedName} is not available for product in items[${itemIndex}].`);
    }

    normalized.push({
      name: matchedOption.name,
      price: matchedOption.price,
    });
  }

  return normalized;
}

async function createOrder(payload, tenant) {
  const tenantId = getTenantId(tenant);
  const { table_id, items, note = '' } = payload;

  if (!table_id || !mongoose.Types.ObjectId.isValid(table_id)) {
    throw new ApiError(400, 'Valid table_id is required.');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'items must be a non-empty array.');
  }

  const table = await Table.findOne({ _id: table_id, tenant_id: tenantId }).select('_id');
  if (!table) {
    throw new ApiError(404, 'Table not found in this tenant.');
  }

  const productIds = [...new Set(items.map((item) => String(item.product_id || '')))].filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );

  if (productIds.length !== items.length) {
    throw new ApiError(400, 'Each item must include a valid product_id.');
  }

  const products = await Product.find({
    _id: { $in: productIds },
    tenant_id: tenantId,
  }).select('_id name price status options');

  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const orderItems = [];
  let totalAmount = 0;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const productId = String(item.product_id);
    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, `items[${index}].quantity must be a positive integer.`);
    }

    const product = productMap.get(productId);
    if (!product) {
      throw new ApiError(404, `Product not found in this tenant for items[${index}].`);
    }

    if (product.status !== 'active') {
      throw new ApiError(400, `Product ${product.name} is out of stock.`);
    }

    const selectedOptions = normalizeSelectedOptions(item.selected_options, product.options || [], index);
    const optionTotal = selectedOptions.reduce((sum, option) => sum + option.price, 0);
    const unitPrice = product.price + optionTotal;

    orderItems.push({
      product_id: product._id,
      product_name: product.name,
      quantity,
      price: unitPrice,
      note: String(item.note || '').trim(),
      selected_options: selectedOptions,
    });

    totalAmount += unitPrice * quantity;
  }

  const order = await Order.create({
    tenant_id: tenantId,
    table_id,
    order_code: await generateOrderCode(tenantId),
    status: 'pending',
    total_amount: totalAmount,
    items: orderItems,
    note: String(note || '').trim(),
  });

  return order;
}

async function listPendingOrders(tenant) {
  const tenantId = getTenantId(tenant);

  const orders = await Order.find({
    tenant_id: tenantId,
    status: { $in: ['pending', 'confirmed', 'preparing', 'served'] },
  })
    .sort({ createdAt: -1 })
    .populate('table_id', 'table_number')
    .lean();

  const groupedMap = new Map();

  for (const order of orders) {
    const tableId = order.table_id?._id ? String(order.table_id._id) : String(order.table_id || 'unknown');
    const tableNumber = order.table_id?.table_number ?? null;
    const group = groupedMap.get(tableId) || {
      table_id: tableId,
      table_number: tableNumber,
      latest_order_at: order.createdAt,
      orders: [],
    };

    group.orders.push(order);

    if (new Date(order.createdAt).getTime() > new Date(group.latest_order_at).getTime()) {
      group.latest_order_at = order.createdAt;
    }

    groupedMap.set(tableId, group);
  }

  return Array.from(groupedMap.values()).sort(
    (a, b) => new Date(b.latest_order_at).getTime() - new Date(a.latest_order_at).getTime()
  );
}

async function updateOrderStatus(orderId, status, tenant) {
  const tenantId = getTenantId(tenant);

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, 'Invalid orderId.');
  }

  if (!ORDER_STATUS_FLOW.includes(status)) {
    throw new ApiError(400, 'Invalid order status.');
  }

  const currentOrder = await Order.findOne({ _id: orderId, tenant_id: tenantId }).select('status');

  if (!currentOrder) {
    throw new ApiError(404, 'Order not found.');
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentOrder.status);
  const nextIndex = ORDER_STATUS_FLOW.indexOf(status);

  if (currentIndex === -1 || nextIndex === -1) {
    throw new ApiError(400, 'Invalid order status transition.');
  }

  if (nextIndex !== currentIndex + 1) {
    throw new ApiError(
      400,
      `Invalid status transition. Allowed next status is ${ORDER_STATUS_FLOW[currentIndex + 1] || 'none'}.`
    );
  }

  const updated = await Order.findOneAndUpdate(
    { _id: orderId, tenant_id: tenantId, status: currentOrder.status },
    { status },
    { new: true }
  );

  if (!updated) {
    throw new ApiError(409, 'Order status changed by another user. Please refresh and try again.');
  }

  return updated;
}

async function getOwnerOrderStats(tenant) {
  const tenantId = getTenantId(tenant);

  const [totalOrders, paidOrders, activeOrders, revenueData] = await Promise.all([
    Order.countDocuments({ tenant_id: tenantId }),
    Order.countDocuments({ tenant_id: tenantId, status: 'paid' }),
    Order.countDocuments({
      tenant_id: tenantId,
      status: { $in: ['pending', 'confirmed', 'preparing', 'served'] },
    }),
    Order.aggregate([
      {
        $match: {
          tenant_id: new mongoose.Types.ObjectId(tenantId),
          status: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total_revenue: { $sum: '$total_amount' },
        },
      },
    ]),
  ]);

  return {
    total_orders: totalOrders,
    paid_orders: paidOrders,
    active_orders: activeOrders,
    total_revenue: revenueData[0]?.total_revenue || 0,
  };
}

export default {
  createOrder,
  listPendingOrders,
  updateOrderStatus,
  getOwnerOrderStats,
};
