const mongoose = require('mongoose');

/**
 * Product Model
 * Represents physical agricultural inputs like Seeds, Fertilizers, Pesticides
 */
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a product title'],
        trim: true,
        index: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required'],
        index: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // null means Admin/Central Store product
        index: true
    },
    brandName: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    discountPrice: {
        type: Number,
        default: null
    },
    unit: {
        type: String,
        required: [true, 'Unit (kg, bag, litre) is required'],
        default: 'bag'
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    gstPercentage: {
        type: Number,
        default: 5 // Agriculture usually has lower GST
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock'],
        default: 'active',
        index: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    specifications: [{
        name: String,
        value: String
    }]
}, {
    timestamps: true
});

// Generate slug
productSchema.pre('validate', async function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);
