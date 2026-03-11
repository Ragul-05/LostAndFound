# 🔍 Lost & Found — AI-Powered Asset Lifecycle Management System

A full-stack enterprise SaaS application for tracking, managing, and recovering lost and found items.  
Built with **Spring Boot 3** (Java 21) on the backend and **React 19 + Vite + TailwindCSS** on the frontend.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture & Flow](#4-architecture--flow)
5. [Backend Deep Dive](#5-backend-deep-dive)
   - 5.1 [Data Models](#51-data-models)
   - 5.2 [DTOs](#52-dtos)
   - 5.3 [Repositories](#53-repositories)
   - 5.4 [Services](#54-services)
   - 5.5 [Controllers](#55-controllers)
   - 5.6 [AOP Aspects](#56-aop-aspects)
   - 5.7 [Exception Handling](#57-exception-handling)
6. [API Reference](#6-api-reference)
   - 6.1 [User Endpoints](#61-user-endpoints)
   - 6.2 [Item Endpoints](#62-item-endpoints)
7. [Frontend Deep Dive](#7-frontend-deep-dive)
   - 7.1 [Pages](#71-pages)
   - 7.2 [Components](#72-components)
   - 7.3 [Services (API Layer)](#73-services-api-layer)
   - 7.4 [Context (Auth State)](#74-context-auth-state)
8. [Full Request–Response Flow](#8-full-requestresponse-flow)
9. [Item Lifecycle State Machine](#9-item-lifecycle-state-machine)
10. [Design System](#10-design-system)
11. [Setup & Running](#11-setup--running)
12. [Environment Configuration](#12-environment-configuration)
13. [Error Response Format](#13-error-response-format)

---

## 1. Project Overview

Lost & Found is an **asset lifecycle management platform** that digitises the process of reporting, tracking, and recovering lost items in an organisation or campus. It features:

- **Public board** — anyone can browse reported items
- **User portal** — authenticated users can report lost/found items and track their submissions
- **Admin dashboard** — full lifecycle management (mark found → claim → dispatch), analytics charts, user management
- **AOP-powered logging** — every service call and slow controller request is automatically logged
- **Centralised error handling** — all exceptions return a consistent JSON error envelope
- **Role-based access** — `USER` and `ADMIN` roles with server-side enforcement

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend Language** | Java 21 |
| **Backend Framework** | Spring Boot 3.5.10 |
| **ORM** | Spring Data JPA + Hibernate 6 |
| **Database** | PostgreSQL 16 |
| **Password Hashing** | jBCrypt 0.4 |
| **Validation** | Jakarta Bean Validation (spring-boot-starter-validation) |
| **AOP** | Spring AOP + AspectJ Weaver |
| **API Docs** | SpringDoc OpenAPI 2.8.5 (Swagger UI) |
| **Build Tool** | Maven (Maven Wrapper) |
| **Frontend Language** | JavaScript (ES2022+) |
| **Frontend Framework** | React 19 |
| **Bundler** | Vite 5 |
| **CSS Framework** | TailwindCSS 4 |
| **Charts** | Recharts |
| **HTTP Client** | Axios |
| **Routing** | React Router DOM v7 |
| **Icons** | Lucide React |
| **Toasts** | React Hot Toast |

---

## 3. Project Structure

```
lostandfound/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/example/backend/
│       ├── BackendApplication.java          # Entry point
│       ├── aspects/
│       │   ├── LoggingAspect.java           # AOP: service-level logging
│       │   └── PerformanceAspect.java       # AOP: slow-request detection
│       ├── controllers/
│       │   ├── LostItemController.java      # /api/items/**
│       │   └── UserController.java          # /api/users/**
│       ├── dtos/
│       │   ├── LoginDto.java
│       │   ├── LoginResponseDto.java
│       │   ├── LostItemRequestDto.java
│       │   ├── LostItemResponseDto.java
│       │   └── UserRegistrationDto.java
│       ├── exception/
│       │   ├── AccessDeniedException.java
│       │   ├── BadRequestException.java
│       │   ├── GlobalExceptionHandler.java  # @RestControllerAdvice
│       │   └── ResourceNotFoundException.java
│       ├── models/
│       │   ├── ItemStatus.java              # Enum: LOST|FOUND|CLAIMED|DISPATCHED
│       │   ├── LostItem.java                # @Entity: lost_items table
│       │   ├── Role.java                    # Enum: USER|ADMIN
│       │   └── User.java                    # @Entity: users table
│       ├── repositories/
│       │   ├── LostItemRepository.java
│       │   └── UserRepository.java
│       └── services/
│           ├── LostItemService.java         # Interface
│           ├── LostItemServiceImpl.java     # Implementation
│           ├── UserService.java             # Interface
│           └── UserServiceImpl.java         # Implementation
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx                         # React entry point
        ├── App.jsx                          # Router setup
        ├── index.css                        # Design tokens + animations
        ├── assets/
        ├── components/
        │   ├── Navbar.jsx                   # Top navbar
        │   ├── Sidebar.jsx                  # Fixed left sidebar
        │   └── ui/
        │       ├── DataTable.jsx            # Sortable table
        │       ├── SearchFilterBar.jsx      # Search + filter row
        │       ├── StatCard.jsx             # KPI metric card
        │       └── StatusBadge.jsx          # Colour-coded status pill
        ├── context/
        │   └── AuthContext.jsx              # Global auth state (React Context)
        ├── layouts/
        │   └── Layout.jsx                   # Sidebar + TopNavbar shell
        ├── pages/
        │   ├── AdminDashboard.jsx
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── MyReports.jsx
        │   ├── Register.jsx
        │   └── ReportItem.jsx
        └── services/
            ├── api.js                       # Axios instance (baseURL /api)
            ├── authService.js               # register, login, getAllUsers
            └── itemService.js               # CRUD + stats for items
```

---

## 4. Architecture & Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                                                                   │
│  React App (Vite, port 5173)                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │ AuthCtx  │  │ Sidebar  │  │ TopNavbar │  │ react-hot-    │  │
│  │(localStorage)│        │  │           │  │ toast Toaster │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────────┘  │
│                                                                   │
│  Pages: Home │ Login │ Register │ ReportItem │ MyReports │ Admin │
│                                                                   │
│  Services: authService.js  itemService.js  api.js (Axios)       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP (JSON)
                           │ /api/**
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SPRING BOOT (port 8081)                     │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                AOP Interceptors                          │    │
│  │  PerformanceAspect (@Around controllers) →  warn >500ms │    │
│  │  LoggingAspect     (@Around services)   →  entry/exit   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                       │
│  ┌────────────────────────▼───────────────────────────────┐     │
│  │               Controllers (REST)                         │     │
│  │   UserController       /api/users/**                    │     │
│  │   LostItemController   /api/items/**                    │     │
│  └────────────────────────┬───────────────────────────────┘     │
│                           │                                       │
│  ┌────────────────────────▼───────────────────────────────┐     │
│  │                   Services                               │     │
│  │   UserServiceImpl       LostItemServiceImpl             │     │
│  └────────────────────────┬───────────────────────────────┘     │
│                           │                                       │
│  ┌────────────────────────▼───────────────────────────────┐     │
│  │                 Repositories (JPA)                       │     │
│  │   UserRepository        LostItemRepository              │     │
│  └────────────────────────┬───────────────────────────────┘     │
│                           │                                       │
│  ┌────────────────────────▼───────────────────────────────┐     │
│  │                GlobalExceptionHandler                    │     │
│  │   @RestControllerAdvice → structured JSON errors        │     │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ JDBC / HikariCP
                           ▼
                 ┌─────────────────┐
                 │  PostgreSQL 16  │
                 │  port 5432      │
                 │  db: lostandfound│
                 │  tables:        │
                 │  • users        │
                 │  • lost_items   │
                 └─────────────────┘
```

---

## 5. Backend Deep Dive

### 5.1 Data Models

#### `User` — table: `users`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BIGINT | PK, auto-increment |
| `username` | VARCHAR | NOT NULL, UNIQUE |
| `email` | VARCHAR | NOT NULL, UNIQUE |
| `password` | VARCHAR | NOT NULL (BCrypt hash) |
| `role` | VARCHAR | NOT NULL — `USER` or `ADMIN` |

#### `LostItem` — table: `lost_items`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BIGINT | PK, auto-increment |
| `item_name` | VARCHAR | NOT NULL |
| `description` | VARCHAR(500) | NOT NULL |
| `location` | VARCHAR | NOT NULL |
| `date_lost` | DATE | NOT NULL |
| `status` | VARCHAR | NOT NULL — `LOST`, `FOUND`, `CLAIMED`, `DISPATCHED` |
| `reported_by_id` | BIGINT | FK → users.id |
| `found_by_name` | VARCHAR | nullable |
| `found_by_user_id` | BIGINT | FK → users.id, nullable |
| `is_dispatched` | BOOLEAN | default false |

---

### 5.2 DTOs

#### `UserRegistrationDto` (request)
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

#### `LoginDto` (request)
```json
{
  "username": "john_doe",
  "password": "secret123"
}
```

#### `LoginResponseDto` (response)
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "USER",
  "message": "Login successful"
}
```

#### `LostItemRequestDto` (request)
```json
{
  "itemName": "Black Wallet",
  "description": "Leather wallet with ID cards inside",
  "location": "Library, Floor 2",
  "date": "2026-03-10",
  "type": "lost"
}
```
> `type` can be `"lost"` or `"found"`. When `"found"`, the item is created with `FOUND` status.

#### `LostItemResponseDto` (response)
```json
{
  "id": 42,
  "itemName": "Black Wallet",
  "description": "Leather wallet with ID cards inside",
  "location": "Library, Floor 2",
  "date": "2026-03-10",
  "status": "LOST",
  "reportedByUsername": "john_doe",
  "foundByName": null,
  "dispatch": false
}
```

---

### 5.3 Repositories

#### `UserRepository extends JpaRepository<User, Long>`
| Method | Generated By |
|--------|-------------|
| `findByUsername(String)` | Spring Data |
| `existsByUsername(String)` | Spring Data |
| `existsByEmail(String)` | Spring Data |
| `findAll()` | JpaRepository |

#### `LostItemRepository extends JpaRepository<LostItem, Long>`
| Method | Generated By |
|--------|-------------|
| `findAll()` | JpaRepository |
| `findById(Long)` | JpaRepository |
| `findByStatus(ItemStatus)` | Spring Data |
| `findByReportedById(Long)` | Spring Data |
| `save(LostItem)` | JpaRepository |

---

### 5.4 Services

#### `UserService` / `UserServiceImpl`

| Method | Description |
|--------|-------------|
| `registerUser(UserRegistrationDto)` | Validates unique username/email, hashes password with BCrypt, saves user with role `USER` |
| `authenticateUser(LoginDto)` | Finds user by username, BCrypt-compares password (with plain-text fallback for legacy accounts) |
| `findByUsername(String)` | Returns user or throws `ResourceNotFoundException` |
| `getAllUsers()` | Returns all users (admin use) |

#### `LostItemService` / `LostItemServiceImpl`

| Method | Description |
|--------|-------------|
| `reportLostItem(dto, username)` | Creates item as `LOST` (or `FOUND` if `type=="found"`), links to reporting user |
| `getAllLostItems()` | Returns all items across all users |
| `getReportedItemsByUser(username)` | Returns items reported by specific user |
| `reportFoundItem(itemId, adminUsername)` | Admin: transitions `LOST → FOUND`, sets `foundByUser` |
| `markAsClaimed(itemId, adminUsername)` | Admin: transitions `FOUND → CLAIMED` |
| `dispatchItem(itemId, adminUsername)` | Admin: transitions `FOUND/CLAIMED → DISPATCHED`, sets `dispatch=true` |
| `getStats()` | Returns `{ total, lost, found, claimed, dispatched }` counts |

---

### 5.5 Controllers

#### `UserController` — base path `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Authenticate user |
| GET | `/all` | Public* | Get all users (admin dashboard) |

#### `LostItemController` — base path `/api/items`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/report-lost?username=` | User | Report a lost or found item |
| GET | `/all` | Public | Get all items |
| GET | `/user/{username}` | User | Get items by user |
| GET | `/stats` | Public | Get status counts |
| POST | `/{id}/report-found?username=` | Admin | Mark item as FOUND |
| POST | `/{id}/claim?username=` | Admin | Mark item as CLAIMED |
| POST | `/{id}/dispatch?username=` | Admin | Mark item as DISPATCHED |

> *Auth is currently username-param based (no JWT token required). The `username` query parameter is used for role checks server-side.

---

### 5.6 AOP Aspects

#### `LoggingAspect` — targets all `services.*` methods

```
Pointcut: execution(* com.example.backend.services.*.*(..))
```

| Advice | Trigger | Action |
|--------|---------|--------|
| `@Around` | Every service method call | Logs method name on entry, execution time on exit |
| `@AfterThrowing` | Any exception in services | Logs full exception class name and message |

**Sample log output:**
```
INFO  [SERVICE] → UserServiceImpl.authenticateUser(..)
INFO  [SERVICE] ← UserServiceImpl.authenticateUser(..) completed in 85ms
WARN  [SERVICE] ✗ LostItemServiceImpl.reportFoundItem(..) threw BadRequestException: Item is not currently LOST
ERROR [SERVICE EXCEPTION] com.example.backend.exception.BadRequestException: Item is not currently LOST
```

#### `PerformanceAspect` — targets all `controllers.*` methods

```
Pointcut: execution(* com.example.backend.controllers.*.*(..))
Threshold: 500ms
```

| Advice | Trigger | Action |
|--------|---------|--------|
| `@Around` | Every controller method | Measures wall-clock time; logs WARN if > 500ms, DEBUG otherwise |

**Sample log output:**
```
DEBUG [PERFORMANCE] LostItemController.getAllLostItems() completed in 42ms
WARN  [PERFORMANCE] Slow request detected: LostItemController.getAllLostItems() took 623ms (threshold: 500ms)
```

---

### 5.7 Exception Handling

All exceptions are caught by `GlobalExceptionHandler` (`@RestControllerAdvice`) and returned as structured JSON.

#### Exception → HTTP Status Mapping

| Exception Class | HTTP Status | Scenario |
|----------------|-------------|---------|
| `ResourceNotFoundException` | 404 Not Found | User/item not found in DB |
| `AccessDeniedException` | 403 Forbidden | Non-admin tries admin action |
| `BadRequestException` | 400 Bad Request | Duplicate username, wrong item status, bad password |
| `MethodArgumentNotValidException` | 400 Bad Request | Bean Validation (`@Valid`) failure |
| `Exception` (fallback) | 500 Internal Server Error | Any unhandled exception |

#### Error Response Envelope

```json
{
  "timestamp": "2026-03-10T14:25:31.847",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: ADMIN role required",
  "path": "/api/items/5/report-found"
}
```

---

## 6. API Reference

> **Base URL:** `http://localhost:8081/api`  
> **Content-Type:** `application/json`  
> **CORS:** `*` (all origins allowed)

---

### 6.1 User Endpoints

---

#### `POST /users/register`

Register a new user account. All new registrations get `USER` role.

**Request Body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "mypassword123"
}
```

**Success Response — `200 OK`:**
```json
{
  "id": 3,
  "username": "alice",
  "email": "alice@example.com",
  "role": "USER",
  "message": "User registered successfully"
}
```

**Error — `400 Bad Request` (username taken):**
```json
{
  "timestamp": "2026-03-10T10:00:00.000",
  "status": 400,
  "error": "Bad Request",
  "message": "Username already exists",
  "path": "/api/users/register"
}
```

**Error — `400 Bad Request` (email taken):**
```json
{
  "timestamp": "2026-03-10T10:00:01.000",
  "status": 400,
  "error": "Bad Request",
  "message": "Email already exists",
  "path": "/api/users/register"
}
```

---

#### `POST /users/login`

Authenticate an existing user. Returns user data for client-side session storage.

**Request Body:**
```json
{
  "username": "alice",
  "password": "mypassword123"
}
```

**Success Response — `200 OK`:**
```json
{
  "id": 3,
  "username": "alice",
  "email": "alice@example.com",
  "role": "USER",
  "message": "Login successful"
}
```

**Error — `400 Bad Request`:**
```json
{
  "timestamp": "2026-03-10T10:05:00.000",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid username or password",
  "path": "/api/users/login"
}
```

---

#### `GET /users/all`

Retrieve all registered users. Used by the Admin Dashboard user management tab.

**Request:** No body, no params.

**Success Response — `200 OK`:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  {
    "id": 2,
    "username": "bob",
    "email": "bob@example.com",
    "role": "USER"
  },
  {
    "id": 3,
    "username": "alice",
    "email": "alice@example.com",
    "role": "USER"
  }
]
```

---

### 6.2 Item Endpoints

---

#### `POST /items/report-lost?username={username}`

Report a new lost **or** found item. The `type` field in the body controls initial status.

**Query Parameter:**

| Param | Required | Description |
|-------|----------|-------------|
| `username` | ✅ Yes | Username of the person reporting |

**Request Body:**
```json
{
  "itemName": "Blue Umbrella",
  "description": "Navy blue folding umbrella with wooden handle",
  "location": "Cafeteria, Building B",
  "date": "2026-03-09",
  "type": "lost"
}
```
> Set `"type": "found"` to report a found item (sets initial status to `FOUND`).

**Success Response — `200 OK`:**
```json
{
  "id": 7,
  "itemName": "Blue Umbrella",
  "description": "Navy blue folding umbrella with wooden handle",
  "location": "Cafeteria, Building B",
  "date": "2026-03-09",
  "status": "LOST",
  "reportedByUsername": "alice",
  "foundByName": null,
  "dispatch": false
}
```

**Error — `404 Not Found` (user not found):**
```json
{
  "timestamp": "2026-03-10T11:00:00.000",
  "status": 404,
  "error": "Not Found",
  "message": "User not found: alice_typo",
  "path": "/api/items/report-lost"
}
```

---

#### `GET /items/all`

Retrieve all items across all users, regardless of status.

**Request:** No body, no params.

**Success Response — `200 OK`:**
```json
[
  {
    "id": 1,
    "itemName": "Black Wallet",
    "description": "Leather wallet with student ID",
    "location": "Library, Floor 2",
    "date": "2026-03-01",
    "status": "LOST",
    "reportedByUsername": "bob",
    "foundByName": null,
    "dispatch": false
  },
  {
    "id": 2,
    "itemName": "Apple AirPods Pro",
    "description": "White case, engraved initials J.D.",
    "location": "Gym changing room",
    "date": "2026-03-05",
    "status": "FOUND",
    "reportedByUsername": "alice",
    "foundByName": "admin",
    "dispatch": false
  },
  {
    "id": 3,
    "itemName": "Red Backpack",
    "description": "Nike backpack, 30L, has a blue keychain",
    "location": "Bus stop Gate 3",
    "date": "2026-03-08",
    "status": "DISPATCHED",
    "reportedByUsername": "charlie",
    "foundByName": "admin",
    "dispatch": true
  }
]
```

---

#### `GET /items/user/{username}`

Retrieve all items reported by a specific user.

**Path Parameter:**

| Param | Description |
|-------|-------------|
| `username` | Username whose items to fetch |

**Success Response — `200 OK`:**
```json
[
  {
    "id": 4,
    "itemName": "Blue Umbrella",
    "description": "Navy blue folding umbrella with wooden handle",
    "location": "Cafeteria, Building B",
    "date": "2026-03-09",
    "status": "LOST",
    "reportedByUsername": "alice",
    "foundByName": null,
    "dispatch": false
  }
]
```

**Error — `404 Not Found`:**
```json
{
  "timestamp": "2026-03-10T11:05:00.000",
  "status": 404,
  "error": "Not Found",
  "message": "User not found: unknown_user",
  "path": "/api/items/user/unknown_user"
}
```

---

#### `GET /items/stats`

Returns aggregate counts per status. Used by the Admin Dashboard stat cards and charts.

**Request:** No body, no params.

**Success Response — `200 OK`:**
```json
{
  "total": 25,
  "lost": 12,
  "found": 7,
  "claimed": 4,
  "dispatched": 2
}
```

---

#### `POST /items/{itemId}/report-found?username={adminUsername}`

**Admin only.** Transitions an item from `LOST → FOUND`. Sets the admin as the finder.

**Path Parameter:**

| Param | Description |
|-------|-------------|
| `itemId` | ID of the item to mark as found |

**Query Parameter:**

| Param | Required | Description |
|-------|----------|-------------|
| `username` | ✅ Yes | Must be an `ADMIN` user |

**Request Body:** None

**Success Response — `200 OK`:**
```json
{
  "id": 1,
  "itemName": "Black Wallet",
  "description": "Leather wallet with student ID",
  "location": "Library, Floor 2",
  "date": "2026-03-01",
  "status": "FOUND",
  "reportedByUsername": "bob",
  "foundByName": "admin",
  "dispatch": false
}
```

**Error — `403 Forbidden` (not admin):**
```json
{
  "timestamp": "2026-03-10T12:00:00.000",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: ADMIN role required",
  "path": "/api/items/1/report-found"
}
```

**Error — `400 Bad Request` (wrong current status):**
```json
{
  "timestamp": "2026-03-10T12:01:00.000",
  "status": 400,
  "error": "Bad Request",
  "message": "Item is not currently LOST (status: FOUND)",
  "path": "/api/items/1/report-found"
}
```

**Error — `404 Not Found`:**
```json
{
  "timestamp": "2026-03-10T12:02:00.000",
  "status": 404,
  "error": "Not Found",
  "message": "Item not found: 999",
  "path": "/api/items/999/report-found"
}
```

---

#### `POST /items/{itemId}/claim?username={adminUsername}`

**Admin only.** Transitions an item from `FOUND → CLAIMED`.

**Path Parameter:**

| Param | Description |
|-------|-------------|
| `itemId` | ID of the item to mark as claimed |

**Query Parameter:**

| Param | Required | Description |
|-------|----------|-------------|
| `username` | ✅ Yes | Must be an `ADMIN` user |

**Request Body:** None

**Success Response — `200 OK`:**
```json
{
  "id": 2,
  "itemName": "Apple AirPods Pro",
  "description": "White case, engraved initials J.D.",
  "location": "Gym changing room",
  "date": "2026-03-05",
  "status": "CLAIMED",
  "reportedByUsername": "alice",
  "foundByName": "admin",
  "dispatch": false
}
```

**Error — `403 Forbidden`:**
```json
{
  "timestamp": "2026-03-10T12:10:00.000",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: ADMIN role required",
  "path": "/api/items/2/claim"
}
```

**Error — `400 Bad Request` (item not in FOUND state):**
```json
{
  "timestamp": "2026-03-10T12:11:00.000",
  "status": 400,
  "error": "Bad Request",
  "message": "Item must be FOUND before it can be CLAIMED (status: LOST)",
  "path": "/api/items/2/claim"
}
```

---

#### `POST /items/{itemId}/dispatch?username={adminUsername}`

**Admin only.** Transitions a `FOUND` or `CLAIMED` item to `DISPATCHED`. Also sets `dispatch = true`.

**Path Parameter:**

| Param | Description |
|-------|-------------|
| `itemId` | ID of the item to dispatch |

**Query Parameter:**

| Param | Required | Description |
|-------|----------|-------------|
| `username` | ✅ Yes | Must be an `ADMIN` user |

**Request Body:** None

**Success Response — `200 OK`:**
```json
{
  "id": 2,
  "itemName": "Apple AirPods Pro",
  "description": "White case, engraved initials J.D.",
  "location": "Gym changing room",
  "date": "2026-03-05",
  "status": "DISPATCHED",
  "reportedByUsername": "alice",
  "foundByName": "admin",
  "dispatch": true
}
```

**Error — `400 Bad Request` (wrong status):**
```json
{
  "timestamp": "2026-03-10T12:20:00.000",
  "status": 400,
  "error": "Bad Request",
  "message": "Only FOUND or CLAIMED items can be dispatched (status: LOST)",
  "path": "/api/items/2/dispatch"
}
```

---

## 7. Frontend Deep Dive

### 7.1 Pages

#### `/` — `Home.jsx`
- **Access:** Public
- **Fetches:** `GET /api/items/all`
- **Features:**
  - Gradient hero banner with live item counters (Total / Lost / Found)
  - `SearchFilterBar` — search by name/location, filter by status
  - Responsive card grid — each card shows status badge, item name, description, location, date, reporter
  - Card top accent colour matches status (red=LOST, green=FOUND, blue=CLAIMED, teal=DISPATCHED)
  - Hover lift effect with shadow and border highlight
  - Skeleton loading placeholders (6 cards)
  - Empty state with "Report an Item" CTA for authenticated users
  - Unauthenticated users see "Sign In" / "Get Started" buttons in hero

#### `/login` — `Login.jsx`
- **Access:** Public (redirects to `/` if already logged in)
- **Posts to:** `POST /api/users/login`
- **Features:**
  - Centered white card with Deep Blue → Teal gradient top bar
  - Username + password fields (show/hide password toggle)
  - Loading spinner on submit button
  - `toast.success()` on success → redirects to home
  - `toast.error()` on failure with server error message

#### `/register` — `Register.jsx`
- **Access:** Public
- **Posts to:** `POST /api/users/register`
- **Features:**
  - Centered white card with Teal → Deep Blue gradient top bar
  - Username, email, password fields (show/hide toggle, min 6 chars)
  - `toast.success()` → auto-redirects to `/login` after 1.5s
  - `toast.error()` with server-provided message

#### `/report` — `ReportItem.jsx`
- **Access:** Authenticated users only (redirects to `/login`)
- **Posts to:** `POST /api/items/report-lost?username=`
- **Features:**
  - Two-tab toggle: "I Lost Something" / "I Found Something" (controls `type` param)
  - Status info bar — explains what the selected type means
  - Form fields: item name, description, location, date
  - Reporter avatar chip showing current user
  - `toast.success()` → redirects to `/my-reports`
  - `toast.error()` on failure

#### `/my-reports` — `MyReports.jsx`
- **Access:** Authenticated users only
- **Fetches:** `GET /api/items/user/{username}`
- **Features:**
  - Mini status stats row (Total / Lost / Found / Dispatched)
  - `SearchFilterBar` — search + status filter
  - `DataTable` with sortable columns: #, Item (name + description), Status, Location, Date
  - Actions column: "Mark Found" button for LOST items, `StatusBadge` for others
  - `toast.loading/success/error` for mark-found action
  - Empty state with "Submit Your First Report" CTA

#### `/admin` — `AdminDashboard.jsx`
- **Access:** ADMIN role only (redirects to `/` if USER, to `/login` if unauthenticated)
- **Fetches:** `GET /api/items/all`, `GET /api/items/stats`, `GET /api/users/all` (parallel)
- **Features:**
  - 5 `StatCard` KPIs: Total Items, Lost, Found, Dispatched, Total Users
  - `BarChart` — items grouped by status (Recharts `BarChart` with custom cell colours)
  - `PieChart` — status distribution donut (Recharts `PieChart` with `innerRadius`)
  - Tabs: **All Items** / **Users**
  - Items tab: `SearchFilterBar` + `DataTable` with admin action buttons per row
    - LOST → "✓ Found" button
    - FOUND → "📋 Claim" + "🚀 Dispatch" buttons
    - CLAIMED → "🚀 Dispatch" button
    - DISPATCHED → "Done" text
  - Users tab: `DataTable` with id, username, email, role badge
  - All actions use `toast.loading/success/error` pattern
  - Refresh button re-fetches all three endpoints in parallel

---

### 7.2 Components

#### `Sidebar.jsx`
- Fixed left sidebar, `240px` wide (collapsible to `72px`)
- Deep Blue gradient background (`#1E3A8A` → `#153069`)
- Logo at top with collapse toggle button
- Role-filtered navigation links (uses `useAuth()`)
  - Home — always visible
  - Report Item — authenticated users
  - My Reports — authenticated users
  - Admin Panel — ADMIN only
- Active link: white text, teal left border, highlighted background
- Bottom section: user avatar with initials, username, role chip, Sign Out button
- Smooth `width` transition via CSS `transition: 0.25s ease`

#### `Navbar.jsx` (Top Bar)
- Sticky top header, `72px` tall, white background
- Left: page title + subtitle (derived from current route path)
- Centre: search input with focus ring
- Right: notification bell (with red dot), user avatar dropdown
- Dropdown: shows username, email, sign-out button
- Unauthenticated: shows "Sign In" + "Register" buttons

#### `StatCard.jsx`
```
Props: title, value, icon (Lucide), color, bgColor, trend, trendLabel, loading
```
- White card, `12px` border-radius, soft shadow
- Icon in coloured square background top-right
- Large value number, small title label
- Optional trend badge (green ↑ / red ↓ with percentage)
- Skeleton loading state (pulsing grey bar)
- Hover: `translateY(-2px)` with enhanced shadow

#### `StatusBadge.jsx`
```
Props: status ('LOST'|'FOUND'|'CLAIMED'|'DISPATCHED'), size ('sm'|'lg')
```
| Status | Background | Text Colour | Border |
|--------|-----------|-------------|--------|
| LOST | `#FEF2F2` | `#DC2626` | `#FECACA` |
| FOUND | `#ECFDF5` | `#059669` | `#A7F3D0` |
| CLAIMED | `#EFF6FF` | `#1D4ED8` | `#BFDBFE` |
| DISPATCHED | `#F0FDFA` | `#0F766E` | `#99F6E4` |

#### `DataTable.jsx`
```
Props: columns[], data[], loading, emptyMessage, actions(row)
```
- Click-to-sort column headers with `ChevronUp/Down` indicators
- Sort direction toggles: asc → desc → asc
- Row hover: `#F9FAFB` background
- Skeleton loading: 4 rows of pulsing grey bars
- Footer: "Showing N records"
- `actions` render prop: receives row data, renders action buttons in last column

#### `SearchFilterBar.jsx`
```
Props: search, onSearch, filters[], placeholder, actions
```
- White card container with soft shadow
- Search input with `Search` icon prefix and focus ring
- One or more `<select>` filter dropdowns with `Filter` icon prefix
- Right-side `actions` slot for extra buttons (e.g. Refresh)

---

### 7.3 Services (API Layer)

#### `api.js` — Axios instance
```javascript
baseURL: '/api'   // proxied by Vite to http://localhost:8081/api
headers: { 'Content-Type': 'application/json' }
```

#### `authService.js`
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `registerUser(data)` | POST | `/users/register` | Create account |
| `loginUser(data)` | POST | `/users/login` | Authenticate |
| `getAllUsers()` | GET | `/users/all` | Fetch all users |

#### `itemService.js`
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `getAllItems()` | GET | `/items/all` | All items |
| `getItemStats()` | GET | `/items/stats` | Status counts |
| `reportLostItem(data, username)` | POST | `/items/report-lost?username=` | New report |
| `getUserItems(username)` | GET | `/items/user/{username}` | User's items |
| `reportFoundItem(id, username)` | POST | `/items/{id}/report-found?username=` | Mark found |
| `claimItem(id, username)` | POST | `/items/{id}/claim?username=` | Mark claimed |
| `dispatchItem(id, username)` | POST | `/items/{id}/dispatch?username=` | Dispatch |

---

### 7.4 Context (Auth State)

#### `AuthContext.jsx`

Provides global authentication state via React Context. Persists to `localStorage` under the key `lf_user`.

**State shape stored:**
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "role": "USER"
}
```

**Exposed values:**
| Value | Type | Description |
|-------|------|-------------|
| `user` | Object \| null | Current user data |
| `isAuthenticated` | boolean | `true` if `user !== null` |
| `login(userData)` | Function | Sets user in state + localStorage |
| `logout()` | Function | Clears user from state + localStorage |

---

## 8. Full Request–Response Flow

### Flow 1: User Registers and Reports a Lost Item

```
1. User fills Register form
   → Frontend: POST /api/users/register
     Body: { username, email, password }
   ← Backend: 200 { id, username, email, role: "USER", message }
   → AuthContext.login() stores user in localStorage
   → React Router navigates to /login

2. User logs in
   → Frontend: POST /api/users/login
     Body: { username, password }
   ← Backend: 200 { id, username, email, role, message }
   → AuthContext.login() stores session
   → Navigate to /

3. User clicks "Report Item" → navigates to /report
   → Selects "I Lost Something"
   → Fills in itemName, description, location, date
   → Submits form

4. Frontend: POST /api/items/report-lost?username=alice
   Body: { itemName, description, location, date, type: "lost" }

   AOP LoggingAspect fires:
     [SERVICE] → LostItemServiceImpl.reportLostItem(..)

   Service logic:
     - Finds user by username (or throws ResourceNotFoundException)
     - Creates LostItem with status = LOST
     - Saves to PostgreSQL

     [SERVICE] ← LostItemServiceImpl.reportLostItem(..) completed in 34ms

   AOP PerformanceAspect fires:
     [PERFORMANCE] LostItemController.reportLostItem(..) completed in 38ms

   ← Backend: 200 { id, itemName, ..., status: "LOST", dispatch: false }

5. react-hot-toast shows "Report submitted successfully!"
   → Navigate to /my-reports
```

---

### Flow 2: Admin Manages Item Lifecycle

```
1. Admin logs in with ADMIN account
   → POST /api/users/login
   ← 200 { role: "ADMIN" }
   → AuthContext stores user
   → Sidebar shows "Admin Panel" link

2. Admin navigates to /admin
   → AdminDashboard mounts
   → Promise.all([
       GET /api/items/all,
       GET /api/items/stats,
       GET /api/users/all
     ])
   ← All three responses arrive in parallel
   → StatCards show: Total=25, Lost=12, Found=7, Claimed=4, Dispatched=2
   → BarChart and PieChart render with data
   → DataTable lists all items

3. Admin sees item #1 "Black Wallet" with status LOST
   → Clicks "✓ Found" button

4. Frontend: POST /api/items/1/report-found?username=admin

   PerformanceAspect starts timer
   LoggingAspect: [SERVICE] → LostItemServiceImpl.reportFoundItem(..)

   Service:
     - checkAdmin("admin") → validates ADMIN role
     - Finds item #1 → status is LOST ✓
     - Sets status = FOUND, foundByUser = admin, foundByName = "admin"
     - Saves

   LoggingAspect: [SERVICE] ← completed in 21ms
   PerformanceAspect: [PERFORMANCE] completed in 25ms

   ← 200 { ..., status: "FOUND", foundByName: "admin" }
   → toast.success("Mark as Found successful")
   → fetchAll() re-fetches all data → table refreshes

5. Admin clicks "📋 Claim" on item #1
   → POST /api/items/1/claim?username=admin
   ← 200 { ..., status: "CLAIMED" }
   → Table refreshes

6. Admin clicks "🚀 Dispatch" on item #1
   → POST /api/items/1/dispatch?username=admin
   ← 200 { ..., status: "DISPATCHED", dispatch: true }
   → Item row shows "Done" — no more actions available
```

---

### Flow 3: Error Flow — Non-Admin Tries Admin Action

```
1. Regular user "alice" (role: USER) somehow calls:
   POST /api/items/5/report-found?username=alice

2. AOP LoggingAspect fires for service method

3. Service: checkAdmin("alice")
   → Finds user alice, role = USER
   → throws new AccessDeniedException("Access denied: ADMIN role required")

4. AOP LoggingAspect @AfterThrowing:
   [SERVICE EXCEPTION] com.example.backend.exception.AccessDeniedException: Access denied

5. GlobalExceptionHandler.handleAccessDenied() catches exception:
   → Builds error envelope
   ← 403 Forbidden:
   {
     "timestamp": "2026-03-10T14:30:00.000",
     "status": 403,
     "error": "Forbidden",
     "message": "Access denied: ADMIN role required",
     "path": "/api/items/5/report-found"
   }

6. Frontend Axios receives 403
   → toast.error("Access denied: ADMIN role required")
```

---

## 9. Item Lifecycle State Machine

```
         Report Lost          Mark Found (Admin)
  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  │                                                   │
  ▼                                                   │
┌──────┐    reportFoundItem()    ┌───────┐            │
│ LOST │ ──────────────────────► │ FOUND │            │
└──────┘                         └───────┘            │
                                    │   │             │
                     markAsClaimed()│   │dispatchItem()
                                    ▼   │             │
                               ┌─────────┐            │
                               │ CLAIMED │            │
                               └─────────┘            │
                                    │                  │
                     dispatchItem() │                  │
                                    ▼                  │
                              ┌──────────┐             │
                              │DISPATCHED│ ◄───────────┘
                              └──────────┘
                               (terminal)

  Report Found (type="found") ──► FOUND (immediate)
```

**Valid transitions:**
| From | To | Action | Who |
|------|----|--------|-----|
| `LOST` | `FOUND` | `reportFoundItem()` | ADMIN |
| `FOUND` | `CLAIMED` | `markAsClaimed()` | ADMIN |
| `FOUND` | `DISPATCHED` | `dispatchItem()` | ADMIN |
| `CLAIMED` | `DISPATCHED` | `dispatchItem()` | ADMIN |
| Initial | `LOST` | `reportLostItem(type=lost)` | Any User |
| Initial | `FOUND` | `reportLostItem(type=found)` | Any User |

---

## 10. Design System

### Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#1E3A8A` | Sidebar, buttons, links, focus rings |
| Teal | `#0D9488` | Secondary actions, DISPATCHED status, accents |
| Background | `#F3F4F6` | Page background |
| White | `#FFFFFF` | Cards, sidebar sections, input backgrounds |
| Success | `#10B981` | FOUND status, success toasts |
| Warning | `#F59E0B` | ADMIN badge, warning states |
| Danger | `#EF4444` | LOST status, error toasts, delete actions |
| Text | `#111827` | Primary text |
| Text Muted | `#6B7280` | Subtitles, placeholder text |
| Border | `#E5E7EB` | Card borders, dividers, input borders |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Body | Inter | 400 | 0.875rem |
| Labels | Inter | 600 | 0.8rem |
| Card titles | Inter | 700 | 1rem |
| Page headings | Inter | 800 | 1.5–1.75rem |
| Stat values | Inter | 800 | 2rem |
| Badges | Inter | 700 | 0.68–0.78rem |

### Spacing & Borders

| Property | Value |
|----------|-------|
| Card border-radius | `12px` |
| Button border-radius | `8–10px` |
| Card padding | `1.25–1.75rem` |
| Card shadow | `0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)` |
| Card hover shadow | `0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.1)` |
| Sidebar width | `240px` (collapsed: `72px`) |
| Top navbar height | `72px` |

### Animations

| Class | Effect |
|-------|--------|
| `.animate-fade-in` | `opacity: 0 → 1, translateY(8px → 0)` over 350ms |
| `.animate-slide-in` | `opacity: 0 → 1, translateX(20px → 0)` over 300ms |
| `.animate-spin` | Continuous 360° rotation (used for loading spinners) |
| `.animate-pulse` | Opacity oscillates 1 → 0.5 → 1 (used for skeleton loaders) |

---

## 11. Setup & Running

### Prerequisites

| Tool | Version |
|------|---------|
| Java | 21+ |
| Maven | via included `mvnw` wrapper |
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 15+ |

### Database Setup

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE lostandfound;

-- Tables are auto-created by Hibernate (spring.jpa.hibernate.ddl-auto=update)
-- To create an admin user, register normally then update via SQL:
UPDATE users SET role = 'ADMIN' WHERE username = 'your_admin_username';
```

### Backend

```bash
cd backend

# Run with Maven wrapper (downloads dependencies automatically)
./mvnw spring-boot:run          # Linux/Mac
.\mvnw.cmd spring-boot:run      # Windows PowerShell

# Backend starts on: http://localhost:8081
# Swagger UI: http://localhost:8081/swagger-ui/index.html
# OpenAPI JSON: http://localhost:8081/v3/api-docs
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server (proxies /api to :8081)
npm run dev

# Frontend starts on: http://localhost:5173
# (or :5174, :5175 if ports are occupied)

# Production build
npm run build
```

### Vite Proxy (auto-configured)

Vite proxies all `/api` requests to the backend. The `vite.config.js` should include:

```js
export default {
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8081'
    }
  }
}
```

---

## 12. Environment Configuration

### `backend/src/main/resources/application.properties`

```properties
spring.application.name=backend
server.port=8081

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/lostandfound
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Date serialisation (ISO strings, not arrays)
spring.jackson.serialization.write-dates-as-timestamps=false

# Logging for AOP output
logging.level.com.example.backend.aspects=DEBUG
logging.level.org.springframework.web=DEBUG
```

---

## 13. Error Response Format

Every API error returns the same JSON envelope:

```json
{
  "timestamp": "2026-03-10T14:25:31.847",
  "status": 400,
  "error": "Bad Request",
  "message": "Human-readable error description",
  "path": "/api/items/5/claim"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | ISO 8601 string | When the error occurred |
| `status` | integer | HTTP status code |
| `error` | string | HTTP reason phrase |
| `message` | string | Developer/user-friendly message |
| `path` | string | Request URI that caused the error |

### All Possible Error Messages

| Endpoint | Scenario | Status | Message |
|----------|----------|--------|---------|
| `POST /users/register` | Username taken | 400 | `Username already exists` |
| `POST /users/register` | Email taken | 400 | `Email already exists` |
| `POST /users/login` | Wrong credentials | 400 | `Invalid username or password` |
| `POST /items/report-lost` | User not found | 404 | `User not found: {username}` |
| `GET /items/user/{u}` | User not found | 404 | `User not found: {username}` |
| `POST /items/{id}/report-found` | Not admin | 403 | `Access denied: ADMIN role required` |
| `POST /items/{id}/report-found` | Item not LOST | 400 | `Item is not currently LOST (status: {s})` |
| `POST /items/{id}/report-found` | Item not found | 404 | `Item not found: {id}` |
| `POST /items/{id}/claim` | Not admin | 403 | `Access denied: ADMIN role required` |
| `POST /items/{id}/claim` | Item not FOUND | 400 | `Item must be FOUND before it can be CLAIMED (status: {s})` |
| `POST /items/{id}/claim` | Item not found | 404 | `Item not found: {id}` |
| `POST /items/{id}/dispatch` | Not admin | 403 | `Access denied: ADMIN role required` |
| `POST /items/{id}/dispatch` | Wrong status | 400 | `Only FOUND or CLAIMED items can be dispatched (status: {s})` |
| `POST /items/{id}/dispatch` | Item not found | 404 | `Item not found: {id}` |
| Any endpoint | Unexpected error | 500 | `An unexpected error occurred: {detail}` |

---

*© 2026 Lost & Found — AI-Powered Asset Lifecycle Management System*
#   L o s e - A n d - F o u n d  
 #   L o s t - A n d - F o u n d -  
 #   L o s t A n d F o u n d  
 