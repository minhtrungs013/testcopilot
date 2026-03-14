import asyncHandler from '../../utils/asyncHandler.js';
import categoryService from '../../services/category/category.service.js';

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.tenant);
  res.status(201).json(category);
});

const listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.tenant);
  res.status(200).json(categories);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.categoryId, req.body, req.tenant);
  res.status(200).json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.categoryId, req.tenant);
  res.status(204).send();
});

export default {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
};
