const express = require('express');
const router = express.Router();
const websiteController = require('../../controllers/adminControllers/websiteManagementController');
const publicFooterController = require('../../controllers/publicControllers/publicFooterController');

// Public endpoints to fetch content
router.get('/footer', publicFooterController.getPublicFooterContent);
router.get('/blogs', websiteController.getBlogs);
router.get('/articles', websiteController.getArticles);
router.get('/reviews', websiteController.getReviews);

module.exports = router;
