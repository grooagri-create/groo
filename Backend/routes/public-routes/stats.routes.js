const express = require('express');
const router = express.Router();
const statsController = require('../../controllers/publicControllers/statsController');

router.get('/', statsController.getPublicStats);

module.exports = router;
