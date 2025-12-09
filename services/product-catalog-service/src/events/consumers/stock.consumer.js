const { getEventBusInstance } = require('../../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');

/**
 * Consumer for stock events
 * Updates product availability based on stock changes
 */
class StockConsumer {
  async initialize() {
    try {
      const eventBus = getEventBusInstance();

      // Subscribe to stock updated events
      await eventBus.subscribe(
        'stock.events',
        'product-catalog.stock.updated',
        EVENT_TYPES.STOCK_UPDATED,
        async (event) => {
          try {
            logger.info('Stock updated event received', { productId: event.data.productId });
            
            // Here you could update product status based on stock
            // For example, mark product as out of stock if available = 0
            // This is a placeholder - implement based on your business logic
            
          } catch (error) {
            logger.error('Error processing stock updated event:', error);
          }
        },
        { maxRetries: 3 }
      );

      // Subscribe to stock low events
      await eventBus.subscribe(
        'stock.events',
        'product-catalog.stock.low',
        EVENT_TYPES.STOCK_LOW,
        async (event) => {
          try {
            logger.info('Stock low event received', { productId: event.data.productId });
            
            // Here you could send notifications or update product status
            // This is a placeholder - implement based on your business logic
            
          } catch (error) {
            logger.error('Error processing stock low event:', error);
          }
        },
        { maxRetries: 3 }
      );

      logger.info('Stock consumers initialized');
    } catch (error) {
      logger.error('Failed to initialize stock consumers:', error);
      throw error;
    }
  }
}

module.exports = new StockConsumer();

