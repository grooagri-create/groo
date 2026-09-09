const express = require('express');
const router = express.Router();
const { getWeatherData } = require('../../controllers/commonControllers/weatherController');
const { authenticate } = require('../../middleware/authMiddleware');

// Weather routes (require auth so we know the user/farmer)
router.get('/', authenticate, getWeatherData);

module.exports = router;
