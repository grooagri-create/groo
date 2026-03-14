const Product = require('../../models/Product');

/**
 * Admin: Get all products (Agri Marketplace)
 * Only shows Admin-created products (vendorId = null)
 */
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ vendorId: null }).populate('categoryId', 'title');
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
};

/**
 * Admin: Get all vendor-added equipment (plan2.txt Step 4)
 * Shows equipment submitted by vendors, filterable by approvalStatus
 */
const getVendorEquipment = async (req, res) => {
    try {
        const { approvalStatus } = req.query;
        const query = { vendorId: { $ne: null } };
        if (approvalStatus) query.approvalStatus = approvalStatus;

        const equipment = await Product.find(query)
            .populate('categoryId', 'title')
            .populate('vendorId', 'name businessName phone profilePhoto');
        res.status(200).json({ success: true, data: equipment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch vendor equipment' });
    }
};

/**
 * Admin: Approve vendor equipment (plan2.txt Step 4)
 */
const approveEquipment = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, vendorId: { $ne: null } },
            { approvalStatus: 'approved', rejectionReason: null },
            { new: true }
        );
        if (!product) return res.status(404).json({ success: false, message: 'Equipment not found' });
        res.status(200).json({ success: true, message: 'Equipment approved. Now live on farmer app.', data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to approve equipment' });
    }
};

/**
 * Admin: Reject vendor equipment (plan2.txt Step 4)
 */
const rejectEquipment = async (req, res) => {
    try {
        const { reason } = req.body;
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, vendorId: { $ne: null } },
            { approvalStatus: 'rejected', rejectionReason: reason || 'Not meeting platform standards' },
            { new: true }
        );
        if (!product) return res.status(404).json({ success: false, message: 'Equipment not found' });
        res.status(200).json({ success: true, message: 'Equipment rejected.', data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reject equipment' });
    }
};

/**
 * Admin: Create new product (Agri Marketplace - admin only)
 */
const createProduct = async (req, res) => {
    try {
        const product = new Product({ ...req.body, vendorId: null, approvalStatus: 'approved' });
        await product.save();
        res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
    }
};

/**
 * Admin: Update product
 */
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
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
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
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
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        product.isFeatured = !product.isFeatured;
        await product.save();
        res.status(200).json({ success: true, isFeatured: product.isFeatured, message: `Product ${product.isFeatured ? 'featured' : 'removed from featured'}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update product status' });
    }
};

module.exports = {
    getAllProducts,
    getVendorEquipment,
    approveEquipment,
    rejectEquipment,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured
};
