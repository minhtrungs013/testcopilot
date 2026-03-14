import asyncHandler from '../../utils/asyncHandler.js';
import productService from '../../services/product/product.service.js';

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.tenant);
  res.status(201).json(product);
});

const listProducts = asyncHandler(async (req, res) => {
  const products = await productService.listProducts(req.tenant);
  res.status(200).json(products);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.productId, req.body, req.tenant);
  res.status(200).json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.productId, req.tenant);
  res.status(204).send();
});

export default {
  createProduct,
  listProducts,
  updateProduct,
  deleteProduct,
};
