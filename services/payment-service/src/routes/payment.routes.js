const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../../../../shared/middleware/auth.middleware');
const { commonValidators, handleValidationErrors } = require('../../../../shared/middleware/validator');

router.use(authenticate);

router.post(
  '/process',
  [
    commonValidators.string('orderId', { required: true }),
    commonValidators.number('amount', { required: true, min: 0.1 }),
    commonValidators.string('paymentMethod', { required: true }),
    handleValidationErrors
  ],
  paymentController.processPayment.bind(paymentController)
);

router.get('/history', paymentController.getTransactions.bind(paymentController));

module.exports = router;
