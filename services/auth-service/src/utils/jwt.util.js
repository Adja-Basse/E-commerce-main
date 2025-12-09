const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'ecommerce-auth-service',
    audience: 'ecommerce-api'
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'ecommerce-auth-service',
      audience: 'ecommerce-api'
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Decode token without verification (for debugging)
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Generate token payload
 */
const generateTokenPayload = (user, roles = []) => {
  return {
    userId: user._id.toString(),
    email: user.email,
    role: roles.length > 0 ? roles[0].name : 'customer',
    roles: roles.map(r => r.name),
    isEmailVerified: user.isEmailVerified
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  decodeToken,
  generateTokenPayload,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN
};

