const Product = require('../../models/Product');

/**
 * Admin: Get all products (including inactive)
 */
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('categoryId', 'title');
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
};

/**
 * Admin: Create new product
 */
const createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
    }
};

/**
 * Admin: Update product
 */
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
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
 * Admin: Delete product
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};

/**
 * Admin: Toggle product featured status
 */
const toggleFeatured = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.isFeatured = !product.isFeatured;
        await product.save();

        res.status(200).json({
            success: true,
            isFeatured: product.isFeatured,
            message: `Product ${product.isFeatured ? 'featured' : 'removed from featured'}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update product status' });
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured
};
