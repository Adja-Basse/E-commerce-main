const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../../../../shared/middleware/auth.middleware');
const { commonValidators, handleValidationErrors } = require('../../../../shared/middleware/validator');

router.use(authenticate);

router.post(
  '/',
  [
    handleValidationErrors
  ],
  orderController.createOrder.bind(orderController)
);

router.get('/', orderController.getMyOrders.bind(orderController));
router.get('/:id', orderController.getOrder.bind(orderController));

module.exports = router;
