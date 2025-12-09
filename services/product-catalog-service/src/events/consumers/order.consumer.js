const { getEventBusInstance } = require('../../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');

/**
 * Consumer for order events
 * Updates product data based on order events
 */
class OrderConsumer {
  async initialize() {
    try {
      const eventBus = getEventBusInstance();

      // Subscribe to order created events
      await eventBus.subscribe(
        'order.events',
        'product-catalog.order.created',
        EVENT_TYPES.ORDER_CREATED,
        async (event) => {
          try {
            logger.info('Order created event received', { orderId: event.data.orderId });
            
            // Here you could update product sales count, popularity, etc.
            // This is a placeholder - implement based on your business logic
            
          } catch (error) {
            logger.error('Error processing order created event:', error);
          }
        },
        { maxRetries: 3 }
      );

      logger.info('Order consumers initialized');
    } catch (error) {
      logger.error('Failed to initialize order consumers:', error);
      throw error;
    }
  }
}

module.exports = new OrderConsumer();

