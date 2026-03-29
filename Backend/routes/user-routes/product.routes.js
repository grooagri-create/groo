const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const {
    getApprovedProducts,
    getProductDetails,
    placeOrder,
    payPlatformFee,
    getMyOrders,
    getOrderById
} = require('../../controllers/userControllers/productController');

// ✅ PUBLIC routes — No auth required (browsing marketplace)
router.get('/marketplace', getApprovedProducts);
router.get('/products/:id', getProductDetails);

// 🔒 PROTECTED routes — Auth required (ordering & tracking)
router.post('/orders', authenticate, placeOrder);
router.get('/orders/:id', authenticate, getOrderById);
router.post('/orders/:id/pay-platform-fee', authenticate, payPlatformFee);
router.get('/my-orders', authenticate, getMyOrders);

module.exports = router;
