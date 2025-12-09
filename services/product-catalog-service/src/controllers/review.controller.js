const reviewService = require('../services/review.service');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const logger = require('../../../../shared/utils/logger');

class ReviewController {
  async createReview(req, res, next) {
    try {
      const reviewData = {
        ...req.body,
        user: req.userId || req.user?.userId
      };
      const review = await reviewService.createReview(reviewData);
      const response = ApiResponse.created(review, 'Review created successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Create review controller error:', error);
      next(error);
    }
  }

  async getReviewById(req, res, next) {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      const response = ApiResponse.success(review);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get review controller error:', error);
      next(error);
    }
  }

  async getProductReviews(req, res, next) {
    try {
      const result = await reviewService.getProductReviews(req.params.productId, req.query);
      const response = ApiResponse.success(result);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get product reviews controller error:', error);
      next(error);
    }
  }

  async updateReview(req, res, next) {
    try {
      const userId = req.userId || req.user?.userId;
      const review = await reviewService.updateReview(req.params.id, req.body, userId);
      const response = ApiResponse.success(review, 'Review updated successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Update review controller error:', error);
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const userId = req.userId || req.user?.userId;
      await reviewService.deleteReview(req.params.id, userId);
      const response = ApiResponse.success(null, 'Review deleted successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Delete review controller error:', error);
      next(error);
    }
  }

  async approveReview(req, res, next) {
    try {
      const review = await reviewService.approveReview(req.params.id);
      const response = ApiResponse.success(review, 'Review approved successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Approve review controller error:', error);
      next(error);
    }
  }
}

module.exports = new ReviewController();

