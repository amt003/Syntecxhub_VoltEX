# VoltEX - Quick Start Guide

Welcome to **VoltEX**! This guide will help you get up and running in minutes.

## ⚡ 5-Minute Setup

### Option 1: Using Docker (Recommended)

```bash
# 1. Navigate to project root
cd VoltEX

# 2. Start all services
docker-compose up -d

# 3. Wait for containers to start (30-60 seconds)
docker-compose logs -f

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

Done! Your e-commerce store is ready! 🎉

### Option 2: Local Development

#### Prerequisites

- Node.js 18+
- MongoDB running locally

#### Setup

```bash
# 1. Install dependencies for all packages
npm run install-all

# 2. Configure environment variables
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env

# 3. Seed database with sample products
cd ../backend && node src/scripts/runSeed.js

# 4. Start development servers
cd .. && npm run dev
```

Access at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📋 Default Test Accounts

After setup, you can test with these accounts:

**Regular User:**

- Email: test@example.com
- Password: password123

**Admin User:**

- Email: admin@voltex.com
- Password: admin123

_Note: Create accounts through signup or update the database._

## 🗂️ Project Structure

```
VoltEX/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── models/   # Database models
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middleware/
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── store/
│   └── package.json
└── docker-compose.yml
```

## 🚀 Key Features

### User Features

✅ User registration & login with JWT
✅ Browse products with search & filters
✅ Add products to shopping cart
✅ Checkout and place orders
✅ View order history
✅ Update profile information

### Admin Features

✅ Dashboard with statistics
✅ Add/edit/delete products
✅ Manage customer orders
✅ View product analytics
✅ Monitor revenue

## 🛒 Quick Demo

1. **Home Page**: Browse featured products
2. **Products Page**: Search and filter products by category
3. **Product Detail**: View detailed specs and add to cart
4. **Shopping Cart**: Review items and quantities
5. **Login/Register**: Create an account or login
6. **Checkout**: Enter shipping address and complete order
7. **Orders Page**: View your order history
8. **Admin Dashboard**: (If admin) View stats and manage products

## 📚 Documentation

- **[README.md](./README.md)** - Full project documentation
- **[API.md](./API.md)** - API endpoints reference
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide

## 🔧 Common Tasks

### Add a New Product (Admin)

1. Login as admin
2. Go to Admin Dashboard
3. Click "Products" tab
4. Fill in product details
5. Click "Add Product"

### Place an Order

1. Browse and search products
2. Click "Add to Cart"
3. Go to Shopping Cart
4. Click "Proceed to Checkout"
5. Login/Register if needed
6. Enter shipping address
7. Fill payment details
8. Click "Place Order"

### View Orders

1. Login to your account
2. Click "Orders" in navbar
3. View all your orders and their status

## 🔐 Security Features

✅ JWT-based authentication
✅ Password hashing (bcryptjs)
✅ Protected routes
✅ Role-based access control
✅ Input validation
✅ CORS protection

## 📦 API Endpoints Summary

**Authentication**

```
POST   /api/auth/register      - Register user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
PUT    /api/auth/profile       - Update profile
```

**Products**

```
GET    /api/products           - Get all products
GET    /api/products/:id       - Get product details
GET    /api/products/featured  - Get featured products
GET    /api/products/search    - Search products
```

**Shopping**

```
GET    /api/cart               - Get cart
POST   /api/cart/add           - Add to cart
DELETE /api/cart/:id           - Remove from cart
```

**Orders**

```
POST   /api/orders             - Create order
GET    /api/orders             - Get user orders
POST   /api/orders/payment     - Process payment
```

**Admin**

```
POST   /api/admin/products     - Create product
PUT    /api/admin/products/:id - Update product
GET    /api/admin/dashboard/stats - Get stats
```

See [API.md](./API.md) for complete documentation.

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

### MongoDB Connection Error

- Ensure MongoDB is running
- Check connection string in .env
- Verify IP whitelist (if using MongoDB Atlas)

### Frontend Not Loading

- Check if backend is running
- Verify API URL in frontend .env
- Clear browser cache

### Docker Issues

```bash
# View logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Rebuild containers
docker-compose up -d --build
```

## 📈 Next Steps

1. **Customize**: Modify products, categories, and branding
2. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
3. **Enhance**: Add more features (reviews, wishlist, etc.)
4. **Scale**: Implement caching, CDN, and load balancing

## 💡 Tips

- Use the sample products for testing
- Admin dashboard shows real-time statistics
- Cart is stored locally and synced with backend
- Orders trigger automatic status updates

## 🤝 Support

- Check documentation files
- Review API endpoints
- Check browser console for errors
- Review backend logs: `docker-compose logs backend`

## 🎯 What You Get

✨ **Production-Ready Code**

- Fully functional e-commerce platform
- Best practices implemented
- Clean, organized code structure
- Complete API documentation

🚀 **Easy Deployment**

- Docker support
- Multiple hosting options
- Environment configuration
- Database setup included

📚 **Comprehensive Documentation**

- API reference
- Deployment guides
- Setup instructions
- Troubleshooting tips

## 🎉 You're All Set!

Your VoltEX e-commerce platform is ready to use.

**Start shopping: http://localhost:3000**

Happy coding! 🚀

---

**Questions?** Check the [README](./README.md) or [API documentation](./API.md)
