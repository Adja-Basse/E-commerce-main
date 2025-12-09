const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../../../../shared/middleware/auth.middleware');
const { commonValidators, handleValidationErrors } = require('../../../../shared/middleware/validator');

// Public routes
router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/tree', categoryController.getCategoryTree.bind(categoryController));
router.get('/slug/:slug', categoryController.getCategoryBySlug.bind(categoryController));
router.get('/:id', categoryController.getCategoryById.bind(categoryController));

// Protected routes (admin only)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    commonValidators.string('name', { required: true }),
    handleValidationErrors
  ],
  categoryController.createCategory.bind(categoryController)
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  categoryController.updateCategory.bind(categoryController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  categoryController.deleteCategory.bind(categoryController)
);

module.exports = router;

