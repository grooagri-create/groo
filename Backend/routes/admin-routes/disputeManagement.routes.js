const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const { getAdminDisputes, getAdminDisputeById, resolveDispute } = require('../../controllers/commonControllers/disputeController');

/**
 * Admin: Handle Disputes Management
 */

router.get('/', authenticate, isAdmin, getAdminDisputes);
router.get('/:id', authenticate, isAdmin, getAdminDisputeById);
router.patch('/:id/resolve', authenticate, isAdmin, resolveDispute);

module.exports = router;
