const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { authenticate, authorize } = require('../../../../shared/middleware/auth.middleware');
const { commonValidators, handleValidationErrors } = require('../../../../shared/middleware/validator');

// Public routes (read-only)
router.get('/', supplierController.getAllSuppliers.bind(supplierController));
router.get('/:id', supplierController.getSupplierById.bind(supplierController));

// Protected routes (admin only)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    commonValidators.string('name', { required: true }),
    commonValidators.email('email'),
    handleValidationErrors
  ],
  supplierController.createSupplier.bind(supplierController)
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  supplierController.updateSupplier.bind(supplierController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  supplierController.deleteSupplier.bind(supplierController)
);

module.exports = router;

