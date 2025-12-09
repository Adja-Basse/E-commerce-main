const stockService = require('../services/stock.service');
const stockMovementService = require('../services/stockMovement.service');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const logger = require('../../../../shared/utils/logger');

class StockController {
  async getStock(req, res, next) {
    try {
      const stock = await stockService.getStockByProductId(req.params.productId);
      const response = ApiResponse.success(stock);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get stock controller error:', error);
      next(error);
    }
  }

  async addStock(req, res, next) {
    try {
      const { productId, quantity, reason, performedBy } = req.body;
      const stock = await stockService.addStock(
        productId,
        quantity,
        reason,
        performedBy || req.userId
      );
      const response = ApiResponse.success(stock, 'Stock added successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Add stock controller error:', error);
      next(error);
    }
  }

  async removeStock(req, res, next) {
    try {
      const { productId, quantity, reason, performedBy } = req.body;
      const stock = await stockService.removeStock(
        productId,
        quantity,
        reason,
        performedBy || req.userId
      );
      const response = ApiResponse.success(stock, 'Stock removed successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Remove stock controller error:', error);
      next(error);
    }
  }

  async reserveStock(req, res, next) {
    try {
      const { productId, quantity, reference, referenceType } = req.body;
      const stock = await stockService.reserveStock(
        productId,
        quantity,
        reference,
        referenceType || 'order'
      );
      const response = ApiResponse.success(stock, 'Stock reserved successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Reserve stock controller error:', error);
      next(error);
    }
  }

  async releaseStock(req, res, next) {
    try {
      const { productId, quantity, reference, referenceType } = req.body;
      const stock = await stockService.releaseStock(
        productId,
        quantity,
        reference,
        referenceType || 'order'
      );
      const response = ApiResponse.success(stock, 'Stock released successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Release stock controller error:', error);
      next(error);
    }
  }

  async adjustStock(req, res, next) {
    try {
      const { productId, newQuantity, reason } = req.body;
      const stock = await stockService.adjustStock(
        productId,
        newQuantity,
        reason,
        req.userId
      );
      const response = ApiResponse.success(stock, 'Stock adjusted successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Adjust stock controller error:', error);
      next(error);
    }
  }

  async getLowStock(req, res, next) {
    try {
      const stocks = await stockService.getLowStockItems();
      const response = ApiResponse.success(stocks);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get low stock controller error:', error);
      next(error);
    }
  }

  async getStockMovements(req, res, next) {
    try {
      const result = await stockService.getStockMovements(req.params.productId, req.query);
      const response = ApiResponse.success(result);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get stock movements controller error:', error);
      next(error);
    }
  }
}

module.exports = new StockController();

