const productService = require('../services/product.service');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const logger = require('../../../../shared/utils/logger');

class ProductController {
  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      const response = ApiResponse.created(product, 'Product created successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Create product controller error:', error);
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      const response = ApiResponse.success(product);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get product controller error:', error);
      next(error);
    }
  }

  async getProductBySlug(req, res, next) {
    try {
      const product = await productService.getProductBySlug(req.params.slug);
      const response = ApiResponse.success(product);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get product by slug controller error:', error);
      next(error);
    }
  }

  async getProducts(req, res, next) {
    try {
      const result = await productService.getProducts(req.query);
      const response = ApiResponse.success(result);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get products controller error:', error);
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      const response = ApiResponse.success(product, 'Product updated successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Update product controller error:', error);
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      const response = ApiResponse.success(null, 'Product deleted successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Delete product controller error:', error);
      next(error);
    }
  }

  async getFeaturedProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const products = await productService.getFeaturedProducts(limit);
      const response = ApiResponse.success(products);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get featured products controller error:', error);
      next(error);
    }
  }
}

module.exports = new ProductController();

