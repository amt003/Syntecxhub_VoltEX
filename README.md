# VoltEX - E-Commerce Application

A full-fledged e-commerce application for electronics and gadgets named **VoltEX**. This project includes a complete backend API with JWT authentication, a React-based frontend, admin dashboard, and deployment configuration.

## Features

### User Authentication & Authorization

- User registration and login with JWT tokens
- Role-based access control (user, admin)
- Password hashing with bcryptjs
- Protected routes for authenticated users

### Product Management

- Browse product catalog with search and filtering
- Product details page with specifications
- Featured products showcase
- Category-based browsing
- Admin panel for product CRUD operations

### Shopping Cart & Checkout

- Add/remove products from cart
- Update product quantities
- Real-time cart total calculation
- Checkout with shipping address
- Order confirmation

### Admin Dashboard

- View dashboard statistics (users, products, orders, revenue)
- Product management (create, update, delete)
- Order management and status updates
- Product analytics and top sellers
- Recent orders monitoring

### Payment Processing

- Razorpay integration for secure payments
- Multiple payment methods (Cards, UPI, Net Banking)
- Order payment status tracking
- Transaction ID storage

## Tech Stack

### Backend

- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI**: CSS3 with Responsive Design

### Deployment

- **Containerization**: Docker & Docker Compose
- **Frontend Hosting**: Vercel (recommended)
- **Backend Hosting**: Heroku, Railway, or similar

## Project Structure

```
VoltEX/
├── backend/
│   ├── src/
│   │   ├── index.js                 # Main server file
│   │   ├── models/                  # Database models
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Cart.js
│   │   │   └── Order.js
│   │   ├── controllers/             # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── cartController.js
│   │   │   ├── orderController.js
│   │   │   └── adminController.js
│   │   ├── routes/                  # API routes
│   │   ├── middleware/              # Custom middleware
│   │   └── scripts/                 # Utility scripts
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   ├── components/              # Reusable components
│   │   ├── services/                # API services
│   │   ├── store/                   # Zustand stores
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn
- Docker (optional, for containerization)

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

4. Update `.env` with your configuration:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voltex
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

5. Start the backend:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

4. Update `.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the frontend:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Seed Database with Sample Data

From backend directory:

```bash
node src/scripts/runSeed.js
```

This will populate MongoDB with 8 sample products.

## Docker Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:

- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 3000

To stop:

```bash
docker-compose down
```

## Production Deployment

### Frontend Deployment on Vercel

1. Push your frontend code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Set environment variables:
   - `REACT_APP_API_URL=https://your-backend-url.com/api`
5. Deploy

### Backend Deployment on Heroku

1. Create Heroku account and install CLI
2. From backend directory:

```bash
heroku login
heroku create your-app-name
heroku addons:create mongolab:sandbox
```

3. Set environment variables:

```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set JWT_EXPIRE=7d
heroku config:set RAZORPAY_KEY_ID=your_razorpay_key_id
heroku config:set RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

4. Deploy:

```bash
git push heroku main
```

### Backend Deployment on Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Add MongoDB plugin
5. Set environment variables
6. Deploy

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Products

- `GET /api/products` - Get all products with pagination
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search?q=query` - Search products

### Cart (Protected)

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add product to cart
- `PUT /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove product from cart
- `DELETE /api/cart` - Clear cart

### Orders (Protected)

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders/payment` - Process payment
- `PUT /api/orders/:id/cancel` - Cancel order

### Admin (Protected - Admin Only)

- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/analytics/products` - Get product analytics

## Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voltex
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@voltex.com
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Testing Credentials

After seeding, you can use these demo accounts:

- **Regular User**:
  - Email: user@example.com
  - Password: password123

- **Admin User**:
  - Email: admin@voltex.com
  - Password: admin123

Note: Remember to create these accounts through the registration endpoint or manually update the database.

## Features Implemented

✅ User Authentication with JWT
✅ Product Listing & Search
✅ Shopping Cart Management
✅ Checkout Process
✅ Order Management
✅ Admin Dashboard
✅ Product Management (Admin)
✅ Order Management (Admin)
✅ Role-Based Access Control
✅ Responsive Design
✅ Docker Support
✅ API Documentation

## Future Enhancements

- [ ] Email notifications for orders
- [x] Payment gateway integration (Razorpay)
- [ ] Product reviews and ratings
- [ ] Wishlist feature
- [ ] Inventory management
- [ ] Advanced analytics
- [ ] Discount codes and coupons
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Real-time order tracking

## Support & Troubleshooting

### Common Issues

**MongoDB Connection Error**

- Ensure MongoDB is running locally or check Atlas connection string
- Verify IP whitelist in MongoDB Atlas

**CORS Error**

- Ensure backend is running on correct port
- Check CORS configuration in Express server
- Verify frontend API URL in environment variables

**JWT Token Issues**

- Clear browser localStorage
- Check token expiration time
- Verify JWT_SECRET matches on backend

**Port Already in Use**

- Change PORT in .env or kill process using that port
- On Windows: `netstat -ano | findstr :5000`
- On Mac/Linux: `lsof -i :5000`

## License

MIT

## Contact & Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Happy Shopping with VoltEX! 🎉**
