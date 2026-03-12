const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');
const {
    getAllSoilTestRequests,
    updateSoilTestRequest,
    deleteSoilTestRequest
} = require('../../controllers/adminControllers/soilTestController');

router.use(authenticate, isAdmin);

router.get('/soil-tests', getAllSoilTestRequests);
router.put('/soil-tests/:id', updateSoilTestRequest);
router.delete('/soil-tests/:id', deleteSoilTestRequest);

module.exports = router;
