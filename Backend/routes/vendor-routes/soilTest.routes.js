const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
    getMyRequests,
    updateRequestStatus,
    uploadReport,
    rejectRequest
} = require('../../controllers/vendorControllers/vendorSoilTestController');

router.use(authenticate, isVendor);

router.get('/my-requests', getMyRequests);
router.put('/:id/status', updateRequestStatus);
router.post('/:id/report', uploadReport);
router.post('/:id/reject', rejectRequest);

module.exports = router;
