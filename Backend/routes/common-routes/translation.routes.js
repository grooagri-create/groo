const express = require('express');
const router = express.Router();
const translationController = require('../../controllers/commonControllers/translationController');

/**
 * Route for individual translation
 */
router.post('/translate', translationController.translateText);

/**
 * Route for batch translation
 */
router.post('/batch', translationController.translateBatch);

/**
 * Route for object translation
 */
router.post('/object', translationController.translateObject);

module.exports = router;
