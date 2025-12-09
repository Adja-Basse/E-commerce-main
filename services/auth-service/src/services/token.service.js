const RefreshToken = require('../models/refreshToken.model');
const { generateRefreshToken, JWT_REFRESH_EXPIRES_IN } = require('../utils/jwt.util');
const logger = require('../../../../shared/utils/logger');

class TokenService {
  /**
   * Create a new refresh token
   */
  async createRefreshToken(userId, deviceInfo = {}) {
    try {
      const token = generateRefreshToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(JWT_REFRESH_EXPIRES_IN.replace('d', '')));

      const refreshToken = new RefreshToken({
        token,
        userId,
        expiresAt,
        deviceInfo
      });

      await refreshToken.save();
      return refreshToken;
    } catch (error) {
      logger.error('Error creating refresh token:', error);
      throw error;
    }
  }

  /**
   * Find refresh token by token string
   */
  async findRefreshToken(token) {
    try {
      return await RefreshToken.findOne({
        token,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      }).populate('userId');
    } catch (error) {
      logger.error('Error finding refresh token:', error);
      throw error;
    }
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(token) {
    try {
      const refreshToken = await RefreshToken.findOne({ token });
      if (refreshToken) {
        refreshToken.isRevoked = true;
        refreshToken.revokedAt = new Date();
        await refreshToken.save();
      }
      return refreshToken;
    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      throw error;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId) {
    try {
      const result = await RefreshToken.updateMany(
        { userId, isRevoked: false },
        {
          $set: {
            isRevoked: true,
            revokedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      logger.error('Error revoking all user tokens:', error);
      throw error;
    }
  }

  /**
   * Delete expired tokens
   */
  async deleteExpiredTokens() {
    try {
      const result = await RefreshToken.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      logger.info(`Deleted ${result.deletedCount} expired refresh tokens`);
      return result;
    } catch (error) {
      logger.error('Error deleting expired tokens:', error);
      throw error;
    }
  }
}

module.exports = new TokenService();

