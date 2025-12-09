const { body, param, query, validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../utils/constants');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    const response = ApiResponse.validationError(formattedErrors);
    return res.status(response.statusCode).json(response.toJSON());
  }
  next();
};

// Common validation rules
const commonValidators = {
  mongoId: (field = 'id') => {
    return param(field)
      .isMongoId()
      .withMessage(`${field} must be a valid MongoDB ID`);
  },

  email: (field = 'email') => {
    return body(field)
      .isEmail()
      .normalizeEmail()
      .withMessage(`${field} must be a valid email address`);
  },

  password: (field = 'password') => {
    return body(field)
      .isLength({ min: 8 })
      .withMessage(`${field} must be at least 8 characters long`)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(`${field} must contain at least one uppercase letter, one lowercase letter, and one number`);
  },

  string: (field, options = {}) => {
    const { min, max, required = true } = options;
    let validator = body(field);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    }
    
    validator = validator.isString().withMessage(`${field} must be a string`);
    
    if (min !== undefined) {
      validator = validator.isLength({ min }).withMessage(`${field} must be at least ${min} characters`);
    }
    
    if (max !== undefined) {
      validator = validator.isLength({ max }).withMessage(`${field} must be at most ${max} characters`);
    }
    
    return validator.trim();
  },

  number: (field, options = {}) => {
    const { min, max, required = true } = options;
    let validator = body(field);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    }
    
    validator = validator.isNumeric().withMessage(`${field} must be a number`);
    
    if (min !== undefined) {
      validator = validator.isFloat({ min }).withMessage(`${field} must be at least ${min}`);
    }
    
    if (max !== undefined) {
      validator = validator.isFloat({ max }).withMessage(`${field} must be at most ${max}`);
    }
    
    return validator.toFloat();
  },

  array: (field, options = {}) => {
    const { min, max, required = true } = options;
    let validator = body(field);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    }
    
    validator = validator.isArray().withMessage(`${field} must be an array`);
    
    if (min !== undefined) {
      validator = validator.isArray({ min }).withMessage(`${field} must contain at least ${min} items`);
    }
    
    if (max !== undefined) {
      validator = validator.isArray({ max }).withMessage(`${field} must contain at most ${max} items`);
    }
    
    return validator;
  },

  boolean: (field, required = false) => {
    let validator = body(field);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    }
    
    return validator.isBoolean().withMessage(`${field} must be a boolean`);
  },

  date: (field, required = true) => {
    let validator = body(field);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    }
    
    return validator.isISO8601().withMessage(`${field} must be a valid date (ISO 8601)`);
  },

  enum: (field, values, required = true) => {
    let validator = body(field);
    
    if (required) {
      validator = validator.notEmpty().withMessage(`${field} is required`);
    }
    
    return validator.isIn(values).withMessage(`${field} must be one of: ${values.join(', ')}`);
  }
};

// Pagination validators
const paginationValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt(),
  query('sort')
    .optional()
    .isString()
    .withMessage('sort must be a string'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be either "asc" or "desc"')
];

module.exports = {
  handleValidationErrors,
  commonValidators,
  paginationValidators,
  validationResult
};

