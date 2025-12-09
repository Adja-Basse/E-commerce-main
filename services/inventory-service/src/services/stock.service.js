const Stock = require('../models/stock.model');
const StockMovement = require('../models/stockMovement.model');
const stockPublisher = require('../events/publishers/stock.publisher');
const { STOCK_MOVEMENT_TYPES } = require('../../../../shared/utils/constants');
const logger = require('../../../../shared/utils/logger');
const { HTTP_STATUS } = require('../../../../shared/utils/constants');

class StockService {
  /**
   * Create or get stock for a product
   */
  async getOrCreateStock(productId, initialQuantity = 0) {
    try {
      let stock = await Stock.findOne({ productId });

      if (!stock) {
        stock = new Stock({
          productId,
          quantity: initialQuantity,
          available: initialQuantity
        });
        await stock.save();

        // Create initial movement
        await this.createMovement(
          productId,
          STOCK_MOVEMENT_TYPES.IN,
          initialQuantity,
          0,
          initialQuantity,
          'Initial stock',
          'system'
        );

        logger.info(`Stock created for product: ${productId}`);
      }

      return stock;
    } catch (error) {
      logger.error('Error getting/creating stock:', error);
      throw error;
    }
  }

  /**
   * Get stock by product ID
   */
  async getStockByProductId(productId) {
    try {
      const stock = await Stock.findOne({ productId });

      if (!stock) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Stock not found for this product'
        };
      }

      return stock;
    } catch (error) {
      logger.error('Error getting stock:', error);
      throw error;
    }
  }

  /**
   * Add stock (incoming)
   */
  async addStock(productId, quantity, reason = 'Stock addition', performedBy = 'system') {
    try {
      const stock = await this.getOrCreateStock(productId);
      const previousQuantity = stock.quantity;

      stock.quantity += quantity;
      await stock.save();

      // Create movement record
      await this.createMovement(
        productId,
        STOCK_MOVEMENT_TYPES.IN,
        quantity,
        previousQuantity,
        stock.quantity,
        reason,
        performedBy
      );

      // Publish stock updated event
      try {
        await stockPublisher.publishStockUpdated(stock);
      } catch (error) {
        logger.warn('Failed to publish stock updated event:', error);
      }

      logger.info(`Stock added for product ${productId}: +${quantity}`);

      return stock;
    } catch (error) {
      logger.error('Error adding stock:', error);
      throw error;
    }
  }

  /**
   * Remove stock (outgoing)
   */
  async removeStock(productId, quantity, reason = 'Stock removal', performedBy = 'system') {
    try {
      const stock = await this.getOrCreateStock(productId);
      const previousQuantity = stock.quantity;

      if (stock.available < quantity) {
        throw {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: `Insufficient stock. Available: ${stock.available}, Requested: ${quantity}`
        };
      }

      stock.quantity -= quantity;
      await stock.save();

      // Create movement record
      await this.createMovement(
        productId,
        STOCK_MOVEMENT_TYPES.OUT,
        quantity,
        previousQuantity,
        stock.quantity,
        reason,
        performedBy
      );

      logger.info(`Stock removed for product ${productId}: -${quantity}`);

      return stock;
    } catch (error) {
      logger.error('Error removing stock:', error);
      throw error;
    }
  }

  /**
   * Reserve stock
   */
  async reserveStock(productId, quantity, reference, referenceType = 'order') {
    try {
      const stock = await this.getOrCreateStock(productId);
      const previousReserved = stock.reserved;

      if (stock.available < quantity) {
        throw {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: `Insufficient available stock. Available: ${stock.available}, Requested: ${quantity}`
        };
      }

      stock.reserved += quantity;
      await stock.save();

      // Create movement record
      await this.createMovement(
        productId,
        STOCK_MOVEMENT_TYPES.RESERVED,
        quantity,
        stock.quantity,
        stock.quantity,
        `Reserved for ${referenceType}: ${reference}`,
        'system',
        reference,
        referenceType,
        previousReserved,
        stock.reserved
      );

      // Publish events
      try {
        await stockPublisher.publishStockUpdated(stock);
        await stockPublisher.publishStockReserved(stock, reference, referenceType);
      } catch (error) {
        logger.warn('Failed to publish stock events:', error);
      }

      logger.info(`Stock reserved for product ${productId}: ${quantity} (ref: ${reference})`);

      return stock;
    } catch (error) {
      logger.error('Error reserving stock:', error);
      throw error;
    }
  }

  /**
   * Release reserved stock
   */
  async releaseStock(productId, quantity, reference, referenceType = 'order') {
    try {
      const stock = await this.getOrCreateStock(productId);
      const previousReserved = stock.reserved;

      if (stock.reserved < quantity) {
        throw {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: `Cannot release more than reserved. Reserved: ${stock.reserved}, Requested: ${quantity}`
        };
      }

      stock.reserved -= quantity;
      await stock.save();

      // Create movement record
      await this.createMovement(
        productId,
        STOCK_MOVEMENT_TYPES.RELEASED,
        quantity,
        stock.quantity,
        stock.quantity,
        `Released from ${referenceType}: ${reference}`,
        'system',
        reference,
        referenceType,
        previousReserved,
        stock.reserved
      );

      logger.info(`Stock released for product ${productId}: ${quantity} (ref: ${reference})`);

      return stock;
    } catch (error) {
      logger.error('Error releasing stock:', error);
      throw error;
    }
  }

  /**
   * Adjust stock (manual adjustment)
   */
  async adjustStock(productId, newQuantity, reason, performedBy) {
    try {
      const stock = await this.getOrCreateStock(productId);
      const previousQuantity = stock.quantity;
      const difference = newQuantity - previousQuantity;

      stock.quantity = newQuantity;
      await stock.save();

      // Create movement record
      await this.createMovement(
        productId,
        STOCK_MOVEMENT_TYPES.ADJUSTMENT,
        difference,
        previousQuantity,
        newQuantity,
        reason,
        performedBy
      );

      logger.info(`Stock adjusted for product ${productId}: ${previousQuantity} -> ${newQuantity}`);

      return stock;
    } catch (error) {
      logger.error('Error adjusting stock:', error);
      throw error;
    }
  }

  /**
   * Get low stock items
   */
  async getLowStockItems() {
    try {
      const stocks = await Stock.find({
        isActive: true,
        $expr: {
          $lte: ['$available', '$lowStockThreshold']
        }
      }).sort('available');

      return stocks;
    } catch (error) {
      logger.error('Error getting low stock items:', error);
      throw error;
    }
  }

  /**
   * Get items that need reorder
   */
  async getItemsNeedingReorder() {
    try {
      const stocks = await Stock.find({
        isActive: true,
        $expr: {
          $lte: ['$available', '$reorderPoint']
        }
      }).sort('available');

      return stocks;
    } catch (error) {
      logger.error('Error getting items needing reorder:', error);
      throw error;
    }
  }

  /**
   * Create stock movement record
   */
  async createMovement(
    productId,
    type,
    quantity,
    previousQuantity,
    newQuantity,
    reason,
    performedBy,
    reference = null,
    referenceType = 'other',
    previousReserved = 0,
    newReserved = 0
  ) {
    try {
      const movement = new StockMovement({
        productId,
        type,
        quantity,
        previousQuantity,
        newQuantity,
        previousReserved,
        newReserved,
        reference,
        referenceType,
        reason,
        performedBy
      });

      await movement.save();
      return movement;
    } catch (error) {
      logger.error('Error creating stock movement:', error);
      throw error;
    }
  }

  /**
   * Get stock movements for a product
   */
  async getStockMovements(productId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        type,
        startDate,
        endDate
      } = filters;

      const query = { productId };

      if (type) {
        query.type = type;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [movements, total] = await Promise.all([
        StockMovement.find(query)
          .sort('-createdAt')
          .skip(skip)
          .limit(parseInt(limit)),
        StockMovement.countDocuments(query)
      ]);

      return {
        movements,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      logger.error('Error getting stock movements:', error);
      throw error;
    }
  }
}

module.exports = new StockService();

