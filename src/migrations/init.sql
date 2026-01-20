-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Carts table
CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id)
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Insert sample products
ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);

INSERT INTO products (name, description, price, stock, category, image_url) VALUES
('Laptop Pro 15', 'High-performance laptop with 16GB RAM and SSD storage', 1299.99, 50, 'Electronics', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format'),
('Wireless Mouse', 'Ergonomic wireless mouse with fast optical sensor', 29.99, 200, 'Electronics', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1000&auto=format'),
('USB-C Cable', 'Durable fast charging USB-C cable 2m length', 15.99, 500, 'Accessories', '
https://imgs.search.brave.com/xkVqIebkv_EE1l2AJ_3e0DtY0FZnkR015zk-JbAUq64/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dGhld2lyZWN1dHRl/ci5jb20vd3AtY29u/dGVudC9tZWRpYS8y/MDI0LzA2L3VzYmNj/YWJsZXNhZGFwdGVy/cy0yMDQ4cHgtMjU1/Ny5qcGc_YXV0bz13/ZWJwJnF1YWxpdHk9/NzUmd2lkdGg9MTAy/NA'),
('Mechanical Keyboard', 'RGB backlit mechanical gaming keyboard with blue switches', 89.99, 100, 'Electronics', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000&auto=format'),
('Webcam HD', '1080p HD webcam with built-in noise-reducing mic', 59.99, 75, 'Electronics', 'https://imgs.search.brave.com/LJfehigmj90rQLvtncn6WIl731NIAB4eYb_HW2a9_ms/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L1Fr/Qm1EWUVKbUZWc0Q3/SG14bVNGUFMuanBn'),
('Laptop Stand', 'Adjustable aluminum laptop stand for better ergonomics', 39.99, 150, 'Accessories', 'https://imgs.search.brave.com/RcKg1jaFRdO0HOJjLRW1xw7PQUqnpNdalvpSkopUAbE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L1Y3/TWRIaEpmQkZHajh2/WUZzdXlqckwuanBn'),
('Monitor 27"', '4K UHD 27-inch professional IPS monitor', 449.99, 30, 'Electronics', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format'),
('Headphones', 'Premium noise-cancelling wireless headphones', 199.99, 80, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format'),
('Phone Case', 'Minimalist protective phone case for premium feel', 19.99, 300, 'Accessories', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1000&auto=format'),
('Portable SSD', '1TB ultra-fast portable external SSD storage', 129.99, 60, 'Storage', 'https://imgs.search.brave.com/WFD5Tfsx-30QXASo9ow22pga5pW_qtVOGzanz6GeRes/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y25ldC5jb20vYS9p/bWcvcmVzaXplLzE4/ZWE2YjAwOWVhMjA1/YmZmNmMwMWYxYmZm/YTZlMzlmMGM4OGU3/ZjcvaHViLzIwMjUv/MDgvMjIvMzczMDll/ZTMtOGJkNC00OWY2/LWJlNTEtMDY0MmY5/M2M2ZThiL3NhbmRp/c2stMnRiLWV4dHJl/bWUtcHJvLXBvcnRh/YmxlLXNzZC13aXRo/LXVzYjQtMS5wbmc_/YXV0bz13ZWJwJmZv/cm1hdD1wanBnJmhl/aWdodD01MDA')
ON CONFLICT (name) DO UPDATE SET image_url = EXCLUDED.image_url;