const pool = require('../config/database');
const cacheService = require('../services/cacheService');

const getCart = async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `cart:${userId}`;

  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({ cart: cached, source: 'cache' });
    }

    const cartResult = await pool.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return res.json({ cart: { items: [], total: 0 }, source: 'database' });
    }

    const cartId = cartResult.rows[0].id;
    const itemsResult = await pool.query(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url,
             (ci.quantity * p.price) as subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);

    const total = itemsResult.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const cart = { items: itemsResult.rows, total };

    await cacheService.set(cacheKey, cart);
    res.json({ cart, source: 'database' });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  try {
    let cartResult = await pool.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );

    let cartId;
    if (cartResult.rows.length === 0) {
      const newCart = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cartResult.rows[0].id;
    }

    const productCheck = await pool.query(
      'SELECT stock FROM products WHERE id = $1',
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (productCheck.rows[0].stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const existingItem = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, product_id]
    );

    if (existingItem.rows.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, existingItem.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, product_id, quantity]
      );
    }

    await cacheService.del(`cart:${userId}`);
    res.json({ message: 'Product added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
};

const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const itemCheck = await pool.query(`
      SELECT ci.id, p.stock 
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = $1 AND c.user_id = $2
    `, [id, userId]);

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (itemCheck.rows[0].stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    await pool.query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, id]
    );

    await cacheService.del(`cart:${userId}`);
    res.json({ message: 'Cart item updated' });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

const removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(`
      DELETE FROM cart_items 
      WHERE id = $1 AND cart_id IN (SELECT id FROM carts WHERE user_id = $2)
      RETURNING id
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await cacheService.del(`cart:${userId}`);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

const clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query(`
      DELETE FROM cart_items 
      WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)
    `, [userId]);

    await cacheService.del(`cart:${userId}`);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };