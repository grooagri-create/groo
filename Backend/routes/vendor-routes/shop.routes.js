const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
    registerShop,
    getShopStatus
} = require('../../controllers/vendorControllers/vendorShopController');

// All vendor shop management routes require vendor authentication
router.use(authenticate, isVendor);

// Shop Registration
router.post('/register', registerShop);
router.get('/status', getShopStatus);

module.exports = router;
