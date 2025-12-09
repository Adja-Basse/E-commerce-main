const mongoose = require('mongoose');
const { STOCK_MOVEMENT_TYPES } = require('../../../../shared/utils/constants');

const stockMovementSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(STOCK_MOVEMENT_TYPES),
    index: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  previousReserved: {
    type: Number,
    default: 0
  },
  newReserved: {
    type: Number,
    default: 0
  },
  reference: {
    type: String,
    trim: true,
    index: true
  },
  referenceType: {
    type: String,
    enum: ['order', 'return', 'adjustment', 'purchase', 'other'],
    default: 'other'
  },
  reason: {
    type: String,
    trim: true
  },
  performedBy: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
stockMovementSchema.index({ productId: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ reference: 1 });
stockMovementSchema.index({ createdAt: -1 });

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

module.exports = StockMovement;

