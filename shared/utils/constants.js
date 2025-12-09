// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Order Status
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// Payment Methods
const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  CASH_ON_DELIVERY: 'cash_on_delivery'
};

// Stock Movement Types
const STOCK_MOVEMENT_TYPES = {
  IN: 'in',
  OUT: 'out',
  RESERVED: 'reserved',
  RELEASED: 'released',
  ADJUSTMENT: 'adjustment'
};

// Return Status
const RETURN_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Notification Types
const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app'
};

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  SELLER: 'seller',
  MODERATOR: 'moderator'
};

// Service Ports
const SERVICE_PORTS = {
  GATEWAY: 3000,
  AUTH_SERVICE: 3001,
  PRODUCT_CATALOG_SERVICE: 3002,
  INVENTORY_SERVICE: 3003,
  CART_SERVICE: 3004,
  ORDER_SERVICE: 3005,
  PAYMENT_SERVICE: 3006,
  RETURN_SERVICE: 3007,
  NOTIFICATION_SERVICE: 3008,
  CHATBOT_SERVICE: 3009
};

// RabbitMQ Queues
const QUEUES = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  PAYMENT_PROCESSED: 'payment.processed',
  PAYMENT_FAILED: 'payment.failed',
  STOCK_UPDATED: 'stock.updated',
  STOCK_LOW: 'stock.low',
  CART_UPDATED: 'cart.updated',
  RETURN_REQUESTED: 'return.requested',
  RETURN_APPROVED: 'return.approved',
  NOTIFICATION_SEND: 'notification.send'
};

// RabbitMQ Exchanges
const EXCHANGES = {
  USER_EVENTS: 'user.events',
  ORDER_EVENTS: 'order.events',
  PAYMENT_EVENTS: 'payment.events',
  STOCK_EVENTS: 'stock.events',
  CART_EVENTS: 'cart.events',
  RETURN_EVENTS: 'return.events',
  NOTIFICATION_EVENTS: 'notification.events'
};

module.exports = {
  HTTP_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  STOCK_MOVEMENT_TYPES,
  RETURN_STATUS,
  NOTIFICATION_TYPES,
  USER_ROLES,
  SERVICE_PORTS,
  QUEUES,
  EXCHANGES
};

