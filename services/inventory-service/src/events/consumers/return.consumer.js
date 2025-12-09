const stockService = require('../../services/stock.service');
const { getEventBusInstance } = require('../../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');

/**
 * Consumer for return events
 * Adds stock back when items are returned
 */
class ReturnConsumer {
  async initialize() {
    try {
      const eventBus = getEventBusInstance();

      // Subscribe to return completed events - add stock back
      await eventBus.subscribe(
        'return.events',
        'inventory.return.completed',
        EVENT_TYPES.RETURN_COMPLETED,
        async (event) => {
          try {
            const { returnId, items } = event.data;
            logger.info('Return completed event received, adding stock back', { returnId });

            // Add stock back for each returned item
            for (const item of items || []) {
              try {
                await stockService.addStock(
                  item.productId,
                  item.quantity,
                  `Return: ${returnId}`,
                  'system'
                );
              } catch (error) {
                logger.error(`Failed to add stock for product ${item.productId}:`, error);
              }
            }
          } catch (error) {
            logger.error('Error processing return completed event:', error);
          }
        },
        { maxRetries: 3 }
      );

      logger.info('Return consumers initialized');
    } catch (error) {
      logger.error('Failed to initialize return consumers:', error);
      throw error;
    }
  }
}

module.exports = new ReturnConsumer();

