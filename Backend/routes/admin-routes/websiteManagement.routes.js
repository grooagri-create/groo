const express = require('express');
const router = express.Router();
const websiteController = require('../../controllers/adminControllers/websiteManagementController');

// Blog CRUD
router.route('/blog')
  .get(websiteController.getBlogs)
  .post(websiteController.createBlog);

router.route('/blog/:id')
  .put(websiteController.updateBlog)
  .delete(websiteController.deleteBlog);

// Article CRUD
router.route('/article')
  .get(websiteController.getArticles)
  .post(websiteController.createArticle);

router.route('/article/:id')
  .put(websiteController.updateArticle)
  .delete(websiteController.deleteArticle);

// WebsiteReview CRUD
router.route('/review')
  .get(websiteController.getReviews)
  .post(websiteController.createReview);

router.route('/review/:id')
  .put(websiteController.updateReview)
  .delete(websiteController.deleteReview);

module.exports = router;
