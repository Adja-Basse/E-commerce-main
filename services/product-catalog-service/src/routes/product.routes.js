const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../../../../shared/middleware/auth.middleware');
const { commonValidators, handleValidationErrors, paginationValidators } = require('../../../../shared/middleware/validator');

// Public routes
router.get('/', paginationValidators, handleValidationErrors, productController.getProducts.bind(productController));
router.get('/featured', productController.getFeaturedProducts.bind(productController));
router.get('/slug/:slug', productController.getProductBySlug.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));

// Protected routes (admin/seller)
router.post(
  '/',
  authenticate,
  authorize('admin', 'seller'),
  [
    commonValidators.string('name', { required: true }),
    commonValidators.string('description', { required: true }),
    commonValidators.string('sku', { required: true }),
    commonValidators.number('price', { required: true, min: 0 }),
    commonValidators.mongoId('category'),
    handleValidationErrors
  ],
  productController.createProduct.bind(productController)
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'seller'),
  productController.updateProduct.bind(productController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  productController.deleteProduct.bind(productController)
);

module.exports = router;

