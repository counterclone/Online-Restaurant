# Online Food Ordering System (OFOS)

A full-stack web application for online food ordering built with Angular and Spring Boot.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Flow](#project-flow)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)

## 🎯 Overview

OFOS is a complete online food ordering platform that allows customers to browse restaurants, place orders, and track deliveries. The system supports three user roles: **Customer**, **Admin**, and **Delivery Agent**.

### Key Features

- 🔐 JWT-based authentication and authorization
- 🏪 Restaurant and menu item management
- 🛒 Shopping cart with tax and discount calculations
- 📦 Order placement and tracking
- 👤 User profile and address management
- 📊 Admin dashboard with analytics
- 🚚 Delivery agent order management
- 🔍 Restaurant search functionality

## 🛠 Technology Stack

### Backend

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA**
- **MySQL Database**
- **Maven** (Build Tool)
- **JJWT 0.12.3** (JWT Token Management)

### Frontend

- **Angular 17**
- **TypeScript 5.2.2**
- **RxJS 7.8.0**
- **Angular Router** (Navigation)
- **Angular Forms** (Form Handling)
- **HTTP Client** (API Communication)

## 🏗 System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Angular App   │  HTTP   │  Spring Boot    │   JDBC  │   MySQL DB      │
│   (Frontend)    │ ──────> │   (Backend)     │ ──────> │   (Database)    │
│   Port: 4200    │  REST   │   Port: 8080    │         │   Port: 3306    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Request Flow

```
Frontend Component
    ↓
Angular Service
    ↓
HTTP Interceptor (Adds JWT Token)
    ↓
Spring Boot Backend
    ↓
JWT Authentication Filter (Validates Token)
    ↓
Controller (Handles HTTP Request)
    ↓
Service (Business Logic)
    ↓
Repository (JPA - Database Access)
    ↓
MySQL Database
```

## 📊 Project Flow

### 1. Authentication Flow

#### User Registration/Login

```
1. User visits /login or /register
2. Angular: User fills form → AuthService
3. Frontend → POST /auth/login or /auth/register
4. Backend: AuthController receives request
5. Backend: AuthService validates credentials
6. Backend: JwtUtil generates JWT token
7. Backend → Returns { token, user }
8. Frontend: Stores token in localStorage
9. Frontend: Redirects based on role:
   - ADMIN → /admin/dashboard
   - CUSTOMER → /restaurants
   - DELIVERY_AGENT → /delivery/dashboard
```

#### Protected Route Access

```
1. User navigates to protected route
2. AuthGuard checks if user is authenticated
3. If not → Redirect to /login
4. If yes → Allow access
5. Every API call → AuthInterceptor adds JWT token
6. Backend: JwtAuthenticationFilter validates token
7. Backend: SecurityContext set with user details
8. Request proceeds to Controller
```

### 2. Customer Flow (Ordering Food)

```
Step 1: LOGIN/REGISTER
   → Customer logs in or registers
   → Redirected to /restaurants

Step 2: BROWSE RESTAURANTS
   → RestaurantListComponent loads
   → GET /api/restaurants
   → Displays list of restaurants
   → Can search/filter restaurants

Step 3: VIEW RESTAURANT MENU
   → Click on restaurant
   → RestaurantDetailComponent loads
   → GET /api/restaurants/{id}
   → GET /api/restaurants/{id}/items
   → Shows menu items with prices

Step 4: ADD TO CART
   → Click "Add to Cart" on menu item
   → CartService.addToCart(item)
   → Item stored in Angular service (local state)
   → Cart persists in browser (localStorage)

Step 5: VIEW CART
   → Navigate to /cart
   → CartComponent displays items
   → Shows: Subtotal, Tax (18%), Discount (10%), Total
   → Can update quantities or remove items

Step 6: CHECKOUT
   → Click "Proceed to Checkout"
   → OrderCheckoutComponent loads
   → Select delivery address (or add new)
   → Shows final order summary

Step 7: PLACE ORDER
   → Click "Place Order"
   → POST /api/orders
   → Request: { restaurantId, deliveryAddress, orderItems }
   → Backend: OrderService creates order
   → Backend: Order status = "CONFIRMED"
   → Backend: Saves Order + OrderItems to DB
   → Frontend: Cart cleared
   → Redirect to /orders/{orderId}

Step 8: TRACK ORDER
   → View order history: /orders
   → GET /api/orders/my
   → Click "Track Order"
   → OrderTrackComponent shows status
   → Status flow: CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
```

### 3. Admin Flow (Managing System)

```
Step 1: ADMIN LOGIN
   → Login as ADMIN role
   → Redirected to /admin/dashboard

Step 2: VIEW DASHBOARD
   → AdminDashboardComponent loads
   → GET /api/dashboard/admin
   → Shows: Total Orders, Revenue, Restaurants
   → Shows: Top Restaurants by order count

Step 3: MANAGE RESTAURANTS
   → Navigate to /admin/restaurants
   → ManageRestaurantsComponent loads
   → CRUD Operations:
      • GET /api/restaurants (list all)
      • POST /api/restaurants (create)
      • PUT /api/restaurants/{id} (update)
      • DELETE /api/restaurants/{id} (delete)

Step 4: MANAGE MENU ITEMS
   → In Manage Restaurants page, click "Manage Menu" button
   → Navigate to /admin/restaurants/{id}/menu
   → ManageMenuItemsComponent loads
   → CRUD Operations:
      • GET /api/restaurants/{id}/items (list all items)
      • POST /api/restaurants/{id}/items (create item)
      • PUT /api/items/{itemId} (update item)
      • DELETE /api/items/{itemId} (delete item)
   → Fill form: Name, Price (₹), Type (Veg/Non-Veg)

Step 5: ASSIGN DELIVERY AGENTS
   → View pending orders
   → GET /api/delivery/pending-orders
   → Select delivery agent from dropdown
   → POST /api/delivery/assign-order
   → Order assigned to delivery agent
```

### 4. Delivery Agent Flow

```
Step 1: DELIVERY AGENT LOGIN
   → Login as DELIVERY_AGENT role
   → Redirected to /delivery/dashboard

Step 2: VIEW ASSIGNED ORDERS
   → DeliveryDashboardComponent loads
   → GET /api/delivery/my-orders
   → Shows all orders assigned to this agent

Step 3: UPDATE ORDER STATUS
   → When picking up order:
     • Click "Mark Out for Delivery"
     • PUT /api/orders/{id}/status
     • Status: OUT_FOR_DELIVERY

   → When delivered:
     • Click "Mark as Delivered"
     • PUT /api/orders/{id}/status
     • Status: DELIVERED

Step 4: VIEW ORDER DETAILS
   → Click "View Details"
   → Shows delivery address, items, total
```

### 5. Order Lifecycle

```
Order Status Flow:
┌─────────────┐
│  CONFIRMED  │ ← Order placed by customer
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PREPARING   │ ← Restaurant preparing food
└──────┬──────┘
       │
       ▼
┌─────────────┐
│OUT_FOR_     │ ← Delivery agent picked up
│DELIVERY     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  DELIVERED  │ ← Order completed
└─────────────┘

Who Updates Status:
• CONFIRMED → Automatically set when order placed
• PREPARING → Admin or system can update
• OUT_FOR_DELIVERY → Delivery Agent clicks button
• DELIVERED → Delivery Agent marks as delivered
```

## 🚀 Setup Instructions

### Prerequisites

- Java 17 or higher
- Node.js 18+ and npm
- MySQL 8.0+
- Maven 3.6+

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Configure MySQL:**

   - Open `src/main/resources/application.properties`
   - Update database credentials:
     ```properties
     spring.datasource.username=root
     spring.datasource.password=your_mysql_password_here
     ```

3. **Create MySQL Database:**

   ```sql
   CREATE DATABASE ofos_db;
   ```

   (Or let Spring Boot create it automatically)

4. **Build and run:**

   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   Backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**

   ```bash
   npm start
   # or
   ng serve
   ```

   Frontend will start on `http://localhost:4200`

### Initial Data

The system includes a `DataSeeder` that automatically creates sample restaurants on first startup:

- Pizza Palace (Italian)
- Burger King (American)
- Sushi House (Japanese)
- Taco Bell (Mexican)
- Curry Express (Indian)

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint                      | Description               |
| ------ | ----------------------------- | ------------------------- |
| POST   | `/auth/register`              | Register new user         |
| POST   | `/auth/login`                 | User login                |
| GET    | `/api/restaurants`            | List all restaurants      |
| GET    | `/api/restaurants/{id}`       | Get restaurant details    |
| GET    | `/api/restaurants/{id}/items` | Get restaurant menu items |

### Protected Endpoints (Require JWT)

#### Restaurant Management (Admin Only)

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| POST   | `/api/restaurants`      | Create restaurant |
| PUT    | `/api/restaurants/{id}` | Update restaurant |
| DELETE | `/api/restaurants/{id}` | Delete restaurant |

#### Menu Item Management (Admin Only)

| Method | Endpoint                      | Description                       |
| ------ | ----------------------------- | --------------------------------- |
| POST   | `/api/restaurants/{id}/items` | Create menu item                  |
| GET    | `/api/restaurants/{id}/items` | Get all menu items for restaurant |
| GET    | `/api/items/{itemId}`         | Get menu item by ID               |
| PUT    | `/api/items/{itemId}`         | Update menu item                  |
| DELETE | `/api/items/{itemId}`         | Delete menu item                  |

#### Order Management

| Method | Endpoint                  | Description         | Role                 |
| ------ | ------------------------- | ------------------- | -------------------- |
| POST   | `/api/orders`             | Place new order     | Customer             |
| GET    | `/api/orders/my`          | Get my orders       | Customer             |
| GET    | `/api/orders/{id}`        | Get order details   | Customer/Admin/Agent |
| PUT    | `/api/orders/{id}/status` | Update order status | Delivery Agent       |

#### Dashboard

| Method | Endpoint                  | Description           | Role     |
| ------ | ------------------------- | --------------------- | -------- |
| GET    | `/api/dashboard/admin`    | Admin dashboard stats | Admin    |
| GET    | `/api/dashboard/customer` | Customer dashboard    | Customer |

#### Delivery Management

| Method | Endpoint                         | Description           | Role           |
| ------ | -------------------------------- | --------------------- | -------------- |
| GET    | `/api/delivery/my-orders`        | Get assigned orders   | Delivery Agent |
| GET    | `/api/delivery/pending-orders`   | Get pending orders    | Admin          |
| POST   | `/api/delivery/assign-order`     | Assign order to agent | Admin          |
| GET    | `/api/delivery/agents`           | List all agents       | Admin          |
| GET    | `/api/delivery/agents/available` | List available agents | Admin          |

#### Profile & Address

| Method | Endpoint              | Description        | Role |
| ------ | --------------------- | ------------------ | ---- |
| GET    | `/api/profile`        | Get user profile   | All  |
| PUT    | `/api/profile`        | Update profile     | All  |
| GET    | `/api/addresses`      | Get user addresses | All  |
| POST   | `/api/addresses`      | Add address        | All  |
| PUT    | `/api/addresses/{id}` | Update address     | All  |
| DELETE | `/api/addresses/{id}` | Delete address     | All  |

## 🗄 Database Schema

### Entities and Relationships

```
User (id, username, password, email, role)
  ├── Profile (userId, firstName, lastName, phone, bio)
  ├── Address (userId, street, city, state, pincode)
  └── Order (userId, restaurantId, status, totalAmount)
       └── OrderItem (orderId, menuItemId, quantity, price)

Restaurant (id, name, address, cuisine, image)
  └── MenuItem (id, restaurantId, name, price, veg)

DeliveryAgent (id, userId, vehicleNumber, phone, available)
  └── Order (deliveryAgentId) - when assigned
```

### Key Tables

- **users**: User accounts with roles (CUSTOMER, ADMIN, DELIVERY_AGENT)
- **restaurants**: Restaurant information
- **menu_items**: Food items for each restaurant
- **orders**: Customer orders
- **order_items**: Items in each order
- **profiles**: User profile information
- **addresses**: Delivery addresses
- **delivery_agents**: Delivery agent details

## 👥 User Roles

### Customer

- Browse restaurants and menus
- Add items to cart
- Place orders
- Track order status
- Manage profile and addresses
- View order history

### Admin

- Manage restaurants (CRUD)
- View dashboard with analytics
- Assign orders to delivery agents
- View all orders
- Manage system settings

### Delivery Agent

- View assigned orders
- Update order status
- Mark orders as out for delivery
- Mark orders as delivered

## 🔒 Security Features

- **JWT Authentication**: All API requests secured with JWT tokens
- **Password Hashing**: BCrypt for password encryption
- **Role-Based Access Control**: Different permissions for each role
- **Route Guards**: Angular guards protect frontend routes
- **HTTP Interceptor**: Automatically adds JWT token to requests
- **CORS Configuration**: Configured for frontend-backend communication

## 📁 Project Structure

### Backend

```
backend/
├── src/main/java/com/ofos/
│   ├── config/          # Security, JWT configuration
│   ├── controllers/     # REST Controllers
│   ├── models/          # Entity classes
│   ├── repository/      # JPA Repositories
│   └── services/        # Business logic
└── src/main/resources/
    └── application.properties
```

### Frontend

```
frontend/
├── src/app/
│   ├── components/      # Angular components
│   ├── services/        # Angular services
│   ├── guards/          # Route guards
│   ├── interceptors/    # HTTP interceptors
│   └── app-routing.module.ts
└── src/styles.css
```

## 🧪 Testing the Application

1. **Register a Customer:**

   - Go to `/register`
   - Fill in details, select "Customer" role
   - Login with credentials

2. **Register an Admin:**

   - Go to `/register`
   - Fill in details, select "Admin" role
   - Login to access admin dashboard

3. **Place an Order:**

   - Login as Customer
   - Browse restaurants
   - Add items to cart
   - Proceed to checkout
   - Select address and place order

4. **Manage Restaurants (Admin):**

   - Login as Admin
   - Go to "Manage Restaurants"
   - Add/Edit/Delete restaurants

5. **Add Menu Items (Admin):**
   - Login as Admin
   - Go to "Manage Restaurants"
   - Click "Manage Menu" button for any restaurant
   - Click "Add New Menu Item"
   - Fill in: Item Name, Price (₹), Type (Veg/Non-Veg)
   - Click "Add Menu Item"
   - You can also Edit or Delete existing menu items

## 📝 Notes

- Cart is stored in Angular service (localStorage) - not persisted in database
- JWT tokens expire after configured time (default: 24 hours)
- Order status updates are role-specific
- All prices are in Indian Rupees (₹)
- Tax calculation: 18% GST
- Discount: 10% on orders above ₹500

## 🤝 Contributing

This is a learning project. Feel free to extend it with:

- Payment gateway integration
- Real-time order tracking
- Restaurant ratings and reviews
- Push notifications
- Email notifications
- Advanced analytics

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ using Angular and Spring Boot**
