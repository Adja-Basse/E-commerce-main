require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./config/database');
const { connectEventBus } = require('./config/rabbitmq');
const authRoutes = require('./routes/auth.routes');
const { errorHandler, notFoundHandler } = require('../../../../shared/middleware/errorHandler');
const logger = require('../../../../shared/utils/logger');
const { SERVICE_PORTS } = require('../../../../shared/utils/constants');
const Role = require('./models/role.model');

const app = express();
const PORT = process.env.PORT || SERVICE_PORTS.AUTH_SERVICE;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Metrics
const { metricsMiddleware, metricsEndpoint } = require('../../../shared/utils/metrics');
app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'auth-service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/auth',
      docs: 'See API documentation'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    service: 'auth-service',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      refresh: 'POST /api/auth/refresh',
      logout: 'POST /api/auth/logout',
      me: 'GET /api/auth/me',
      profile: 'PUT /api/auth/profile',
      changePassword: 'PUT /api/auth/change-password',
      roles: 'GET /api/auth/roles'
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and event bus, then start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('MongoDB connected');

    // Connect to RabbitMQ
    await connectEventBus();
    logger.info('RabbitMQ connected');

    // Initialize default roles if they don't exist
    await initializeDefaultRoles();

    // Start server
    app.listen(PORT, () => {
      logger.info(`Auth Service running on port ${PORT}`, {
        service: 'auth-service',
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Initialize default roles
const initializeDefaultRoles = async () => {
  try {
    const defaultRoles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'customer', description: 'Regular customer' },
      { name: 'seller', description: 'Product seller' },
      { name: 'moderator', description: 'Content moderator' }
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        logger.info(`Created default role: ${roleData.name}`);
      }
    }
  } catch (error) {
    logger.error('Error initializing default roles:', error);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;

