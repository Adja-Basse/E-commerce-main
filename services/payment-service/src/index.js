require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./config/database');
const { connectEventBus } = require('./config/rabbitmq');
const paymentRoutes = require('./routes/payment.routes');
const { errorHandler, notFoundHandler } = require('../../../../shared/middleware/errorHandler');
const logger = require('../../../../shared/utils/logger');
const { SERVICE_PORTS } = require('../../../../shared/utils/constants');

const app = express();
const PORT = process.env.PORT || SERVICE_PORTS.PAYMENT_SERVICE || 3006;

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
    service: 'payment-service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      payments: '/api/payments'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/payments', paymentRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('MongoDB connected');

    // Connect to RabbitMQ
    await connectEventBus();
    logger.info('RabbitMQ connected');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Payment Service running on port ${PORT}`, {
        service: 'payment-service',
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
