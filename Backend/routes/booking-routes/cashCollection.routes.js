const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor, isWorker } = require('../../middleware/roleMiddleware');
const {
  initiateCashCollection,
  confirmCashCollection,
  customerConfirmPayment,
  getCashCollectionStatus
} = require('../../controllers/bookingControllers/cashCollectionController');

// All routes require authentication
router.use(authenticate);

// Vendor/Worker routes
router.post('/:id/initiate', initiateCashCollection);
router.post('/:id/confirm', confirmCashCollection);

// Customer route
router.post('/:id/customer-confirm', customerConfirmPayment);

// Status route (shared)
router.get('/:id/status', getCashCollectionStatus);

module.exports = router;
