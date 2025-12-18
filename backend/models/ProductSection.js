const mongoose = require('mongoose');

const productSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'deal-of-day',
      'cooking-essentials',
      'maximized-saving',
      'new-launches',
      'lowest-prices',
      'grab-or-gone',
      'you-may-like',
      'buy-again'
    ]
  },
  displayName: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🔥'
  },
  description: {
    type: String,
    default: ''
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grocery'
  }],
  filterCriteria: {
    // For dynamic sections (like "you-may-like", "buy-again")
    type: {
      type: String,
      enum: ['manual', 'auto', 'dynamic'],
      default: 'manual'
    },
    // Auto filter criteria
    category: String,
    minDiscount: Number,
    maxPrice: Number,
    minRating: Number,
    sortBy: {
      type: String,
      enum: ['price', 'rating', 'discount', 'newest', 'popular'],
      default: 'price'
    },
    limit: {
      type: Number,
      default: 10
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProductSection', productSectionSchema);

