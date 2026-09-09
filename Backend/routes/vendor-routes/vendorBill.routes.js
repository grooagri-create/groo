const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
  createOrUpdateBill,
  getBillByBookingId,
  downloadInvoice
} = require('../../controllers/vendorControllers/vendorBillController');

// Bill Routes
router.post('/bookings/:bookingId/bill', authenticate, isVendor, createOrUpdateBill);
router.get('/bookings/:bookingId/bill', authenticate, isVendor, getBillByBookingId);
router.get('/bookings/:bookingId/bill/download', authenticate, isVendor, downloadInvoice);

module.exports = router;
