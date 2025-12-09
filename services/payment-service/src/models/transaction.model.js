const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../../../../shared/utils/constants');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  orderId: {
    type: String, // Can be ID or Order Number
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String, // e.g., 'stripe', 'paypal'
    required: true
  },
  providerTransactionId: {
    type: String
  },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING,
    index: true
  },
  errorMessage: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
