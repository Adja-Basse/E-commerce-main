require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8000;

// Security & Utilities
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Rate Limiting

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 100 requests per 15 minutes (Relaxed for dev)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Metrics
const { metricsMiddleware, metricsEndpoint } = require('../../shared/utils/metrics');
app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Proxy Routes Configuration
const routes = {
  '/api/auth': { target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001', changeOrigin: true },
  '/api/users': { target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001', changeOrigin: true }, // User management often in auth service
  '/api/products': { target: process.env.PRODUCT_SERVICE_URL || 'http://product-catalog-service:3002', changeOrigin: true },
  '/api/categories': { target: process.env.PRODUCT_SERVICE_URL || 'http://product-catalog-service:3002', changeOrigin: true },
  '/api/suppliers': { target: process.env.PRODUCT_SERVICE_URL || 'http://product-catalog-service:3002', changeOrigin: true },
  '/api/reviews': { target: process.env.PRODUCT_SERVICE_URL || 'http://product-catalog-service:3002', changeOrigin: true },
  '/api/stock': { target: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3003', changeOrigin: true },
  '/api/cart': { target: process.env.CART_SERVICE_URL || 'http://cart-service:3004', changeOrigin: true },
  '/api/orders': { target: process.env.ORDER_SERVICE_URL || 'http://order-service:3005', changeOrigin: true },
  '/api/payments': { target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3006', changeOrigin: true },
};

// Setup Proxies
Object.keys(routes).forEach(path => {
  app.use(path, createProxyMiddleware(routes[path]));
});

// Start Gateway
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
