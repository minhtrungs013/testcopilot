import Table from '../../models/table.model.js';
import ApiError from '../../utils/ApiError.js';
import mongoose from 'mongoose';

function getTenantContext(tenant) {
  const tenantId = tenant?.tenant_id;
  const tenantSlug = tenant?.slug;

  if (!tenantId || !tenantSlug) {
    throw new ApiError(400, 'Invalid tenant context.');
  }

  return {
    tenantId: String(tenantId),
    tenantSlug: String(tenantSlug),
  };
}

async function createTable(payload, tenant) {
  const { tenantId, tenantSlug } = getTenantContext(tenant);
  const tableNumber = Number(payload?.table_number);
  const status = String(payload?.status || 'available').trim();

  if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
    throw new ApiError(400, 'table_number must be a positive integer.');
  }

  const qrCode = payload?.qr_code
    ? String(payload.qr_code).trim()
    : `/${tenantSlug}/table/${tableNumber}`;

  try {
    return await Table.create({
      tenant_id: tenantId,
      table_number: tableNumber,
      qr_code: qrCode,
      status,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'table_number or qr_code already exists in this tenant.');
    }
    throw error;
  }
}

async function listTables(tenant) {
  const { tenantId } = getTenantContext(tenant);

  return Table.find({ tenant_id: tenantId }).sort({ table_number: 1 });
}

async function updateTable(tableId, payload, tenant) {
  const { tenantId } = getTenantContext(tenant);

  if (!mongoose.Types.ObjectId.isValid(tableId)) {
    throw new ApiError(400, 'Invalid tableId.');
  }

  const updateData = {};
  if (payload.table_number !== undefined) {
    const nextNumber = Number(payload.table_number);
    if (!Number.isInteger(nextNumber) || nextNumber <= 0) {
      throw new ApiError(400, 'table_number must be a positive integer.');
    }
    updateData.table_number = nextNumber;
  }

  if (payload.qr_code !== undefined) {
    const nextQr = String(payload.qr_code || '').trim();
    if (!nextQr) {
      throw new ApiError(400, 'qr_code cannot be empty.');
    }
    updateData.qr_code = nextQr;
  }

  if (payload.status !== undefined) {
    const nextStatus = String(payload.status || '').trim();
    if (!nextStatus) {
      throw new ApiError(400, 'status cannot be empty.');
    }
    updateData.status = nextStatus;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'No valid fields to update.');
  }

  try {
    const updated = await Table.findOneAndUpdate(
      { _id: tableId, tenant_id: tenantId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new ApiError(404, 'Table not found.');
    }

    return updated;
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'table_number or qr_code already exists in this tenant.');
    }
    throw error;
  }
}

async function deleteTable(tableId, tenant) {
  const { tenantId } = getTenantContext(tenant);

  if (!mongoose.Types.ObjectId.isValid(tableId)) {
    throw new ApiError(400, 'Invalid tableId.');
  }

  const deleted = await Table.findOneAndDelete({
    _id: tableId,
    tenant_id: tenantId,
  });

  if (!deleted) {
    throw new ApiError(404, 'Table not found.');
  }
}

async function resolveTableByNumber(tableNumber, tenant) {
  const parsedNumber = Number(tableNumber);
  if (!Number.isInteger(parsedNumber) || parsedNumber <= 0) {
    throw new ApiError(400, 'tableNumber must be a positive integer.');
  }

  const tenantId = tenant?.tenant_id;
  if (!tenantId) {
    throw new ApiError(400, 'Invalid tenant context.');
  }

  const table = await Table.findOne({
    tenant_id: tenantId,
    table_number: parsedNumber,
  }).select('_id table_number qr_code status');

  if (!table) {
    throw new ApiError(404, 'Table not found.');
  }

  return {
    table_id: String(table._id),
    table_number: table.table_number,
    qr_code: table.qr_code,
    status: table.status,
  };
}

export default {
  createTable,
  listTables,
  updateTable,
  deleteTable,
  resolveTableByNumber,
};
