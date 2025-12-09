const mongoose = require('mongoose');
const { STOCK_MOVEMENT_TYPES } = require('../../../../shared/utils/constants');

const stockSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reserved: {
    type: Number,
    min: 0,
    default: 0
  },
  available: {
    type: Number,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    min: 0,
    default: 10
  },
  reorderPoint: {
    type: Number,
    min: 0,
    default: 20
  },
  reorderQuantity: {
    type: Number,
    min: 0,
    default: 50
  },
  location: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
stockSchema.index({ productId: 1 });
stockSchema.index({ quantity: 1 });
stockSchema.index({ available: 1 });
stockSchema.index({ isActive: 1 });

// Virtual for isLowStock
stockSchema.virtual('isLowStock').get(function() {
  return this.available <= this.lowStockThreshold;
});

// Virtual for needsReorder
stockSchema.virtual('needsReorder').get(function() {
  return this.available <= this.reorderPoint;
});

// Calculate available stock before saving
stockSchema.pre('save', function(next) {
  this.available = Math.max(0, this.quantity - this.reserved);
  next();
});

// Ensure virtuals are serialized
stockSchema.set('toJSON', {
  virtuals: true
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;

