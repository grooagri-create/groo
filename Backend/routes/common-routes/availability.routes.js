const express = require('express');
const router = express.Router();
const { getAvailableSlots } = require('../../controllers/commonControllers/availabilityController');
const { authenticate } = require('../../middleware/authMiddleware');

// Get available slots for a service
router.get('/', authenticate, getAvailableSlots);

module.exports = router;
