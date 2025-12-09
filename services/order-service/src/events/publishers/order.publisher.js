const { getEventBusInstance } = require('../../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');

class OrderPublisher {
  /**
   * Publish order created event
   */
  async publishOrderCreated(order) {
    try {
      const eventBus = getEventBusInstance();
      await eventBus.publish(
        'order.events',
        EVENT_TYPES.ORDER_CREATED,
        {
          type: EVENT_TYPES.ORDER_CREATED,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            items: order.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            })),
            totalAmount: order.total,
            createdAt: order.createdAt
          }
        }
      );
      logger.info('Order created event published', { orderId: order._id });
    } catch (error) {
      logger.error('Failed to publish order created event:', error);
      // Don't throw, let the flow continue (or handle retry)
    }
  }

  /**
   * Publish order cancelled event
   */
  async publishOrderCancelled(order, reason) {
    try {
      const eventBus = getEventBusInstance();
      await eventBus.publish(
        'order.events',
        EVENT_TYPES.ORDER_CANCELLED,
        {
          type: EVENT_TYPES.ORDER_CANCELLED,
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            items: order.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            })),
            reason,
            cancelledAt: new Date().toISOString()
          }
        }
      );
      logger.info('Order cancelled event published', { orderId: order._id });
    } catch (error) {
      logger.error('Failed to publish order cancelled event:', error);
    }
  }
}

module.exports = new OrderPublisher();
