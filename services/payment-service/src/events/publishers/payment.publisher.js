const { getEventBusInstance } = require('../../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');

class PaymentPublisher {
  /**
   * Publish payment completed event
   */
  async publishPaymentCompleted(transaction) {
    try {
      const eventBus = getEventBusInstance();
      await eventBus.publish(
        'payment.events',
        EVENT_TYPES.PAYMENT_COMPLETED,
        {
          type: EVENT_TYPES.PAYMENT_COMPLETED,
          data: {
            transactionId: transaction._id,
            orderId: transaction.orderId,
            userId: transaction.userId,
            amount: transaction.amount,
            currency: transaction.currency,
            method: transaction.paymentMethod,
            status: transaction.status,
            completedAt: new Date().toISOString()
          }
        }
      );
      logger.info('Payment completed event published', { transactionId: transaction._id });
    } catch (error) {
      logger.error('Failed to publish payment completed event:', error);
      throw error;
    }
  }

  /**
   * Publish payment failed event
   */
  async publishPaymentFailed(transaction) {
    try {
      const eventBus = getEventBusInstance();
      await eventBus.publish(
        'payment.events',
        EVENT_TYPES.PAYMENT_FAILED,
        {
          type: EVENT_TYPES.PAYMENT_FAILED,
          data: {
            transactionId: transaction._id,
            orderId: transaction.orderId,
            userId: transaction.userId,
            amount: transaction.amount,
            reason: transaction.errorMessage,
            timestamp: new Date().toISOString()
          }
        }
      );
      logger.info('Payment failed event published', { transactionId: transaction._id });
    } catch (error) {
      logger.error('Failed to publish payment failed event:', error);
    }
  }
}

module.exports = new PaymentPublisher();
