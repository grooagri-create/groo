const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isVendor } = require('../../middleware/roleMiddleware');
const {
    getMaintenanceSchedules,
    addMaintenanceSchedule,
    deleteMaintenanceSchedule
} = require('../../controllers/vendorControllers/maintenanceController');

router.get('/', authenticate, isVendor, getMaintenanceSchedules);
router.post('/', authenticate, isVendor, addMaintenanceSchedule);
router.delete('/:id', authenticate, isVendor, deleteMaintenanceSchedule);

module.exports = router;
