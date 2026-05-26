# VoltEX API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses are in JSON format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## Error Responses

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login

**POST** `/auth/login`

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Get Current User

**GET** `/auth/me` (Protected)

Response:

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "123-456-7890",
    "address": {}
  }
}
```

### Update Profile

**PUT** `/auth/profile` (Protected)

Request body:

```json
{
  "name": "John Doe",
  "phone": "123-456-7890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  }
}
```

---

## Product Endpoints

### Get All Products

**GET** `/products?page=1&limit=12&category=smartphones&search=iPhone`

Query Parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `category` (optional): Filter by category
- `search` (optional): Search term

Response:

```json
{
  "success": true,
  "products": [
    {
      "_id": "product_id",
      "name": "iPhone 15 Pro",
      "description": "Latest Apple flagship",
      "price": 999,
      "image": "url",
      "category": "smartphones",
      "brand": "Apple",
      "stock": 50,
      "rating": 4.8,
      "reviews": 320,
      "featured": true,
      "discount": 5,
      "inStock": true
    }
  ],
  "pagination": {
    "total": 100,
    "pages": 9,
    "currentPage": 1
  }
}
```

### Get Product by ID

**GET** `/products/:id`

Response:

```json
{
  "success": true,
  "product": {
    "_id": "product_id",
    "name": "iPhone 15 Pro",
    "description": "Latest Apple flagship",
    "price": 999,
    "image": "url",
    "category": "smartphones",
    "brand": "Apple",
    "stock": 50,
    "rating": 4.8,
    "reviews": 320,
    "featured": true,
    "discount": 5,
    "inStock": true,
    "specifications": {
      "storage": "256GB",
      "ram": "8GB",
      "display": "6.1 inch",
      "battery": "3200 mAh"
    }
  }
}
```

### Get Featured Products

**GET** `/products/featured`

Response:

```json
{
  "success": true,
  "products": [...]
}
```

### Get Products by Category

**GET** `/products/category/:category`

Categories:

- smartphones
- laptops
- tablets
- accessories
- audio
- wearables
- gaming

### Search Products

**GET** `/products/search?q=iPhone`

Query Parameters:

- `q`: Search query (required)

---

## Cart Endpoints (Protected)

### Get Cart

**GET** `/cart`

Response:

```json
{
  "success": true,
  "cart": {
    "_id": "cart_id",
    "userId": "user_id",
    "items": [
      {
        "productId": "product_id",
        "quantity": 2,
        "price": 999
      }
    ],
    "totalPrice": 1998
  }
}
```

### Add to Cart

**POST** `/cart/add`

Request body:

```json
{
  "productId": "product_id",
  "quantity": 1
}
```

Response:

```json
{
  "success": true,
  "cart": {...},
  "message": "Product added to cart"
}
```

### Update Cart Item

**PUT** `/cart/:productId`

Request body:

```json
{
  "quantity": 3
}
```

### Remove from Cart

**DELETE** `/cart/:productId`

Response:

```json
{
  "success": true,
  "cart": {...},
  "message": "Product removed from cart"
}
```

### Clear Cart

**DELETE** `/cart`

Response:

```json
{
  "success": true,
  "cart": {...},
  "message": "Cart cleared"
}
```

---

## Order Endpoints (Protected)

### Create Order

**POST** `/orders`

Request body:

```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  }
}
```

Response:

```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "userId": "user_id",
    "items": [...],
    "totalAmount": 1998,
    "shippingAddress": {...},
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get User's Orders

**GET** `/orders`

Response:

```json
{
  "success": true,
  "orders": [...]
}
```

### Get Order by ID

**GET** `/orders/:id`

### Create Razorpay Order

**POST** `/orders/razorpay/create-order`

Request body:

```json
{
  "orderId": "order_id"
}
```

Response:

```json
{
  "success": true,
  "razorpayOrder": {
    "id": "order_xxx",
    "amount": 50000,
    "currency": "INR",
    "receipt": "order_id"
  },
  "keyId": "your_razorpay_key_id"
}
```

### Process Payment

**POST** `/orders/payment`

Request body:

```json
{
  "orderId": "order_id",
  "razorpayPaymentId": "pay_xxx",
  "razorpayOrderId": "order_xxx",
  "razorpaySignature": "signature_xxx"
}
```

### Cancel Order

**PUT** `/orders/:id/cancel`

Response:

```json
{
  "success": true,
  "order": {...},
  "message": "Order cancelled successfully"
}
```

---

## Admin Endpoints (Protected - Admin Only)

### Create Product

**POST** `/admin/products`

Request body:

```json
{
  "name": "New Product",
  "description": "Description",
  "price": 99.99,
  "category": "smartphones",
  "brand": "Brand",
  "stock": 50,
  "image": "url"
}
```

### Update Product

**PUT** `/admin/products/:id`

Request body: (any fields to update)

```json
{
  "name": "Updated Name",
  "price": 109.99,
  "stock": 45
}
```

### Delete Product

**DELETE** `/admin/products/:id`

### Get All Orders

**GET** `/admin/orders?page=1&status=pending`

Query Parameters:

- `page` (optional): Page number
- `status` (optional): Filter by status (pending, confirmed, shipped, delivered, cancelled)

### Update Order Status

**PUT** `/admin/orders/:id/status`

Request body:

```json
{
  "status": "shipped"
}
```

Valid statuses:

- pending
- confirmed
- shipped
- delivered
- cancelled

### Get Dashboard Statistics

**GET** `/admin/dashboard/stats`

Response:

```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalProducts": 45,
    "totalOrders": 320,
    "totalRevenue": 50000
  },
  "recentOrders": [...]
}
```

### Get Product Analytics

**GET** `/admin/analytics/products`

Response:

```json
{
  "success": true,
  "topProducts": [
    {
      "_id": "product_id",
      "count": 45,
      "product": [...]
    }
  ]
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API requests are limited to:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

---

## Pagination

List endpoints support pagination with:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 100)

Example:

```
GET /products?page=2&limit=20
```

---

## Filtering & Sorting

### By Category

```
GET /products?category=smartphones
```

### By Search

```
GET /products?search=iPhone
```

### By Status (Orders)

```
GET /admin/orders?status=shipped
```

---

## Error Codes

| Code | Message                              |
| ---- | ------------------------------------ |
| 400  | Bad Request - Invalid input          |
| 401  | Unauthorized - No token provided     |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found       |
| 500  | Server Error - Internal error        |

---

## Example Requests

### Register and Login

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Products

```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10&category=smartphones"
```

### Add to Cart (Protected)

```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product_id",
    "quantity": 1
  }'
```

---

For more information, visit the [GitHub Repository](https://github.com/yourusername/VoltEX)
