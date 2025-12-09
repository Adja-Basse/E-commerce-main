require('dotenv').config();
const express = require('express');
const { connectEventBus } = require('./config/rabbitmq');
const userConsumer = require('./events/consumers/user.consumer');
const orderConsumer = require('./events/consumers/order.consumer');
const logger = require('../../../../shared/utils/logger');
const { SERVICE_PORTS } = require('../../../../shared/utils/constants');

const app = express();
const PORT = process.env.PORT || SERVICE_PORTS.NOTIFICATION_SERVICE || 3007;

// Metrics
const { metricsMiddleware, metricsEndpoint } = require('../../../shared/utils/metrics');
app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
});

// Initialize event consumers and start server
const startServer = async () => {
  try {
    // Connect to RabbitMQ
    await connectEventBus();
    
    // Initialize consumers
    await userConsumer.initialize();
    await orderConsumer.initialize();
    
    logger.info('Notification Service Consumers Initialized');

    // Start server (lightweight, mostly for Health/Metrics)
    app.listen(PORT, () => {
      logger.info(`Notification Service running on port ${PORT}`, {
        service: 'notification-service',
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
