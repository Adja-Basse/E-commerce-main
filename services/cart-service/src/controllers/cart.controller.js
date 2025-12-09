const cartService = require('../services/cart.service');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const logger = require('../../../../shared/utils/logger');

class CartController {
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.userId);
      const response = ApiResponse.success(cart);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get cart controller error:', error);
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const cart = await cartService.addItem(req.userId, req.body);
      const response = ApiResponse.success(cart, 'Item added to cart');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Add item controller error:', error);
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const { productId } = req.params;
      const cart = await cartService.removeItem(req.userId, productId);
      const response = ApiResponse.success(cart, 'Item removed from cart');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Remove item controller error:', error);
      next(error);
    }
  }

  async updateItem(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const cart = await cartService.updateItemQuantity(req.userId, productId, quantity);
      const response = ApiResponse.success(cart, 'Cart updated');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Update item controller error:', error);
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.userId);
      const response = ApiResponse.success(cart, 'Cart cleared');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Clear cart controller error:', error);
      next(error);
    }
  }
}

module.exports = new CartController();
