import asyncHandler from '../../utils/asyncHandler.js';
import authService from '../../services/auth/auth.service.js';

const registerTenantOwner = asyncHandler(async (req, res) => {
  const result = await authService.registerTenantOwner(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

export default {
  registerTenantOwner,
  login,
};
