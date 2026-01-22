# PASAR E-commerce Platform

A full-stack e-commerce application built with Spring Boot (Backend) and React + Vite (Frontend).

## System Overview

PASAR is a multi-user e-commerce platform supporting three user roles:

### User Roles

| Role | Description |
|------|-------------|
| **Customer** | Browse products, manage shopping cart, place orders, track order status, manage wallet |
| **Seller** | Manage product listings, view and fulfill orders, withdraw earnings |
| **Administrator** | Manage seller accounts (approve/reject), monitor transactions, configure platform settings |

### System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PASAR Platform                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                            │
│  │ Customer │     │  Seller  │     │  Admin   │                            │
│  └────┬─────┘     └────┬─────┘     └────┬─────┘                            │
│       │                │                │                                   │
│       ▼                ▼                ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    React Frontend (Vite)                     │           │
│  │  • Customer Dashboard  • Seller Dashboard  • Admin Dashboard │           │
│  │  • Product Browsing    • Product Mgmt      • Seller Mgmt     │           │
│  │  • Cart & Checkout     • Order Fulfillment • Transactions    │           │
│  └─────────────────────────┬───────────────────────────────────┘           │
│                            │ HTTP/REST (port 5173 → proxy → 8080)          │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                 Spring Boot Backend (Java 21)                │           │
│  │  • REST API Controllers    • Business Logic Services         │           │
│  │  • JPA/Hibernate ORM       • Observer Pattern (Notifications)│           │
│  │  • Factory Pattern (Notifications)  • Singleton (Settings)   │           │
│  └─────────────────────────┬───────────────────────────────────┘           │
│                            │ JDBC (port 5432/5433)                         │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    PostgreSQL Database                       │           │
│  │  • Users (Customer, Seller, Admin)  • Products & Inventory   │           │
│  │  • Orders & Transactions            • Wallets & Notifications│           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router, Vite |
| Backend | Spring Boot 3, Java 21, Spring Data JPA |
| Database | PostgreSQL 15 |
| Containerization | Docker, Docker Compose |

## Prerequisites

- **Java 21** (for running backend locally)
- **Maven** (for building backend)
- **Node.js 18+** and **npm** (for frontend)
- **PostgreSQL 15** (local install) OR **Docker** (recommended)

---

## Quick Start (Interactive Script)

The easiest way to get started is using the interactive startup script:

```bash
./start.sh
```

This script will:
- Guide you through choosing Docker or local setup
- Check all prerequisites
- Build and start the backend
- Install dependencies and start the frontend
- Provide helpful status messages throughout

---

## Quick Start with Docker (Recommended)

The easiest way to run the full stack is using Docker Compose.

### 1. Build the Backend JAR

```bash
cd Backend
./mvnw clean package -DskipTests
```

### 2. Start All Services

```bash
cd Backend
docker-compose up --build
```

This starts:
- **PostgreSQL** on port `5433`
- **Spring Boot Backend** on port `8080`

### 3. Start the Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API calls to the backend.

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api/v1

---

## Running Locally (Without Docker)

### Step 1: Set Up PostgreSQL Database

1. Install PostgreSQL 15
2. Create a database named `PASAR`:

```sql
CREATE DATABASE PASAR;
```

3. Run the initialization script:

```bash
psql -U postgres -d PASAR -f Backend/Database/init.sql
```

### Step 2: Configure Backend

Update `Backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/PASAR
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

### Step 3: Run Backend

```bash
cd Backend
./mvnw spring-boot:run
```

Backend will start on `http://localhost:8080`

### Step 4: Run Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`

The Vite dev server is configured to proxy `/api` requests to `http://localhost:8080`.

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pasar.com | admin123 |

New customers and sellers can register through the frontend.

---

## Project Structure

```
SoftwareDesignProjectG8/
├── Backend/
│   ├── src/main/java/com/kallavaninc/backend/
│   │   ├── Administrator/       # Admin controllers & services
│   │   ├── Authentication/      # Login & registration
│   │   ├── Customer/            # Customer operations
│   │   ├── Seller/              # Seller operations
│   │   ├── Product/             # Product management
│   │   ├── Order/               # Order processing
│   │   ├── Inventory/           # Stock management
│   │   ├── Payment/             # Wallet & transactions
│   │   ├── Notification/        # Email & in-app notifications
│   │   ├── Observer/            # Observer pattern interfaces
│   │   ├── PlatformSettings/    # Singleton settings
│   │   ├── Entities/            # JPA entities
│   │   ├── DTO/                 # Data transfer objects
│   │   └── config/              # Web & exception config
│   ├── Database/
│   │   └── init.sql             # Database schema
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── pom.xml
│
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── SellerDashboard.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api.js           # Customer & Seller API
│   │   │   ├── adminApi.js      # Admin API
│   │   │   └── cart.js          # Cart (localStorage)
│   │   ├── styles/
│   │   └── App.jsx              # Routes
│   ├── package.json
│   └── vite.config.js           # Proxy configuration
│
└── README.md
```

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login (all roles) |
| POST | `/api/v1/auth/register/customer` | Register customer |
| POST | `/api/v1/auth/register/seller` | Register seller |

### Customer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products/all` | Browse all products |
| GET | `/api/v1/products/filter?category=` | Filter by category |
| POST | `/api/v1/customer/{id}/order/{productId}` | Place order |
| GET | `/api/v1/customer/{id}/orders` | View my orders |
| POST | `/api/v1/customer/order/{orderId}/pay` | Pay for order |
| POST | `/api/v1/customer/wallet/{id}/topup` | Top up wallet |

### Seller
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products/seller/{sellerId}` | View my products |
| POST | `/api/v1/seller/{id}/addProduct` | Add product |
| PUT | `/api/v1/seller/{id}/products/{productId}` | Update product |
| DELETE | `/api/v1/seller/{id}/products/{productId}` | Delete product |
| GET | `/api/v1/seller/seller/{sellerId}` | View orders to fulfill |
| PATCH | `/api/v1/seller/{orderId}/shipment` | Update shipment status |
| POST | `/api/v1/seller/wallet/{id}/withdraw` | Withdraw funds |

### Administrator
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/sellers` | List all sellers |
| GET | `/api/v1/admin/sellers?approved=false` | List pending sellers |
| GET | `/api/v1/admin/sellers/{sellerId}` | View seller details |
| PUT | `/api/v1/admin/sellers/{sellerId}/approve` | Approve seller |
| GET | `/api/v1/admin/report?start=&end=` | Transaction report |
| GET | `/api/v1/admin/status/{status}` | Transactions by status |
| GET | `/api/v1/admin/user/{userId}` | User transaction history |
| GET | `/api/v1/admin/settings` | Get platform settings |
| PUT | `/api/v1/admin/settings/update` | Update settings |

---

## Design Patterns Used

| Pattern | Usage |
|---------|-------|
| **Observer** | `OrderService` notifies `NotificationService` on order events |
| **Factory** | `NotificationFactory` creates Email/InApp notifications |
| **Singleton** | `PlatformSettings` maintains single instance of config |
| **Repository** | Spring Data JPA repositories for data access |
| **DTO** | Data transfer objects for API requests/responses |

---

## Troubleshooting

### Backend won't start
- Ensure PostgreSQL is running on the correct port
- Check database credentials in `application.properties`
- Verify the database schema was initialized with `init.sql`

### Frontend can't connect to backend
- Ensure backend is running on port 8080
- Check Vite proxy config in `vite.config.js`
- Look for CORS errors in browser console

### Docker issues
- Run `docker-compose down -v` to reset volumes
- Rebuild with `docker-compose up --build`

---

## Contributors

Software Design Project - Group 8
