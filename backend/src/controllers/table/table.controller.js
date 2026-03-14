import asyncHandler from '../../utils/asyncHandler.js';
import tableService from '../../services/table/table.service.js';

const createTable = asyncHandler(async (req, res) => {
  const table = await tableService.createTable(req.body, req.tenant);
  res.status(201).json(table);
});

const listTables = asyncHandler(async (req, res) => {
  const tables = await tableService.listTables(req.tenant);
  res.status(200).json(tables);
});

const updateTable = asyncHandler(async (req, res) => {
  const table = await tableService.updateTable(req.params.tableId, req.body, req.tenant);
  res.status(200).json(table);
});

const deleteTable = asyncHandler(async (req, res) => {
  await tableService.deleteTable(req.params.tableId, req.tenant);
  res.status(204).send();
});

const resolveTableByNumber = asyncHandler(async (req, res) => {
  const result = await tableService.resolveTableByNumber(req.params.tableNumber, req.tenant);
  res.status(200).json(result);
});

export default {
  createTable,
  listTables,
  updateTable,
  deleteTable,
  resolveTableByNumber,
};
