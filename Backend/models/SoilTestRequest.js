const mongoose = require('mongoose');

const soilTestRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    landSize: {
        type: String,
        required: [true, 'Land size is required']
    },
    location: {
        type: String,
        required: [true, 'Location/Address is required']
    },
    cropType: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending',
        index: true
    },
    adminNotes: {
        type: String,
        default: ''
    },
    reportUrl: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SoilTestRequest', soilTestRequestSchema);
