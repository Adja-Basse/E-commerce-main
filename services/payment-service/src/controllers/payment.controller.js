const paymentService = require('../services/payment.service');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const logger = require('../../../../shared/utils/logger');

class PaymentController {
  async processPayment(req, res, next) {
    try {
      const transaction = await paymentService.processPayment(req.userId, req.body);
      const response = ApiResponse.success(transaction, 'Payment processed successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Process payment controller error:', error);
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const transactions = await paymentService.getTransactions(req.userId);
      const response = ApiResponse.success(transactions);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get transactions controller error:', error);
      next(error);
    }
  }
}

module.exports = new PaymentController();
