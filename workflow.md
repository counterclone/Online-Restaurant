# Online Food Ordering System (OFOS) – Deep-Dive

# Project Guide

# 1. What You Must Build (Clear Responsibilities)

- Build full-stack OFOS using Angular + Spring Boot.
- Implement role-based login system: Admin, Customer, Delivery Agent.
- Build Restaurant and Menu Item management modules.
- Implement cart system, checkout, order placement, order tracking.
- Implement Admin dashboard, Delivery Agent dashboard, and Customer dashboard.
- Create complete API layer with controllers/services/repositories.
- Secure the system using JWT-based authentication.
- Follow naming conventions for all components and services.

# 2. Step-by-Step Work Breakdown (What To Do

# Each Stage)

## Stage 1 – Setup & Authentication

- Initialize Spring Boot project with Security + JPA + Validation.
- Create User entity with roles.
- Implement AuthController with /register and /login.
- Create JWT utility, filters, and SecurityConfig.
- In Angular, create login/register components.
- Store JWT in localStorage + write HTTP interceptor.

## Stage 2 – Restaurant Module

- Create Restaurant entity (id, name, address, cuisine, image).
- RestaurantController → CRUD APIs.
- RestaurantService → Business logic.
- RestaurantRepository → JPA repo.
- Angular: restaurant-list, restaurant-detail, admin-manage-restaurants.

## Stage 3 – Menu Item Module

- MenuItem entity – name, price, veg/non-veg, restaurantId.
- MenuItemController → Add, update, delete, list.
- Angular: menu-list and menu-item-card components.


## Stage 4 – Cart Module

- Backend optional: cart table OR Angular-only cart.
- Angular service → addToCart(), removeItem(), updateQty().
- Create cart.component.ts for UI.
- Calculate total, taxes, and discounts.

## Stage 5 – Checkout & Orders

- Order entity + OrderItem entity with relationships.
- APIs: place order, get my orders, admin orders.
- Angular: order-checkout, order-history, order-track.

## Stage 6 – Delivery Workflow

- DeliveryAgent entity + assignment of orders.
- APIs: update order status → OUT_FOR_DELIVERY, DELIVERED.
- Angular: delivery-dashboard + delivery-orders.

## Stage 7 – Profiles & Address Management

- Profile entity + UserDetails update API.
- Address entity with CRUD.
- Angular: profile.component + address.component.

## Stage 8 – Dashboard & Analytics

- Admin: total orders, total revenue, top restaurants.
- Customer: recent orders & favorites.
- Delivery Agent: assigned orders.
- Use ngx-charts for simple graphs.

# 3. API Naming Conventions (Deep Level)

## AuthController.java

- POST /auth/register – create new user
- POST /auth/login – returns JWT

## RestaurantController.java

- POST /api/restaurants
- GET /api/restaurants
- GET /api/restaurants/{id}


- PUT /api/restaurants/{id}
- DELETE /api/restaurants/{id}

## MenuItemController.java

- POST /api/restaurants/{id}/items
- GET /api/restaurants/{id}/items
- PUT /api/items/{itemId}
- DELETE /api/items/{itemId}

## CartController.java

- POST /api/cart/add
- PUT /api/cart/update
- DELETE /api/cart/{id}
- GET /api/cart

## OrderController.java

- POST /api/orders
- GET /api/orders/my
- GET /api/orders/admin
- PUT /api/orders/{id}/status

# 4. Security – What You Must Do Exactly

- Use BCrypt for password hashing.
- Use JWT for all secured API requests.
- Implement AuthenticationFilter to validate token.
- Whitelist only /auth/login and /auth/register.
- Apply role-based access using @PreAuthorize or SecurityConfig.
- Angular interceptor must attach token on every request.

# 5. Angular Components & What Each Component

# Must Do

- login.component.ts – Perform authentication.
- register.component.ts – Create new customer.
- restaurant-list.component.ts – Show all restaurants.
- restaurant-detail.component.ts – Show menu items.
- menu-list.component.ts – Display food items.
- cart.component.ts – Manage cart logic.
- order-checkout.component.ts – Handle order placement.


- order-history.component.ts – Show customer's past orders.
- order-track.component.ts – Track delivery status.
- admin-dashboard.component.ts – Stats, analytics.
- manage-restaurants.component.ts – CRUD on restaurants.
- delivery-dashboard.component.ts – View assigned orders.

# 6. Angular Services – What Each Service Must

# Handle

- auth.service.ts → login, register, token validation.
- restaurant.service.ts → fetch/add/update restaurants.
- menu.service.ts → fetch/add/update menu items.
- cart.service.ts → manage cart state.
- order.service.ts → place order, fetch orders, update status.
- delivery.service.ts → delivery agent operations.
- profile.service.ts → user profile updates.

# 7. Final Summary

This deep-dive guide provides you with exact responsibilities, step-by-step actions, API structures,
component purpose, service responsibilities, and security expectations. Use this as a blueprint to
build the full project successfully.


