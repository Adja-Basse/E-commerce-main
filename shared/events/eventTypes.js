// Event Types for Event-Driven Architecture
const EVENT_TYPES = {
  // User Events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',

  // Product Events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  PRODUCT_PRICE_CHANGED: 'product.price_changed',

  // Stock Events
  STOCK_UPDATED: 'stock.updated',
  STOCK_RESERVED: 'stock.reserved',
  STOCK_RELEASED: 'stock.released',
  STOCK_LOW: 'stock.low',
  STOCK_OUT: 'stock.out',

  // Cart Events
  CART_CREATED: 'cart.created',
  CART_UPDATED: 'cart.updated',
  CART_ITEM_ADDED: 'cart.item_added',
  CART_ITEM_REMOVED: 'cart.item_removed',
  CART_CLEARED: 'cart.cleared',

  // Order Events
  ORDER_CREATED: 'order.created',
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_PROCESSING: 'order.processing',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_FAILED: 'order.failed',

  // Payment Events
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_PROCESSING: 'payment.processing',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_CANCELLED: 'payment.cancelled',

  // Return Events
  RETURN_REQUESTED: 'return.requested',
  RETURN_APPROVED: 'return.approved',
  RETURN_REJECTED: 'return.rejected',
  RETURN_PROCESSING: 'return.processing',
  RETURN_COMPLETED: 'return.completed',
  RETURN_CANCELLED: 'return.cancelled',

  // Notification Events
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_FAILED: 'notification.failed',
  EMAIL_SENT: 'email.sent',
  SMS_SENT: 'sms.sent',
  PUSH_SENT: 'push.sent'
};

// Event Schemas
const EVENT_SCHEMAS = {
  [EVENT_TYPES.USER_CREATED]: {
    userId: 'string',
    email: 'string',
    role: 'string',
    createdAt: 'string'
  },
  [EVENT_TYPES.ORDER_CREATED]: {
    orderId: 'string',
    userId: 'string',
    totalAmount: 'number',
    items: 'array',
    createdAt: 'string'
  },
  [EVENT_TYPES.PAYMENT_COMPLETED]: {
    paymentId: 'string',
    orderId: 'string',
    amount: 'number',
    method: 'string',
    status: 'string',
    completedAt: 'string'
  },
  [EVENT_TYPES.STOCK_UPDATED]: {
    productId: 'string',
    quantity: 'number',
    reserved: 'number',
    available: 'number',
    updatedAt: 'string'
  }
};

module.exports = {
  EVENT_TYPES,
  EVENT_SCHEMAS
};

