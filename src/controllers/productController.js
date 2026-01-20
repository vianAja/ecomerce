const pool = require('../config/database');
const cacheService = require('../services/cacheService');

const getAllProducts = async (req, res) => {
  const { category, search } = req.query;
  const cacheKey = `products:${category || 'all'}:${search || ''}`;

  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({ products: cached, source: 'cache' });
    }

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    await cacheService.set(cacheKey, result.rows);

    res.json({ products: result.rows, source: 'database' });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `product:${id}`;

  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({ product: cached, source: 'cache' });
    }

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await cacheService.set(cacheKey, result.rows[0]);
    res.json({ product: result.rows[0], source: 'database' });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const getCategories = async (req, res) => {
  const cacheKey = 'categories:all';

  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json({ categories: cached, source: 'cache' });
    }

    const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    const categories = result.rows.map(row => row.category);
    
    await cacheService.set(cacheKey, categories);
    res.json({ categories, source: 'database' });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

module.exports = { getAllProducts, getProductById, getCategories };