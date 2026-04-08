const express = require('express');
const router = express.Router();
const { 
  getPublicEquipment, 
  getPublicEquipmentById, 
  checkAvailability 
} = require('../../controllers/publicControllers/publicEquipmentController');

// Public routes - no authentication required
router.get('/', getPublicEquipment);
router.get('/:id', getPublicEquipmentById);
router.get('/:id/availability', checkAvailability);

module.exports = router;
