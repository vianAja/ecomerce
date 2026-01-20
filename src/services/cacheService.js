const { client } = require('../config/redis');

class CacheService {
  async get(key) {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Cache get error:', err);
      return null;
    }
  }

  async set(key, value, ttl = process.env.CACHE_TTL || 3600) {
    try {
      await client.setEx(key, parseInt(ttl), JSON.stringify(value));
      return true;
    } catch (err) {
      console.error('Cache set error:', err);
      return false;
    }
  }

  async del(key) {
    try {
      await client.del(key);
      return true;
    } catch (err) {
      console.error('Cache delete error:', err);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (err) {
      console.error('Cache delete pattern error:', err);
      return false;
    }
  }
}

module.exports = new CacheService();