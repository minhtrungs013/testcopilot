import asyncHandler from '../../utils/asyncHandler.js';
import orderService from '../../services/order/order.service.js';
import { emitToTenant } from '../../sockets/gateway.js';

const DUPLICATE_WINDOW_MS = 12000;
const recentSubmissions = new Map();
const inFlightSubmissions = new Set();

function normalizeItems(items = []) {
  return items.map((item) => ({
    product_id: String(item.product_id || ''),
    quantity: Number(item.quantity || 0),
    note: String(item.note || '').trim(),
    selected_options: Array.isArray(item.selected_options)
      ? item.selected_options.map((option) =>
          typeof option === 'string' ? option.trim() : String(option?.name || '').trim()
        )
      : [],
  }));
}

function createSubmissionKey(tenantId, body) {
  const payload = {
    tenant_id: String(tenantId),
    table_id: String(body?.table_id || ''),
    items: normalizeItems(body?.items || []),
  };
  return JSON.stringify(payload);
}

function cleanupExpiredSubmissions() {
  const threshold = Date.now() - DUPLICATE_WINDOW_MS;
  for (const [key, value] of recentSubmissions.entries()) {
    if (value.createdAt < threshold) {
      recentSubmissions.delete(key);
    }
  }
}

const createOrder = asyncHandler(async (req, res) => {
  cleanupExpiredSubmissions();

  const tenantId = String(req.tenant?.tenant_id || '');
  const submissionKey = createSubmissionKey(tenantId, req.body);

  const recent = recentSubmissions.get(submissionKey);
  if (recent) {
    return res.status(200).json({
      ...recent.order,
      duplicate_submit_blocked: true,
    });
  }

  if (inFlightSubmissions.has(submissionKey)) {
    return res.status(409).json({
      message: 'Duplicate submission in progress.',
    });
  }

  inFlightSubmissions.add(submissionKey);

  try {
    const order = await orderService.createOrder(req.body, req.tenant);

    recentSubmissions.set(submissionKey, {
      createdAt: Date.now(),
      order: order.toObject(),
    });

    emitToTenant(tenantId, 'new-order', {
      order_id: String(order._id),
      order_code: order.order_code,
      table_id: String(order.table_id),
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.createdAt,
    });

    res.status(201).json(order);
  } finally {
    inFlightSubmissions.delete(submissionKey);
  }
});

const listPendingOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.listPendingOrders(req.tenant);
  res.status(200).json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.orderId, req.body.status, req.tenant);

  emitToTenant(String(req.tenant?.tenant_id || ''), 'update-order-status', {
    order_id: String(order._id),
    order_code: order.order_code,
    table_id: String(order.table_id),
    status: order.status,
    updated_at: order.updatedAt,
  });

  res.status(200).json(order);
});

export default {
  createOrder,
  listPendingOrders,
  updateOrderStatus,
};
