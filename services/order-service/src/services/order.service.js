const Order = require('../models/order.model');
const Address = require('../models/address.model');
const orderPublisher = require('../events/publishers/order.publisher');
const logger = require('../../../../shared/utils/logger');
const { v4: uuidv4 } = require('uuid');
const { ORDER_STATUS, HTTP_STATUS } = require('../../../../shared/utils/constants');

class OrderService {
  /**
   * Create new order
   */
  async createOrder(userId, orderData) {
    try {
      // Validate items (should be done by caller or here)
      if (!orderData.items || orderData.items.length === 0) {
        throw {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: 'Order must contain items'
        };
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 4).toUpperCase()}`;

      // Calculate totals (if not provided)
      let subtotal = 0;
      orderData.items.forEach(item => {
        subtotal += item.price * item.quantity;
      });

      const tax = subtotal * 0.20; // 20% VAT example
      const shippingCost = 10; // Fixed shipping for example
      const total = subtotal + tax + shippingCost;

      const order = new Order({
        userId,
        orderNumber,
        items: orderData.items,
        subtotal,
        tax,
        shippingCost,
        total,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress || orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'stripe',
        status: ORDER_STATUS.PENDING
      });

      order.history.push({
        status: ORDER_STATUS.PENDING,
        comment: 'Order placed'
      });

      await order.save();
      logger.info(`Order created: ${order.orderNumber}`);

      // Publish event
      await orderPublisher.publishOrderCreated(order);

      return order;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId, userId) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Order not found'
        };
      }

      // Check ownership
      if (order.userId !== userId) { // Add admin check logic here if needed
        throw {
          statusCode: HTTP_STATUS.FORBIDDEN,
          message: 'Access denied'
        };
      }

      return order;
    } catch (error) {
      logger.error('Error getting order:', error);
      throw error;
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId) {
    try {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      return orders;
    } catch (error) {
      logger.error('Error getting user orders:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, comment, performedBy) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Order not found'
        };
      }

      order.status = status;
      order.history.push({
        status,
        timestamp: new Date(),
        comment: comment || `Status updated to ${status} by ${performedBy}`
      });

      await order.save();
      logger.info(`Order ${order.orderNumber} status updated to ${status}`);

      if (status === ORDER_STATUS.CANCELLED) {
        await orderPublisher.publishOrderCancelled(order, comment);
      }

      return order;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }
}

module.exports = new OrderService();
