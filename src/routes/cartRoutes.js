const express = require('express');
const { body } = require('express-validator');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCart);

router.post('/',
  body('product_id').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1 }),
  addToCart
);

router.put('/:id',
  body('quantity').isInt({ min: 1 }),
  updateCartItem
);

router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

module.exports = router;