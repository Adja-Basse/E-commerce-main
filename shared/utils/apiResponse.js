class ApiResponse {
  constructor(success, data = null, message = '', errors = null, statusCode = 200) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.errors = errors;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  static success(data = null, message = 'Success', statusCode = 200) {
    return new ApiResponse(true, data, message, null, statusCode);
  }

  static error(message = 'Error', errors = null, statusCode = 400) {
    return new ApiResponse(false, null, message, errors, statusCode);
  }

  static created(data = null, message = 'Resource created successfully', statusCode = 201) {
    return new ApiResponse(true, data, message, null, statusCode);
  }

  static notFound(message = 'Resource not found', statusCode = 404) {
    return new ApiResponse(false, null, message, null, statusCode);
  }

  static unauthorized(message = 'Unauthorized', statusCode = 401) {
    return new ApiResponse(false, null, message, null, statusCode);
  }

  static forbidden(message = 'Forbidden', statusCode = 403) {
    return new ApiResponse(false, null, message, null, statusCode);
  }

  static validationError(errors, message = 'Validation failed', statusCode = 422) {
    return new ApiResponse(false, null, message, errors, statusCode);
  }

  static serverError(message = 'Internal server error', statusCode = 500) {
    return new ApiResponse(false, null, message, null, statusCode);
  }

  toJSON() {
    const response = {
      success: this.success,
      message: this.message,
      timestamp: this.timestamp
    };

    if (this.data !== null) {
      response.data = this.data;
    }

    if (this.errors !== null) {
      response.errors = this.errors;
    }

    return response;
  }
}

module.exports = ApiResponse;

