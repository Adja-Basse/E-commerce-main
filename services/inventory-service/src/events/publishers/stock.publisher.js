const { getEventBusInstance } = require('../../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');

class StockPublisher {
  /**
   * Publish stock updated event
   */
  async publishStockUpdated(stockData) {
    try {
      const eventBus = getEventBusInstance();
      await eventBus.publish(
        'stock.events',
        EVENT_TYPES.STOCK_UPDATED,
        {
          type: EVENT_TYPES.STOCK_UPDATED,
          data: {
            productId: stockData.productId,
            quantity: stockData.quantity,
            reserved: stockData.reserved,
            available: stockData.available,
            isLowStock: stockData.available <= stockData.lowStockThreshold,
            updatedAt: new Date().toISOString()
          }
        }
      );
      logger.info('Stock updated event published', { productId: stockData.productId });
    } catch (error) {
      logger.error('Failed to publish stock updated event:', error);
      throw error;
    }
  }

  /**
   * Publish stock low event
   */
  async publishStockLow(stockData) {
    try {
      const eventBus = getEventBusInstance();
      await eventBus.publish(
        'stock.events',
        EVENT_TYPES.STOCK_LOW,
        {
          type: EVENT_TYPES.STOCK_LOW,
          data: {
            productId: stockData.productId,
            available: stockData.available,
            threshold: stockData.lowStockThreshold,
            timestamp: new Date().toISOString()
          }
        }
      );
      logger.info('Stock low event published', { productId: stockData.productId });
    } catch (error) {
      logger.error('Failed to publish stock low event:', error);
      throw error;
    }
  }

  /**
   * Publish stock reserved event
   */
  async publishStockReserved(stockData, reference, referenceType) {
    try {
      const eventBus = getEventBusInstance();
      await eventBus.publish(
        'stock.events',
        EVENT_TYPES.STOCK_RESERVED,
        {
          type: EVENT_TYPES.STOCK_RESERVED,
          data: {
            productId: stockData.productId,
            quantity: stockData.reserved, // This is total reserved, maybe we want 'reservedAmount' for this transaction? 
                                          // For now let's assume correlation is enough to query status or we trust the flow.
                                          // Note: Ideally event should say "Reserved X amount for Order Y". 
                                          // stockData.reserved is the AGGREGATE. 
                                          // But for the saga, we just need to know "It worked for Order Y".
            available: stockData.available,
            reference,
            referenceType,
            timestamp: new Date().toISOString()
          }
        }
      );
      logger.info('Stock reserved event published', { productId: stockData.productId, reference });
    } catch (error) {
      logger.error('Failed to publish stock reserved event:', error);
      throw error;
    }
  }
}

module.exports = new StockPublisher();

