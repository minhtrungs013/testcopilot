import asyncHandler from '../../utils/asyncHandler.js';
import menuService from '../../services/menu/menu.service.js';

const getMenu = asyncHandler(async (req, res) => {
  const menu = await menuService.getMenuByTenant(req.tenant);
  res.status(200).json(menu);
});

export default {
  getMenu,
};
