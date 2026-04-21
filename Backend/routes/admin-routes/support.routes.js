const express = require('express');
const router = express.Router();
const { getAdminQueries, respondToQuery } = require('../../controllers/commonControllers/supportController');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

router.get('/all', authenticate, isAdmin, getAdminQueries);
router.put('/respond/:id', authenticate, isAdmin, respondToQuery);

module.exports = router;
