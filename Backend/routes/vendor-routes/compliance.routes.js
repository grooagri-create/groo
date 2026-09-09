const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
    getComplianceStatus,
    updateComplianceDocument
} = require('../../controllers/vendorControllers/complianceController');

router.get('/status', authenticate, isVendor, getComplianceStatus);
router.post('/update', authenticate, isVendor, updateComplianceDocument);

module.exports = router;
