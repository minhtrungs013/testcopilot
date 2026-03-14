import Table from '../../models/table.model.js';
import ApiError from '../../utils/ApiError.js';

async function createTable(_payload, _tenant) {
  throw new Error('createTable is not implemented yet');
}

async function listTables(_tenant) {
  throw new Error('listTables is not implemented yet');
}

async function updateTable(_tableId, _payload, _tenant) {
  throw new Error('updateTable is not implemented yet');
}

async function deleteTable(_tableId, _tenant) {
  throw new Error('deleteTable is not implemented yet');
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
