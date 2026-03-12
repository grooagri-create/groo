const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleFeatured
} = require('../../controllers/adminControllers/productController');

// All product management routes require admin authentication
router.use(authenticate, isAdmin);

router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/toggle-featured', toggleFeatured);

module.exports = router;
