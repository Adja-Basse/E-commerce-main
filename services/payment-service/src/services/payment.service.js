const Transaction = require('../models/transaction.model');
const paymentPublisher = require('../events/publishers/payment.publisher');
const logger = require('../../../../shared/utils/logger');
const { PAYMENT_STATUS, HTTP_STATUS } = require('../../../../shared/utils/constants');
const { v4: uuidv4 } = require('uuid');

class PaymentService {
  /**
   * Process a payment
   */
  async processPayment(userId, paymentData) {
    try {
      const { orderId, amount, currency = 'USD', paymentMethod, token } = paymentData;

      // Create transaction record
      const transaction = new Transaction({
        userId,
        orderId,
        amount,
        currency,
        paymentMethod,
        status: PAYMENT_STATUS.PENDING
      });

      await transaction.save();

      // MOCK Payment Processing (e.g. Stripe)
      // In a real app, you would use 'token' to charge via Stripe SDK
      const success = await this._mockPaymentGateway(amount, token);

      if (success) {
        transaction.status = PAYMENT_STATUS.COMPLETED;
        transaction.providerTransactionId = `txn_${uuidv4()}`;
        await transaction.save();
        
        await paymentPublisher.publishPaymentCompleted(transaction);
        logger.info(`Payment successful for order ${orderId}`);
      } else {
        transaction.status = PAYMENT_STATUS.FAILED;
        transaction.errorMessage = 'Card declined (Mock)';
        await transaction.save();

        await paymentPublisher.publishPaymentFailed(transaction);
        logger.warn(`Payment failed for order ${orderId}`);
        
        throw {
          statusCode: HTTP_STATUS.PAYMENT_REQUIRED,
          message: 'Payment failed'
        };
      }

      return transaction;
    } catch (error) {
      logger.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Mock payment gateway logic
   */
  async _mockPaymentGateway(amount, token) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Fail if token is 'fail_token'
        if (token === 'fail_token') {
          resolve(false);
        } else {
          resolve(true);
        }
      }, 1000);
    });
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId) {
    return await Transaction.find({ userId }).sort({ createdAt: -1 });
  }
}

module.exports = new PaymentService();
