# 🛒 E-commerce Application

A full-stack e-commerce application built with Node.js, Express, PostgreSQL, and Redis. Features include user authentication, product catalog, shopping cart, and order management with database transactions.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Testing the Application](#testing-the-application)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **User Authentication**: Register, login with JWT tokens
- **Product Catalog**: Browse products with search and category filters
- **Shopping Cart**: Add, update, remove items with real-time stock validation
- **Order Management**: Complete checkout process with database transactions
- **Caching**: Redis integration for improved performance
- **Transaction Safety**: ACID-compliant order processing
- **Responsive UI**: Mobile-friendly login and dashboard interface

## 🛠 Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Containerization**: Docker, Docker Compose
- **Validation**: express-validator

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)
- **Node.js** (v18 or higher) - for local development
- **npm** or **yarn** - for package management

### Verify installations:

```bash
docker --version
docker-compose --version
node --version
npm --version
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ecommerce-app
```

### 2. Create Environment File

Copy the example environment file and update values:

```bash
cp .env.example .env
```

Edit `.env` file with your preferred values:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

DB_HOST=postgres
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=postgres123

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

CACHE_TTL=3600
```

### 3. Install Dependencies (for local development)

```bash
npm install
```

## ⚙️ Configuration

### Database Configuration

The PostgreSQL database is automatically initialized with:
- User table for authentication
- Products table with sample data
- Carts and cart items tables
- Orders and order items tables
- Proper indexes for performance

See `migrations/init.sql` for the complete schema.

### Redis Configuration

Redis is configured for caching:
- Product listings
- Shopping cart data
- User sessions
- Configurable TTL (default: 3600 seconds)

## 🏃 Running the Application

### Using Docker Compose (Recommended)

This will start all services (app, PostgreSQL, Redis):

```bash
# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Local Development (without Docker)

1. **Start PostgreSQL and Redis separately** (using Docker):

```bash
docker-compose up -d postgres redis
```

2. **Update .env for local connection**:

```env
DB_HOST=localhost
REDIS_HOST=localhost
```

3. **Run the application**:

```bash
npm run dev
```

### Accessing the Application

- **Web Interface**: http://localhost:3000
- **API Base URL**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products
GET /api/products?category=Electronics
GET /api/products?search=laptop
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Get Categories
```http
GET /api/products/categories
```

### Cart Endpoints (Requires Authentication)

#### Get Cart
```http
GET /api/cart
Authorization: Bearer {token}
```

#### Add to Cart
```http
POST /api/cart
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/cart/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /api/cart/:id
Authorization: Bearer {token}
```

#### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer {token}
```

### Order Endpoints (Requires Authentication)

#### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "shipping_address": "123 Main St, City, Country"
}
```

#### Get All Orders
```http
GET /api/orders
Authorization: Bearer {token}
```

#### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer {token}
```

## 📁 Project Structure

```
ecommerce-app/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection pool
│   │   └── redis.js             # Redis client configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── productController.js # Product operations
│   │   ├── cartController.js    # Shopping cart operations
│   │   └── orderController.js   # Order processing with transactions
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── productRoutes.js     # Product endpoints
│   │   ├── cartRoutes.js        # Cart endpoints
│   │   └── orderRoutes.js       # Order endpoints
│   ├── services/
│   │   └── cacheService.js      # Redis caching operations
│   └── app.js                   # Express app entry point
├── public/
│   ├── login.html               # Frontend interface
│   └── styles.css               # Styling
├── migrations/
│   └── init.sql                 # Database initialization
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── docker-compose.yml           # Multi-container orchestration
├── Dockerfile                   # Node.js container definition
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## 🗄️ Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password` (VARCHAR, hashed)
- `full_name` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

### Products Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `stock` (INTEGER)
- `category` (VARCHAR)
- `image_url` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

### Carts & Cart Items
- Shopping cart with user relationship
- Cart items link products with quantities

### Orders & Order Items
- Order tracking with status
- Order items preserve product prices at purchase time

## 🧪 Testing the Application

### 1. Register a New User

Visit http://localhost:3000 and click "Register":
- Full Name: Test User
- Email: test@example.com
- Password: test123

### 2. Browse Products

After login, click "Browse Products" to see the catalog with 10 sample products.

### 3. Add Items to Cart

- Select quantity
- Click "Add to Cart"
- View cart to see items

### 4. Complete a Transaction

1. Click "View Cart"
2. Review items
3. Click "Proceed to Checkout"
4. Enter shipping address
5. Click "Place Order"

The order will:
- Check stock availability
- Create order record
- Deduct stock from products
- Clear shopping cart
- All within a database transaction (rollback on failure)

### 5. View Orders

Click "My Orders" to see order history with status.

## 🐛 Troubleshooting

### Issue: Port already in use

```bash
# Check what's using the port
lsof -i :3000

# Stop the service or change PORT in .env
```

### Issue: Docker containers not starting

```bash
# Check container logs
docker-compose logs

# Restart containers
docker-compose restart

# Fresh start
docker-compose down -v
docker-compose up -d
```

### Issue: Database connection failed

```bash
# Check PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Verify environment variables in .env
```

### Issue: Redis connection error

```bash
# Check Redis is running
docker-compose logs redis

# Restart Redis
docker-compose restart redis
```

### Issue: ECONNREFUSED errors

Wait a few seconds after starting Docker containers for services to fully initialize. Health checks are configured but services may need time to start.

## 🔐 Security Notes

- **Change JWT_SECRET** in production to a strong, random value
- **Use HTTPS** in production
- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- SQL injection protected with parameterized queries
- Input validation on all endpoints

## 📝 Development Tips

### Viewing Database Content

```bash
# Connect to PostgreSQL container
docker exec -it ecommerce_postgres psql -U postgres -d ecommerce_db

# List tables
\dt

# View products
SELECT * FROM products;

# View users (passwords are hashed)
SELECT id, email, full_name FROM users;
```

### Viewing Redis Cache

```bash
# Connect to Redis container
docker exec -it ecommerce_redis redis-cli

# View all keys
KEYS *

# Get cached value
GET products:all:

# Clear cache
FLUSHALL
```

### Hot Reload for Development

The Docker volume mounts source code, so changes are reflected. For better development experience:

```bash
npm run dev  # Uses nodemon for auto-restart
```

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Happy Coding! 🚀**