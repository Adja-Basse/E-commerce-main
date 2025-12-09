const stockService = require('../../services/stock.service');
const { getEventBusInstance } = require('../../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');

/**
 * Consumer for order events
 * Manages stock reservation and release based on order status
 */
class OrderConsumer {
  async initialize() {
    try {
      const eventBus = getEventBusInstance();

      // Subscribe to order created events - reserve stock
      await eventBus.subscribe(
        'order.events',
        'inventory.order.created',
        EVENT_TYPES.ORDER_CREATED,
        async (event) => {
          const { orderId, items } = event.data;
          logger.info('Order created event received, reserving stock', { orderId });

          let allReserved = true;
          let failedItem = null;

          // Reserve stock for each item
          for (const item of items || []) {
            try {
              await stockService.reserveStock(
                item.productId,
                item.quantity,
                orderId,
                'order'
              );
            } catch (error) {
              logger.error(`Failed to reserve stock for product ${item.productId}:`, error);
              allReserved = false;
              failedItem = item;
              break; // Stop if one fails
            }
          }

          // Publish outcome
          if (allReserved) {
            await eventBus.publish(
              'stock.events',
              'stock.order.reserved', // Routing key
              {
                type: 'STOCK_ORDER_RESERVED', // Custom type for Saga
                data: {
                  orderId,
                  status: 'success',
                  timestamp: new Date().toISOString()
                }
              }
            );
            logger.info('Stock successfully reserved for order', { orderId });
          } else {
            // Rollback/Release any reserved items? 
            // For now, let's just notify failure. OrderService will handle cancellation.
            // Ideally we should rollback here or OrderService requests rollback.
            
            await eventBus.publish(
              'stock.events',
              'stock.order.failed',
              {
                type: 'STOCK_ORDER_FAILED',
                data: {
                  orderId,
                  status: 'failed',
                  reason: `Insufficient stock for product ${failedItem?.productId}`,
                  items, // Send items back so OrderService sends cancel request 
                         // or we initiate rollback here (better)
                  timestamp: new Date().toISOString()
                }
              }
            );
            logger.warn('Stock reservation failed for order', { orderId });
            
            // Initiate rollback for this order
             try {
                // We simply release everything for this orderId
                // But we need to know what WAS reserved. 
                // Simple rollback loop for now:
                 for (const item of items || []) {
                    try {
                        // Attempt release (safe to call even if not reserved if we handle error)
                         await stockService.releaseStock(item.productId, item.quantity, orderId, 'order');
                    } catch(e) { /* ignore */ }
                 }
             } catch (e) { logger.error('Rollback failed', e); }
          }
        },
        { maxRetries: 3 }
      );

      // Subscribe to order cancelled events - release stock
      await eventBus.subscribe(
        'order.events',
        'inventory.order.cancelled',
        EVENT_TYPES.ORDER_CANCELLED,
        async (event) => {
          try {
            const { orderId, items } = event.data;
            logger.info('Order cancelled event received, releasing stock', { orderId });

            // Release reserved stock for each item
            for (const item of items || []) {
              try {
                await stockService.releaseStock(
                  item.productId,
                  item.quantity,
                  orderId,
                  'order'
                );
              } catch (error) {
                logger.error(`Failed to release stock for product ${item.productId}:`, error);
              }
            }
          } catch (error) {
            logger.error('Error processing order cancelled event:', error);
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

