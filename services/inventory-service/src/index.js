require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./config/database');
const { connectEventBus } = require('./config/rabbitmq');
const orderConsumer = require('./events/consumers/order.consumer');
const returnConsumer = require('./events/consumers/return.consumer');
const stockRoutes = require('./routes/stock.routes');
const { errorHandler, notFoundHandler } = require('../../../../shared/middleware/errorHandler');
const logger = require('../../../../shared/utils/logger');
const { SERVICE_PORTS } = require('../../../../shared/utils/constants');

const app = express();
const PORT = process.env.PORT || SERVICE_PORTS.INVENTORY_SERVICE;

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
    service: 'inventory-service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      stock: '/api/stock'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'inventory-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/stock', stockRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and event bus, then start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('MongoDB connected');

    // Connect to RabbitMQ and initialize consumers
    await connectEventBus();
    await orderConsumer.initialize();
    await returnConsumer.initialize();
    logger.info('Event consumers initialized');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Inventory Service running on port ${PORT}`, {
        service: 'inventory-service',
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
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

