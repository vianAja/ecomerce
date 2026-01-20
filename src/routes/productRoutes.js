const express = require('express');
const { getAllProducts, getProductById, getCategories } = require('../controllers/productController');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

module.exports = router;