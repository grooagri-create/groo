const express = require('express');
const router = express.Router();
const { raiseDispute } = require('../../controllers/commonControllers/disputeController');
const { authenticate } = require('../../middleware/authMiddleware');

/**
 * Common: Raise a Dispute (User/Vendor/Worker)
 */

router.post('/', authenticate, raiseDispute);

module.exports = router;
