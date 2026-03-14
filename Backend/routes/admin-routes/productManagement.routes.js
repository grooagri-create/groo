const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
    getAllProducts,
    getVendorEquipment,
    approveEquipment,
    rejectEquipment,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured
} = require('../../controllers/adminControllers/productController');

// All product management routes require admin authentication
router.use(authenticate, isAdmin);

// Agri Marketplace (admin-created products)
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/toggle-featured', toggleFeatured);

// Vendor Equipment Approval (plan2.txt Step 4)
router.get('/vendor-equipment', getVendorEquipment);
router.post('/vendor-equipment/:id/approve', approveEquipment);
router.post('/vendor-equipment/:id/reject', rejectEquipment);

module.exports = router;

