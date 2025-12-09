const Review = require('../models/review.model');
const Product = require('../models/product.model');
const logger = require('../../../../shared/utils/logger');
const { HTTP_STATUS } = require('../../../../shared/utils/constants');

class ReviewService {
  /**
   * Create a new review
   */
  async createReview(reviewData) {
    try {
      // Check if product exists
      const product = await Product.findById(reviewData.product);
      if (!product) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Product not found'
        };
      }

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({
        product: reviewData.product,
        user: reviewData.user
      });

      if (existingReview) {
        throw {
          statusCode: HTTP_STATUS.CONFLICT,
          message: 'You have already reviewed this product'
        };
      }

      const review = new Review(reviewData);
      await review.save();

      logger.info(`Review created for product: ${reviewData.product}`);

      return review;
    } catch (error) {
      logger.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId) {
    try {
      const review = await Review.findById(reviewId)
        .populate('product', 'name slug')
        .populate('user', 'firstName lastName email');

      if (!review) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Review not found'
        };
      }

      return review;
    } catch (error) {
      logger.error('Error getting review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a product
   */
  async getProductReviews(productId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = '-createdAt',
        rating,
        approvedOnly = true
      } = filters;

      const query = { product: productId };

      if (approvedOnly) {
        query.isApproved = true;
      }

      if (rating) {
        query.rating = parseInt(rating);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [reviews, total] = await Promise.all([
        Review.find(query)
          .populate('user', 'firstName lastName')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Review.countDocuments(query)
      ]);

      return {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      logger.error('Error getting product reviews:', error);
      throw error;
    }
  }

  /**
   * Update review
   */
  async updateReview(reviewId, updateData, userId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Review not found'
        };
      }

      // Check if user owns the review
      if (review.user.toString() !== userId.toString()) {
        throw {
          statusCode: HTTP_STATUS.FORBIDDEN,
          message: 'You can only update your own reviews'
        };
      }

      Object.assign(review, updateData);
      await review.save();

      logger.info(`Review updated: ${reviewId}`);

      return review;
    } catch (error) {
      logger.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId, userId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Review not found'
        };
      }

      // Check if user owns the review
      if (review.user.toString() !== userId.toString()) {
        throw {
          statusCode: HTTP_STATUS.FORBIDDEN,
          message: 'You can only delete your own reviews'
        };
      }

      await Review.findByIdAndDelete(reviewId);

      logger.info(`Review deleted: ${reviewId}`);

      return { message: 'Review deleted successfully' };
    } catch (error) {
      logger.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Approve review (admin only)
   */
  async approveReview(reviewId) {
    try {
      const review = await Review.findByIdAndUpdate(
        reviewId,
        { isApproved: true },
        { new: true }
      );

      if (!review) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Review not found'
        };
      }

      logger.info(`Review approved: ${reviewId}`);

      return review;
    } catch (error) {
      logger.error('Error approving review:', error);
      throw error;
    }
  }
}

module.exports = new ReviewService();

