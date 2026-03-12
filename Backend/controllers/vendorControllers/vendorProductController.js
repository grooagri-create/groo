const Product = require('../../models/Product');

/**
 * Vendor: Get my products
 */
const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ vendorId: req.user.id }).populate('categoryId', 'title');
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
};

/**
 * Vendor: Add product to my store
 */
const addProduct = async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            vendorId: req.user.id,
            isFeatured: false // Vendors cannot feature their own products on Home Page without Admin approval
        });
        await product.save();
        res.status(201).json({
            success: true,
            data: product,
            message: 'Product added to your store'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to add product' });
    }
};

/**
 * Vendor: Update my product
 */
const updateMyProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found in your store' });
        }

        res.status(200).json({
            success: true,
            data: product,
            message: 'Product updated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
};

/**
 * Vendor: Delete my product
 */
const deleteMyProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, vendorId: req.user.id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found in your store' });
        }
        res.status(200).json({
            success: true,
            message: 'Product removed from your store'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};

module.exports = {
    getMyProducts,
    addProduct,
    updateMyProduct,
    deleteMyProduct
};
