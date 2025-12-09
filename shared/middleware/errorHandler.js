const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    const response = ApiResponse.validationError(errors, 'Validation failed');
    return res.status(response.statusCode).json(response.toJSON());
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const response = ApiResponse.error(
      `${field} already exists`,
      { [field]: `${field} must be unique` },
      HTTP_STATUS.CONFLICT
    );
    return res.status(response.statusCode).json(response.toJSON());
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const response = ApiResponse.unauthorized('Invalid token');
    return res.status(response.statusCode).json(response.toJSON());
  }

  if (err.name === 'TokenExpiredError') {
    const response = ApiResponse.unauthorized('Token expired');
    return res.status(response.statusCode).json(response.toJSON());
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const response = ApiResponse.error('Invalid ID format', null, HTTP_STATUS.BAD_REQUEST);
    return res.status(response.statusCode).json(response.toJSON());
  }

  // Custom application error
  if (err.statusCode) {
    const response = ApiResponse.error(
      err.message,
      err.errors || null,
      err.statusCode
    );
    return res.status(response.statusCode).json(response.toJSON());
  }

  // Default server error
  const response = ApiResponse.serverError(
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  );
  return res.status(response.statusCode).json(response.toJSON());
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const response = ApiResponse.notFound(`Route ${req.method} ${req.path} not found`);
  res.status(response.statusCode).json(response.toJSON());
};

module.exports = {
  errorHandler,
  notFoundHandler
};

