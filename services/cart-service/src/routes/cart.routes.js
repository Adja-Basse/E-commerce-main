const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../../../../shared/middleware/auth.middleware');
const { commonValidators, handleValidationErrors } = require('../../../../shared/middleware/validator');

// All routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart.bind(cartController));

router.post(
  '/items',
  [
    commonValidators.string('productId', { required: true }),
    commonValidators.number('quantity', { required: true, min: 1 }),
    commonValidators.number('price', { required: true, min: 0 }),
    handleValidationErrors
  ],
  cartController.addItem.bind(cartController)
);

router.put(
  '/items/:productId',
  [
    commonValidators.number('quantity', { required: true, min: 0 }),
    handleValidationErrors
  ],
  cartController.updateItem.bind(cartController)
);

router.delete('/items/:productId', cartController.removeItem.bind(cartController));

router.delete('/', cartController.clearCart.bind(cartController));

module.exports = router;
