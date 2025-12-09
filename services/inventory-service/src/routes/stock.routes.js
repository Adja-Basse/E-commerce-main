const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const { authenticate, authorize } = require('../../../../shared/middleware/auth.middleware');
const { commonValidators, handleValidationErrors } = require('../../../../shared/middleware/validator');

// Public routes (read-only)
router.get('/product/:productId', stockController.getStock.bind(stockController));
router.get('/product/:productId/movements', stockController.getStockMovements.bind(stockController));
router.get('/low-stock', stockController.getLowStock.bind(stockController));

// Protected routes
router.post(
  '/add',
  authenticate,
  authorize('admin', 'seller'),
  [
    commonValidators.string('productId', { required: true }),
    commonValidators.number('quantity', { required: true, min: 1 }),
    handleValidationErrors
  ],
  stockController.addStock.bind(stockController)
);

router.post(
  '/remove',
  authenticate,
  authorize('admin', 'seller'),
  [
    commonValidators.string('productId', { required: true }),
    commonValidators.number('quantity', { required: true, min: 1 }),
    handleValidationErrors
  ],
  stockController.removeStock.bind(stockController)
);

router.post(
  '/reserve',
  authenticate,
  [
    commonValidators.string('productId', { required: true }),
    commonValidators.number('quantity', { required: true, min: 1 }),
    commonValidators.string('reference', { required: true }),
    handleValidationErrors
  ],
  stockController.reserveStock.bind(stockController)
);

router.post(
  '/release',
  authenticate,
  [
    commonValidators.string('productId', { required: true }),
    commonValidators.number('quantity', { required: true, min: 1 }),
    commonValidators.string('reference', { required: true }),
    handleValidationErrors
  ],
  stockController.releaseStock.bind(stockController)
);

router.post(
  '/adjust',
  authenticate,
  authorize('admin'),
  [
    commonValidators.string('productId', { required: true }),
    commonValidators.number('newQuantity', { required: true, min: 0 }),
    handleValidationErrors
  ],
  stockController.adjustStock.bind(stockController)
);

module.exports = router;

