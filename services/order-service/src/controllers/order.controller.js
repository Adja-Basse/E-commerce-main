const orderService = require('../services/order.service');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const logger = require('../../../../shared/utils/logger');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(req.userId, req.body);
      const response = ApiResponse.created(order, 'Order created successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Create order controller error:', error);
      next(error);
    }
  }

  async getOrder(req, res, next) {
    try {
      const order = await orderService.getOrder(req.params.id, req.userId);
      const response = ApiResponse.success(order);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get order controller error:', error);
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const orders = await orderService.getUserOrders(req.userId);
      const response = ApiResponse.success(orders);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get my orders controller error:', error);
      next(error);
    }
  }
}

module.exports = new OrderController();
