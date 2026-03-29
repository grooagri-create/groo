const Product = require('../../models/Product');
const EcommerceOrder = require('../../models/EcommerceOrder');
const Transaction = require('../../models/Transaction');
const User = require('../../models/User');

/**
 * User: Get all approved products (Marketplace)
 */
const getApprovedProducts = async (req, res) => {
    try {
        const { categoryId, query } = req.query;
        let filter = { 
            approvalStatus: 'approved', 
            status: 'active', 
            stock: { $gt: 0 } 
        };

        if (categoryId) filter.categoryId = categoryId;
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        const products = await Product.find(filter)
            .populate('categoryId', 'title imageUrl')
            .populate('vendorId', 'businessName name profilePhoto')
            .sort({ isFeatured: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
};

const getProductDetails = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('categoryId', 'title')
            .populate('vendorId', 'businessName phone profilePhoto');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
};

/**
 * User: Create an order (Calculates Platform Fee vs Vendor Balance)
 */
const placeOrder = async (req, res) => {
    try {
        const { productId, quantity, shippingAddress, paymentMethod } = req.body;
        
        const product = await Product.findById(productId);
        if (!product || product.approvalStatus !== 'approved' || product.stock < quantity) {
            return res.status(400).json({ success: false, message: 'Product unavailable or out of stock' });
        }

        const itemsTotal = product.price * quantity;
        const adminCommission = (itemsTotal * (product.commissionPercentage / 100));
        const gstAmount = (itemsTotal * (product.gstPercentage / 100));
        const platformFee = adminCommission + gstAmount;
        const vendorBalance = itemsTotal - adminCommission;

        const order = new EcommerceOrder({
            userId: req.user._id,
            vendorId: product.vendorId,
            items: [{
                productId: product._id,
                name: product.title,
                quantity,
                price: product.price,
                bagWeight: product.bagWeight,
                subtotal: itemsTotal
            }],
            pricing: {
                itemsTotal,
                adminCommission,
                gstAmount,
                platformFee,
                vendorBalance
            },
            shippingAddress,
            paymentMethod: paymentMethod || 'wallet'
        });

        await order.save();
        res.status(201).json({ 
            success: true, 
            data: order, 
            message: 'Order created. Please pay Platform Fee to confirm.',
            platformFee: order.pricing.platformFee,
            vendorPayAmount: order.pricing.vendorBalance
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * User: Pay Platform Fee (Admin portion) via Wallet
 */
const payPlatformFee = async (req, res) => {
    try {
        const order = await EcommerceOrder.findById(req.params.id);
        if (!order || order.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Order already paid or not found' });
        }

        const user = await User.findById(req.user._id);
        const amountToPay = order.pricing.platformFee;

        if (user.walletBalance < amountToPay) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient balance in wallet',
                needsOnlinePayment: true 
            });
        }

        // Deduct from User Wallet
        user.walletBalance -= amountToPay;
        await user.save();

        // Create Transaction Record
        const transaction = new Transaction({
            userId: user._id,
            type: 'platform_fee',
            amount: amountToPay,
            status: 'completed',
            paymentMethod: 'wallet',
            description: `Platform fee (Comm+GST) for Ecommerce Order: ${order._id.toString().slice(-8)}`,
            metadata: { orderId: order._id }
        });
        await transaction.save();

        // Update Order Status
        order.paymentStatus = 'paid';
        order.deliveryStatus = 'ordered'; // Confirmation trigger
        order.adminTransactionId = transaction._id;
        await order.save();

        // Reduce Stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Order confirmed! Platform fee paid.', 
            data: order 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await EcommerceOrder.find({ userId: req.user._id })
            .populate('vendorId', 'businessName phone')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('[GetMyOrders Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders: ' + error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await EcommerceOrder.findById(req.params.id)
            .populate('vendorId', 'businessName phone');
        if (!order || order.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error('[GetOrderById Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order: ' + error.message });
    }
};

module.exports = {
    getApprovedProducts,
    getProductDetails,
    placeOrder,
    payPlatformFee,
    getMyOrders,
    getOrderById
};
