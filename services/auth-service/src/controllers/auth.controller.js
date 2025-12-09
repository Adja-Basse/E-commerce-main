const authService = require('../services/auth.service');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const logger = require('../../../../shared/utils/logger');

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const userData = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone
      };

      const result = await authService.register(userData);
      const response = ApiResponse.created(result, 'User registered successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Register controller error:', error);
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const deviceInfo = {
        userAgent: req.get('user-agent'),
        ipAddress: req.ip || req.connection.remoteAddress
      };

      const result = await authService.login(
        req.body.email,
        req.body.password,
        deviceInfo
      );

      const response = ApiResponse.success(result, 'Login successful');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Login controller error:', error);
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      const response = ApiResponse.success(result, 'Token refreshed successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Refresh token controller error:', error);
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
      const result = await authService.logout(refreshToken);
      const response = ApiResponse.success(result);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Logout controller error:', error);
      next(error);
    }
  }

  /**
   * Logout from all devices
   * POST /api/auth/logout-all
   */
  async logoutAll(req, res, next) {
    try {
      const userId = req.userId || req.user?.userId;
      const result = await authService.logoutAll(userId);
      const response = ApiResponse.success(result);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Logout all controller error:', error);
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.userId || req.user?.userId;
      const user = await authService.getUserById(userId);
      const roles = await authService.getUserRoles(userId);

      const userData = {
        ...user.toJSON(),
        roles: roles.map(r => r.name)
      };

      const response = ApiResponse.success(userData);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Get profile controller error:', error);
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.userId || req.user?.userId;
      const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone
      };

      const user = await authService.updateProfile(userId, updateData);
      const response = ApiResponse.success(user.toJSON(), 'Profile updated successfully');
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Update profile controller error:', error);
      next(error);
    }
  }

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.userId || req.user?.userId;
      const result = await authService.changePassword(
        userId,
        req.body.currentPassword,
        req.body.newPassword
      );

      const response = ApiResponse.success(result);
      res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      logger.error('Change password controller error:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();

