# Understanding the Changes We Made

This document explains the changes in simple terms for anyone new to coding.

---

## First, Let's Understand the Basics

### What is a Web Application?

Think of a web application like a **restaurant**:

```mermaid
flowchart LR
    subgraph Restaurant
        Customer["Customer\n(You)"]
        Menu["Menu & Tables\n(What you see)"]
        Kitchen["Kitchen\n(Where food is made)"]
    end

    Customer --> Menu
    Menu --> Kitchen

    subgraph CodingTerms [In Coding Terms]
        User[USER]
        Frontend[FRONTEND]
        Backend[BACKEND]
    end

    User -.-> Customer
    Frontend -.-> Menu
    Backend -.-> Kitchen
```

### The Three Main Parts

#### 1. Frontend (The Dining Area)
- **What it is**: Everything you see and interact with on a website
- **Examples**: Buttons, forms, images, menus, the login page
- **Restaurant analogy**: The dining area, menu, tables, decorations
- **Our tech**: React (JavaScript library for building user interfaces)

#### 2. Backend (The Kitchen)
- **What it is**: The "brain" that processes requests and handles data
- **Examples**: Checking if your password is correct, calculating totals, saving orders
- **Restaurant analogy**: The kitchen where chefs prepare food
- **Our tech**: Spring Boot (Java framework)

#### 3. Database (The Storage Room)
- **What it is**: Where all the information is permanently stored
- **Examples**: User accounts, products, orders, transaction history
- **Restaurant analogy**: The pantry/storage room with all ingredients and records
- **Our tech**: PostgreSQL

---

## What is an API?

**API** stands for **Application Programming Interface**.

Think of it as the **waiter** in our restaurant:

```mermaid
sequenceDiagram
    participant C as Customer<br>(Frontend)
    participant W as Waiter<br>(API)
    participant K as Kitchen<br>(Backend)

    C->>W: "I'd like the pasta please"<br>(Request)
    W->>K: Places order
    K->>K: Prepares food
    K->>W: Food ready
    W->>C: Here's your pasta!<br>(Response)
```

- You (customer) don't go into the kitchen yourself
- You tell the waiter what you want
- The waiter brings it back to you

In coding terms:
- The **frontend** doesn't directly access the database
- It sends a **request** to the **API**
- The **backend** processes it and sends back a **response**

---

## What is an Endpoint?

An **endpoint** is like a specific item on a menu that the waiter can bring you.

**Example endpoints in our app:**

| What You Want | Endpoint (Menu Item) | What Happens |
|---------------|---------------------|--------------|
| See all products | `/api/v1/products/all` | Kitchen sends list of all products |
| Login | `/api/v1/auth/login` | Kitchen checks your username/password |
| Place an order | `/api/v1/customer/{id}/order/{productId}` | Kitchen creates a new order |
| Approve a seller | `/api/v1/admin/sellers/{id}/approve` | Kitchen marks seller as approved |

The `/api/v1/` part is like saying "I'm ordering from the main menu, version 1"

---

## Our Application: PASAR

PASAR is an e-commerce platform (like a simple Shopee or Lazada) with three types of users:

```mermaid
flowchart TB
    subgraph Users [User Types]
        Customer[Customer<br>Shopper]
        Seller[Seller<br>Shop Owner]
        Admin[Administrator<br>Platform Manager]
    end

    subgraph CustomerActions [Customer Can]
        C1[Browse Products]
        C2[Add to Cart]
        C3[Place Orders]
        C4[Pay with Wallet]
        C5[Track Orders]
    end

    subgraph SellerActions [Seller Can]
        S1[List Products]
        S2[Manage Inventory]
        S3[Fulfill Orders]
        S4[Withdraw Earnings]
    end

    subgraph AdminActions [Admin Can]
        A1[Approve Sellers]
        A2[Monitor Transactions]
        A3[Configure Settings]
    end

    Customer --> CustomerActions
    Seller --> SellerActions
    Admin --> AdminActions
```

---

## What Changes Did We Make?

### Change 1: Added a Way to See All Sellers (Backend)

**The Problem**:
Before, the admin could only look up ONE seller at a time by typing their ID. That's like a restaurant manager having to remember every employee's ID number!

**What We Added**:
A new "menu item" (endpoint) that lets the admin see ALL sellers at once.

**Files Changed**:
```
Backend/
├── Authentication/AuthenticationRepository.java  ← Added search queries
├── Administrator/AdministratorService.java       ← Added business logic
└── Administrator/AdministratorController.java    ← Added the new endpoint
```

**Before vs After**:

```mermaid
flowchart LR
    subgraph Before
        A1[Admin] -->|Types Seller ID| B1[Sees ONE seller]
    end

    subgraph After
        A2[Admin] -->|Clicks View All| B2[Sees ALL sellers]
        A2 -->|Clicks Pending| B3[Sees only pending sellers]
    end
```

---

### Change 2: Admin Can Now Monitor Transactions (Frontend)

**The Problem**:
The admin dashboard had a "Transactions" tab, but it just showed a message saying "coming soon". The backend could already provide transaction data, but the frontend wasn't using it!

**What We Added**:
Connected the frontend to the backend so admins can actually search and view transactions.

**Files Changed**:
```
Frontend/
├── services/adminApi.js           ← Added functions to call transaction endpoints
├── pages/AdminDashboard.jsx       ← Added the transaction search interface
└── styles/AdminDashboardStyle.css ← Added styling for tables and popups
```

**Before vs After**:

```mermaid
flowchart LR
    subgraph Before
        A1[Admin opens Transactions tab] --> B1[Empty message:<br>Coming soon...]
    end

    subgraph After
        A2[Admin opens Transactions tab] --> B2[Search options]
        B2 --> C1[By Status]
        B2 --> C2[By User ID]
        B2 --> C3[By Date Range]
        C1 --> D[Results Table]
        C2 --> D
        C3 --> D
    end
```

**What the Transactions Tab Looks Like**:

```mermaid
flowchart TB
    subgraph TransactionsTab [Transactions Tab]
        SearchOptions[Search by:<br/>Status / User ID / Date Range]
        SearchOptions --> SearchButton[Search Button]
        SearchButton --> ResultsTable

        subgraph ResultsTable [Results Table]
            Header[ID<br/>From<br/>To<br/>Amount<br/>Status<br/>Date]
            Row1[abc123<br/>john@..<br/>shop@..<br/>RM 50<br/>PAID]
            Row2[def456<br/>jane@..<br/>mart@..<br/>RM 120<br/>PAID]
        end
    end
```

---

### Change 3: Improved Seller Management (Frontend)

**The Problem**:
To approve a seller, the admin had to know the seller's ID beforehand. There was no way to see a list of sellers waiting for approval.

**What We Added**:
A list that shows all sellers, with buttons to filter by "Pending" or "Approved" status.

**Files Changed**:
```
Frontend/
├── services/adminApi.js      ← Added function to get all sellers
└── pages/AdminDashboard.jsx  ← Added the seller list interface
```

**Before vs After**:

```mermaid
flowchart TB
    subgraph Before
        A1[Admin needs seller ID] --> B1[Types ID manually] --> C1[Views one seller]
    end

    subgraph After
        A2[Admin opens Sellers tab] --> B2[Sees list of ALL sellers]
        B2 --> Filter{Filter by}
        Filter -->|All| D1[All Sellers]
        Filter -->|Pending| D2[Pending Only]
        Filter -->|Approved| D3[Approved Only]
        D1 --> E[Click seller to view details]
        D2 --> E
        D3 --> E
        E --> F[Approve button]
    end
```

---

### Change 4: Created Seller Dashboard (New Feature!)

**The Problem**:
Sellers could register, but there was no page for them to manage their shop!

**What We Added**:
A complete dashboard for sellers with three sections:

**Files Created**:
```
Frontend/
├── pages/SellerDashboard.jsx       ← The main page (NEW FILE)
├── styles/SellerDashboard.css      ← Styling for the page (NEW FILE)
├── services/api.js                 ← Added helper function
└── App.jsx                         ← Added route so users can access /seller
```

**The Seller Dashboard Structure**:

```mermaid
flowchart TB
    subgraph SellerDashboard [Seller Dashboard]
        Tabs[Tabs: My Products | Orders | Wallet]

        subgraph ProductsTab [My Products Tab]
            ProductList[Product Cards Grid]
            AddButton[+ Add Product Button]
            EditDelete[Edit / Delete Buttons]
        end

        subgraph OrdersTab [Orders Tab]
            OrderTable[Orders Table]
            StatusDropdown[Shipment Status Dropdown:<br>Processing / Shipped / Delivered]
        end

        subgraph WalletTab [Wallet Tab]
            Balance[Balance Display: RM X,XXX.XX]
            WithdrawForm[Withdraw Amount Input]
            WithdrawButton[Withdraw Button]
        end

        Tabs --> ProductsTab
        Tabs --> OrdersTab
        Tabs --> WalletTab
    end
```

---

### Change 5: Updated Documentation (README)

**What We Added**:
- How the system works (architecture diagram)
- How to set up and run the project
- List of all features and API endpoints
- Troubleshooting tips

**File Changed**:
```
README.md
```

---

### Change 6: Created Startup Script

**The Problem**:
Starting the application required running multiple commands in the right order.

**What We Added**:
A single script that guides you through starting everything.

**File Created**:
```
start.sh
```

**How the Script Works**:

```mermaid
flowchart TB
    Start[Run ./start.sh] --> Menu{Choose an option}

    Menu -->|1| Docker[With Docker]
    Menu -->|2| Local[Without Docker]
    Menu -->|3| FrontendOnly[Frontend Only]
    Menu -->|4| Exit[Exit]

    Docker --> D1[Check Docker installed]
    D1 --> D2[Build backend JAR]
    D2 --> D3[Start database container]
    D3 --> D4[Start backend container]
    D4 --> D5[Install frontend deps]
    D5 --> D6[Start frontend]
    D6 --> Ready[Ready at localhost:5173]

    Local --> L1[Check Java/Maven installed]
    L1 --> L2[Confirm database configured]
    L2 --> L3[Start Spring Boot backend]
    L3 --> L4[Install frontend deps]
    L4 --> L5[Start frontend]
    L5 --> Ready
```

---

## Summary of All Changes

| What | Why | Files |
|------|-----|-------|
| List all sellers | Admin couldn't see pending sellers easily | 3 backend files |
| Transactions tab | Admin couldn't monitor payments | 3 frontend files |
| Seller list view | Admin had to memorize seller IDs | 2 frontend files |
| Seller dashboard | Sellers had no management page | 5 frontend files |
| README update | No documentation existed | 1 file |
| Startup script | Setup was complicated | 1 file |

---

## Glossary

| Term | Simple Explanation |
|------|-------------------|
| **Frontend** | The part of the app you see and click on |
| **Backend** | The part that processes data (hidden from users) |
| **Database** | Where all information is permanently stored |
| **API** | The messenger between frontend and backend |
| **Endpoint** | A specific "door" where you can request something |
| **Route** | A URL path like `/seller` or `/admin` |
| **Component** | A reusable piece of the user interface (like a button) |
| **Repository** | Code that talks to the database |
| **Service** | Code that contains business logic |
| **Controller** | Code that receives requests and sends responses |

---

## Visual: How a Login Works

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend<br>(Login Page)
    participant API as Backend API
    participant DB as Database

    User->>FE: Types email & password
    User->>FE: Clicks Login button

    FE->>API: POST /api/v1/auth/login<br>{email, password}

    API->>DB: Is this user valid?
    DB->>API: Yes! Here's their info

    API->>FE: {userId: "123", role: "CUSTOMER"}

    FE->>FE: Saves userId and role<br>to localStorage

    FE->>User: Redirects to<br>/customer dashboard
```

---

## The Full System Architecture

```mermaid
flowchart TB
    subgraph Users [Users]
        Customer[Customer]
        Seller[Seller]
        Admin[Administrator]
    end

    subgraph Frontend [Frontend - React App - Port 5173]
        CustomerDash[Customer Dashboard]
        SellerDash[Seller Dashboard]
        AdminDash[Admin Dashboard]
        Cart[Shopping Cart]
        Auth[Login / Register]
    end

    subgraph Backend [Backend - Spring Boot - Port 8080]
        AuthAPI[Auth API]
        ProductAPI[Product API]
        OrderAPI[Order API]
        AdminAPI[Admin API]
        SellerAPI[Seller API]
    end

    subgraph Database [PostgreSQL Database - Port 5432]
        UsersTable[(Users)]
        ProductsTable[(Products)]
        OrdersTable[(Orders)]
        TransactionsTable[(Transactions)]
    end

    Customer --> CustomerDash
    Seller --> SellerDash
    Admin --> AdminDash

    CustomerDash --> ProductAPI
    CustomerDash --> OrderAPI
    SellerDash --> SellerAPI
    SellerDash --> ProductAPI
    AdminDash --> AdminAPI

    Auth --> AuthAPI

    AuthAPI --> UsersTable
    ProductAPI --> ProductsTable
    OrderAPI --> OrdersTable
    AdminAPI --> TransactionsTable
    SellerAPI --> ProductsTable
```

---

## Questions?

If anything is still confusing, here are some resources:
- [MDN Web Docs](https://developer.mozilla.org/) - Great for web basics
- [React Documentation](https://react.dev/) - Learn about our frontend
- [Spring Boot Guides](https://spring.io/guides) - Learn about our backend

Remember: Everyone was a beginner once. Don't be afraid to ask questions!
