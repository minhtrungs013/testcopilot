import asyncHandler from '../../utils/asyncHandler.js';
import userService from '../../services/user/user.service.js';

const createStaffAccount = asyncHandler(async (req, res) => {
  const user = await userService.createStaffAccount(req.body, req.tenant);
  res.status(201).json(user);
});

const listStaffAccounts = asyncHandler(async (req, res) => {
  const users = await userService.listStaffAccounts(req.tenant);
  res.status(200).json(users);
});

const updateStaffStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateStaffStatus(req.params.userId, req.body.status, req.tenant);
  res.status(200).json(user);
});

export default {
  createStaffAccount,
  listStaffAccounts,
  updateStaffStatus,
};
