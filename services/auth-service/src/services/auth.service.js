const User = require('../models/user.model');
const Role = require('../models/role.model');
const UserRole = require('../models/userRole.model');
const tokenService = require('./token.service');
const keycloakService = require('./keycloak.service');
const axios = require('axios');
const { generateAccessToken, generateTokenPayload } = require('../utils/jwt.util');
const { getEventBusInstance } = require('../config/rabbitmq');
const { EVENT_TYPES } = require('../../../../shared/events/eventTypes');
const logger = require('../../../../shared/utils/logger');
const ApiResponse = require('../../../../shared/utils/apiResponse');
const { HTTP_STATUS } = require('../../../../shared/utils/constants');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw {
          statusCode: HTTP_STATUS.CONFLICT,
          message: 'User with this email already exists'
        };
      }

      // Create user
      const user = new User({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone
      });

      await user.save();

      // Create user in Keycloak if configured
      let keycloakUserId = null;
      if (keycloakService.isConfigured()) {
        try {
          const keycloakUser = await keycloakService.createUser(userData);
          if (keycloakUser) {
            keycloakUserId = keycloakUser.keycloakUserId;
            user.keycloakUserId = keycloakUserId;
            await user.save();

            // Assign default role in Keycloak
            try {
              await keycloakService.assignRole(keycloakUserId, 'customer');
            } catch (error) {
              logger.warn('Failed to assign role in Keycloak:', error.message);
            }
          }
        } catch (error) {
          logger.error('Failed to create user in Keycloak, continuing with local user:', error.message);
          // Continue even if Keycloak fails
        }
      }

      // Assign default role (customer) in local DB
      const customerRole = await Role.findOne({ name: 'customer' });
      if (customerRole) {
        await UserRole.create({
          userId: user._id,
          roleId: customerRole._id
        });
      }

      // Get user roles
      const roles = await this.getUserRoles(user._id);

      // Generate tokens (use Keycloak token if available, otherwise JWT)
      let accessToken;
      let refreshToken;

      if (keycloakService.isConfigured() && keycloakUserId) {
        try {
          // Get token from Keycloak
          const keycloakToken = await keycloakService.getClientToken();
          accessToken = keycloakToken.access_token;
          refreshToken = keycloakToken.refresh_token || await tokenService.createRefreshToken(user._id).then(rt => rt.token);
        } catch (error) {
          logger.warn('Failed to get Keycloak token, falling back to JWT:', error.message);
          // Fallback to JWT
          const tokenPayload = generateTokenPayload(user, roles);
          accessToken = generateAccessToken(tokenPayload);
          refreshToken = await tokenService.createRefreshToken(user._id).then(rt => rt.token);
        }
      } else {
        // Use JWT if Keycloak not configured
        const tokenPayload = generateTokenPayload(user, roles);
        accessToken = generateAccessToken(tokenPayload);
        refreshToken = await tokenService.createRefreshToken(user._id).then(rt => rt.token);
      }

      // Publish user created event
      try {
        const eventBus = getEventBusInstance();
        await eventBus.publish(
          'user.events',
          EVENT_TYPES.USER_CREATED,
          {
            type: EVENT_TYPES.USER_CREATED,
            data: {
              userId: user._id.toString(),
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              createdAt: user.createdAt
            }
          }
        );
      } catch (error) {
        logger.error('Failed to publish user created event:', error);
        // Don't fail registration if event publishing fails
      }

      logger.info(`User registered: ${user.email}`);

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken: typeof refreshToken === 'string' ? refreshToken : refreshToken.token
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password, deviceInfo = {}) {
    try {
      // Find user with password
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (!user.isActive) {
        throw {
          statusCode: HTTP_STATUS.FORBIDDEN,
          message: 'Account is deactivated'
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: 'Invalid email or password'
        };
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Get user roles
      const roles = await this.getUserRoles(user._id);

      // Generate tokens
      const tokenPayload = generateTokenPayload(user, roles);
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = await tokenService.createRefreshToken(user._id, deviceInfo);

      // Publish login event
      try {
        const eventBus = getEventBusInstance();
        await eventBus.publish(
          'user.events',
          EVENT_TYPES.USER_LOGGED_IN,
          {
            type: EVENT_TYPES.USER_LOGGED_IN,
            data: {
              userId: user._id.toString(),
              email: user.email,
              timestamp: new Date().toISOString()
            }
          }
        );
      } catch (error) {
        logger.error('Failed to publish login event:', error);
      }

      logger.info(`User logged in: ${user.email}`);

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken: typeof refreshToken === 'string' ? refreshToken : refreshToken.token
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenString) {
    try {
      const refreshToken = await tokenService.findRefreshToken(refreshTokenString);
      if (!refreshToken) {
        throw {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: 'Invalid or expired refresh token'
        };
      }

      const user = await User.findById(refreshToken.userId);
      if (!user || !user.isActive) {
        throw {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: 'User not found or inactive'
        };
      }

      // Get user roles
      const roles = await this.getUserRoles(user._id);

      // Generate new access token
      const tokenPayload = generateTokenPayload(user, roles);
      const accessToken = generateAccessToken(tokenPayload);

      return {
        accessToken,
        refreshToken: refreshTokenString
      };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(refreshTokenString) {
    try {
      if (refreshTokenString) {
        await tokenService.revokeRefreshToken(refreshTokenString);
      }
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId) {
    try {
      await tokenService.revokeAllUserTokens(userId);
      return { message: 'Logged out from all devices successfully' };
    } catch (error) {
      logger.error('Logout all error:', error);
      throw error;
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId) {
    try {
      const userRoles = await UserRole.find({
        userId,
        isActive: true
      }).populate('roleId');

      return userRoles
        .map(ur => ur.roleId)
        .filter(role => role && role.isActive);
    } catch (error) {
      logger.error('Error getting user roles:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'User not found'
        };
      }
      return user;
    } catch (error) {
      logger.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'User not found'
        };
      }

      // Update allowed fields
      if (updateData.firstName) user.firstName = updateData.firstName;
      if (updateData.lastName) user.lastName = updateData.lastName;
      if (updateData.phone) user.phone = updateData.phone;

      await user.save();

      // Publish user updated event
      try {
        const eventBus = getEventBusInstance();
        await eventBus.publish(
          'user.events',
          EVENT_TYPES.USER_UPDATED,
          {
            type: EVENT_TYPES.USER_UPDATED,
            data: {
              userId: user._id.toString(),
              email: user.email,
              updatedFields: Object.keys(updateData),
              updatedAt: user.updatedAt
            }
          }
        );
      } catch (error) {
        logger.error('Failed to publish user updated event:', error);
      }

      return user;
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw {
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'User not found'
        };
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw {
          statusCode: HTTP_STATUS.UNAUTHORIZED,
          message: 'Current password is incorrect'
        };
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Revoke all refresh tokens (force re-login)
      await tokenService.revokeAllUserTokens(userId);

      logger.info(`Password changed for user: ${user.email}`);

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();

