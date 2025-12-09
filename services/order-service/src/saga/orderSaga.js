const { getEventBusInstance } = require('../config/rabbitmq');
const orderService = require('../services/order.service');
const logger = require('../../../../shared/utils/logger');
const { ORDER_STATUS } = require('../../../../shared/utils/constants');

class OrderSaga {
  async initialize() {
    try {
      const eventBus = getEventBusInstance();

      // Subscribe to STOCK_ORDER_RESERVED (Success)
      await eventBus.subscribe(
        'stock.events',
        'order.stock.reserved',
        'STOCK_ORDER_RESERVED',
        async (event) => {
          try {
            logger.info('Received stock reserved event for order', { orderId: event.data.orderId });
            
            await orderService.updateOrderStatus(
              event.data.orderId,
              ORDER_STATUS.CONFIRMED,
              'Stock reserved successfully',
              'System (Inventory)'
            );
          } catch (error) {
            logger.error('Error processing stock reserved event:', error);
          }
        },
        { maxRetries: 3 }
      );

      // Subscribe to STOCK_ORDER_FAILED (Failure)
      await eventBus.subscribe(
        'stock.events',
        'order.stock.failed',
        'STOCK_ORDER_FAILED',
        async (event) => {
          try {
            logger.info('Received stock failed event for order', { orderId: event.data.orderId });
            
            await orderService.updateOrderStatus(
              event.data.orderId,
              ORDER_STATUS.CANCELLED,
              `Cancellation due to stock failure: ${event.data.reason}`,
              'System (Inventory)'
            );
          } catch (error) {
            logger.error('Error processing stock failed event:', error);
          }
        },
        { maxRetries: 3 }
      );

      logger.info('Order Saga initialized');
    } catch (error) {
      logger.error('Failed to initialize Order Saga:', error);
      throw error;
    }
  }
}

module.exports = new OrderSaga();
