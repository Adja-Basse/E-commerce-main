const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response = ApiResponse.unauthorized('No token provided');
      return res.status(response.statusCode).json(response.toJSON());
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if Keycloak is configured
    if (process.env.KEYCLOAK_URL && process.env.KEYCLOAK_REALM) {
      try {
        const userInfoUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
        
        const userInfoResponse = await fetch(userInfoUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userInfoResponse.ok) {
          throw new Error('Keycloak validation failed');
        }

        const userInfo = await userInfoResponse.json();
        
        // Map Keycloak user info to expected format
        req.user = userInfo;
        req.userId = userInfo.sub;
        
        // Extract roles from realm_access or resource_access
        let roles = [];
        if (userInfo.realm_access && userInfo.realm_access.roles) {
          roles = userInfo.realm_access.roles;
        }
        
        // Map Keycloak roles to app roles ('admin', 'seller', 'customer')
        // This mapping depends on how roles are defined in Keycloak
        if (roles.includes('admin')) req.userRole = 'admin';
        else if (roles.includes('seller')) req.userRole = 'seller';
        else req.userRole = 'customer'; // Default/Fallback

        req.user.role = req.userRole; // For compatibility
        
        next();
        return;
      } catch (error) {
        logger.error('Keycloak authentication error:', error);
        // Fallthrough to try legacy JWT verification or fail
      }
    }

    // Legacy JWT Verification
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      req.userId = decoded.userId || decoded.id;
      req.userRole = decoded.role;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const response = ApiResponse.unauthorized('Token expired');
        return res.status(response.statusCode).json(response.toJSON());
      }
      
      if (error.name === 'JsonWebTokenError') {
        const response = ApiResponse.unauthorized('Invalid token');
        return res.status(response.statusCode).json(response.toJSON());
      }
      
      throw error;
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    const response = ApiResponse.serverError('Authentication failed');
    return res.status(response.statusCode).json(response.toJSON());
  }
};

/**
 * Middleware to check if user has required role(s)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const response = ApiResponse.unauthorized('Authentication required');
      return res.status(response.statusCode).json(response.toJSON());
    }

    const userRole = req.user.role || req.userRole;

    if (!allowedRoles.includes(userRole)) {
      logger.warn(`Unauthorized access attempt: User ${req.userId} with role ${userRole} tried to access ${req.path}`);
      const response = ApiResponse.forbidden('Insufficient permissions');
      return res.status(response.statusCode).json(response.toJSON());
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const secret = process.env.JWT_SECRET || 'your-secret-key';

      try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        req.userId = decoded.userId || decoded.id;
        req.userRole = decoded.role;
      } catch (error) {
        // Token invalid but continue without authentication
        logger.debug('Optional auth: Invalid token, continuing without auth');
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};

