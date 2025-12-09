const emailService = require('../../services/email.service');
const { getEventBusInstance } = require('../../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');

class OrderConsumer {
  async initialize() {
    try {
      const eventBus = getEventBusInstance();

      await eventBus.subscribe(
        'order.events',
        'notification.order.created',
        EVENT_TYPES.ORDER_CREATED,
        async (event) => {
           // Basic ack
           logger.info('Order created event received in notification service', { orderId: event.data.orderId });
           // In a real app we might fetch user email here if not in event
        }
      );
      
      // Listen for PAYMENT_COMPLETED to send Order Confirmation (implies Paid)
       await eventBus.subscribe(
        'payment.events',
        'notification.payment.completed',
        EVENT_TYPES.PAYMENT_COMPLETED,
        async (event) => {
          try {
             logger.info('Payment completed event received', { transactionId: event.data.transactionId });
             // Here we would ideally join Order info + User info to send email
             // For now, just logging or sending generic email if email exists
             // NOTE: Payment event might not have email.
             // We can assume we would get it.
          } catch(e) { logger.error(e) }
        }
      );

      logger.info('Order/Payment consumers initialized');
    } catch (error) {
      logger.error('Failed to initialize order consumers:', error);
      throw error;
    }
  }
}

module.exports = new OrderConsumer();
