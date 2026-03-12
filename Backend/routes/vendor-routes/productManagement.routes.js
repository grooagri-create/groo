const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
    getMyProducts,
    addProduct,
    updateMyProduct,
    deleteMyProduct
} = require('../../controllers/vendorControllers/vendorProductController');

// All vendor product management routes require vendor authentication
router.use(authenticate, isVendor);

router.get('/my-products', getMyProducts);
router.post('/add-product', addProduct);
router.put('/update-product/:id', updateMyProduct);
router.delete('/delete-product/:id', deleteMyProduct);

module.exports = router;
