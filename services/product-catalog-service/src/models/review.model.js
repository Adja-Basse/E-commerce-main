const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  images: [{
    url: String,
    alt: String
  }]
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, rating: 1 });
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });

// Update product rating when review is saved
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const reviews = await Review.find({ 
    product: this.product, 
    isApproved: true 
  });
  
  if (reviews.length > 0) {
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(this.product, {
      'rating.average': Math.round(averageRating * 10) / 10,
      'rating.count': reviews.length
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

