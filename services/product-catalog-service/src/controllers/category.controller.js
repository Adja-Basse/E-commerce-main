const categoryService = require('../services/category.service');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const logger = require('../../../../shared/utils/logger');

class CategoryController {
  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);
      const response = ApiResponse.created(category, 'Category created successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Create category controller error:', error);
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      const response = ApiResponse.success(category);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get category controller error:', error);
      next(error);
    }
  }

  async getCategoryBySlug(req, res, next) {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      const response = ApiResponse.success(category);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get category by slug controller error:', error);
      next(error);
    }
  }

  async getAllCategories(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await categoryService.getAllCategories(includeInactive);
      const response = ApiResponse.success(categories);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get categories controller error:', error);
      next(error);
    }
  }

  async getCategoryTree(req, res, next) {
    try {
      const tree = await categoryService.getCategoryTree();
      const response = ApiResponse.success(tree);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get category tree controller error:', error);
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      const response = ApiResponse.success(category, 'Category updated successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Update category controller error:', error);
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id);
      const response = ApiResponse.success(null, 'Category deleted successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Delete category controller error:', error);
      next(error);
    }
  }
}

module.exports = new CategoryController();

