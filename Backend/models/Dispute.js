const mongoose = require('mongoose');

/**
 * Dispute Model
 * Stores complaints raised by Farmers (Users) or Vendors (Owners) for bookings
 */
const disputeSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        index: true
    },
    raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    raisedByRole: {
        type: String,
        enum: ['USER', 'VENDOR'],
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: [
            'Quality Issue',
            'Delay / Late Arrival',
            'Payment Dispute',
            'No Show',
            'Poor Driver Behavior',
            'Other'
        ]
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    attachments: [{
        type: String // Cloudinary URLs
    }],
    status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved', 'dismissed'],
        default: 'pending',
        index: true
    },
    resolutionNotes: {
        type: String,
        trim: true,
        default: ''
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin who resolved it
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Dispute', disputeSchema);
