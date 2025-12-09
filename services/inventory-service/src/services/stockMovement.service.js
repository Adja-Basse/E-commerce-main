const StockMovement = require('../models/stockMovement.model');
const logger = require('../../../../shared/utils/logger');

class StockMovementService {
  /**
   * Get all movements with filters
   */
  async getMovements(filters = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        productId,
        type,
        reference,
        startDate,
        endDate
      } = filters;

      const query = {};

      if (productId) query.productId = productId;
      if (type) query.type = type;
      if (reference) query.reference = reference;

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
      logger.error('Error getting movements:', error);
      throw error;
    }
  }

  /**
   * Get movement by ID
   */
  async getMovementById(movementId) {
    try {
      const movement = await StockMovement.findById(movementId);

      if (!movement) {
        throw {
          statusCode: 404,
          message: 'Movement not found'
        };
      }

      return movement;
    } catch (error) {
      logger.error('Error getting movement:', error);
      throw error;
    }
  }
}

module.exports = new StockMovementService();

