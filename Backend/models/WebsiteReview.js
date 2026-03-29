const mongoose = require('mongoose');

const websiteReviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userRole: { type: String }, // e.g. "Farmer", "Vendor"
  rating: { type: Number, min: 1, max: 5, default: 5 },
  comment: { type: String, required: true },
  userImage: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteReview', websiteReviewSchema);
