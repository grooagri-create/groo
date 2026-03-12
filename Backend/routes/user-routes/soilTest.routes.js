const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const {
    createSoilTestRequest,
    getMySoilTestRequests
} = require('../../controllers/userControllers/soilTestController');

router.use(authenticate);

router.post('/request', createSoilTestRequest);
router.get('/my-requests', getMySoilTestRequests);

module.exports = router;
