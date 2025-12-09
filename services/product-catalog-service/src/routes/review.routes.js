const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, authorize } = require('../../../../shared/middleware/auth.middleware');
const { commonValidators, handleValidationErrors } = require('../../../../shared/middleware/validator');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews.bind(reviewController));

// Protected routes
router.post(
  '/',
  authenticate,
  [
    commonValidators.mongoId('product'),
    commonValidators.number('rating', { required: true, min: 1, max: 5 }),
    handleValidationErrors
  ],
  reviewController.createReview.bind(reviewController)
);

router.put(
  '/:id',
  authenticate,
  reviewController.updateReview.bind(reviewController)
);

router.delete(
  '/:id',
  authenticate,
  reviewController.deleteReview.bind(reviewController)
);

// Admin routes
router.post(
  '/:id/approve',
  authenticate,
  authorize('admin', 'moderator'),
  reviewController.approveReview.bind(reviewController)
);

module.exports = router;

