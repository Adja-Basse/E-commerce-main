const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  image: String,
  sku: String
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: String, // Can be MongoDB ID or Keycloak ID
    index: true,
    // unique: true // A user should have one active cart? Or maybe multiple? Usually one.
    // Let's not enforce unique at schema level to allow for cart history/archived carts if needed, but for 'active' status it should be unique.
  },
  sessionId: {
    type: String,
    index: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

cartSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  
  // Recalculate totals
  if (this.items) {
    this.totalPrice = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    this.totalItems = this.items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  }
  
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
