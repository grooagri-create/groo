const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const {
    createSoilTestRequest,
    getMySoilTestRequests,
    payForSoilTestReport,
    verifySoilTestPayment
} = require('../../controllers/userControllers/soilTestController');

router.use(authenticate);

router.post('/request', createSoilTestRequest);
router.get('/my-requests', getMySoilTestRequests);
router.post('/pay/:id', payForSoilTestReport);
router.post('/verify-payment/:id', verifySoilTestPayment);

module.exports = router;
