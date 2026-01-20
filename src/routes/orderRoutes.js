const express = require('express');
const { body } = require('express-validator');
const { createOrder, getOrders, getOrderById } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/',
  body('shipping_address').trim().isLength({ min: 10 }),
  createOrder
);

router.get('/', getOrders);
router.get('/:id', getOrderById);

module.exports = router;