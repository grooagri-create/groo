const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    content: {
        type: String, // Rich HTML content
        required: true,
    },
    title: {
        type: String,
        default: 'About Us'
    }
}, { timestamps: true });

module.exports = mongoose.model('About', aboutSchema);
