const Cart = require('../models/cart.model');
const logger = require('../../../../shared/utils/logger');
const { HTTP_STATUS } = require('../../../../shared/utils/constants');

class CartService {
  /**
   * Get or create active cart for user
   */
  async getCart(userId) {
    try {
      let cart = await Cart.findOne({ userId, isActive: true });
      
      if (!cart) {
        cart = new Cart({ userId });
        await cart.save();
        logger.info(`Created new cart for user ${userId}`);
      }
      
      return cart;
    } catch (error) {
      logger.error('Error getting cart:', error);
      throw error;
    }
  }

  /**
   * Add item to cart
   */
  async addItem(userId, itemData) {
    try {
      const cart = await this.getCart(userId);
      
      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        item => item.productId === itemData.productId
      );
      
      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += itemData.quantity || 1;
      } else {
        // Add new item
        cart.items.push(itemData);
      }
      
      await cart.save();
      return cart;
    } catch (error) {
      logger.error('Error adding item to cart:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId, productId) {
    try {
      const cart = await this.getCart(userId);
      
      cart.items = cart.items.filter(item => item.productId !== productId);
      
      await cart.save();
      return cart;
    } catch (error) {
      logger.error('Error removing item from cart:', error);
      throw error;
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(userId, productId, quantity) {
    try {
      const cart = await this.getCart(userId);
      
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Item not found in cart'
        };
      }
      
      if (quantity <= 0) {
        // Remove item if quantity <= 0
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      
      await cart.save();
      return cart;
    } catch (error) {
      logger.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  /**
   * Clear cart
   */
  async clearCart(userId) {
    try {
      const cart = await this.getCart(userId);
      cart.items = [];
      cart.totalPrice = 0;
      cart.totalItems = 0;
      await cart.save();
      return cart;
    } catch (error) {
      logger.error('Error clearing cart:', error);
      throw error;
    }
  }
}

module.exports = new CartService();
