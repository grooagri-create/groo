const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: {
    type: String, // Silver, Gold, etc.
    required: [true, 'Plan name is required'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Plan price is required']
  },
  highlights: {
    type: [String], // Array of highlight strings e.g. ["Priority Support", "Genuine Parts"]
    default: []
  },
  validityDays: {
    type: Number,
    default: 30 // Default to 30 days if not specified
  },
  // Agri-specific discounts
  marketplaceDiscountPercentage: {
    type: Number,
    default: 0
  },
  rentalDiscountPercentage: {
    type: Number,
    default: 0
  },
  freeTransport: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
