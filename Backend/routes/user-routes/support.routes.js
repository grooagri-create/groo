const express = require('express');
const router = express.Router();
const { submitQuery } = require('../../controllers/commonControllers/supportController');
const { authenticate } = require('../../middleware/authMiddleware');

router.post('/submit', authenticate, submitQuery);

module.exports = router;
