const express = require('express');
const router = express.Router();
const { getProducts, getProductDetails } = require('../../controllers/commonControllers/productController');

// Publicly available products
router.get('/', getProducts);
router.get('/:id', getProductDetails);

module.exports = router;
