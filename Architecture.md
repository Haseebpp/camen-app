# 🏗️ SalesTrack Architecture

> A multi-user sales tracking & inventory management system

---

## System Overview

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   🖥️ Frontend   │       │   ⚙️ Backend    │       │   🗄️ Database   │
│  React + Redux  │◄─────►│  Express.js API │◄─────►│    MongoDB      │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                   REST API              Mongoose ODM
```

---

## 🔐 Authentication Flow

```
┌──────┐    1. Login     ┌──────────┐   2. Verify    ┌──────────┐
│ User │ ───────────────►│  Server  │ ──────────────►│ Database │
└──────┘                 └──────────┘                └──────────┘
   ▲                          │                           │
   │     4. JWT Cookie        │      3. User Found        │
   └──────────────────────────┤◄──────────────────────────┘
                              │
   ┌──────────────────────────┘
   │
   ▼
┌──────┐  5. Request + Cookie  ┌──────────┐
│ User │ ─────────────────────►│  Server  │
└──────┘                       └──────────┘
   ▲                                │
   │         7. Return Data         │  6. Verify JWT
   └────────────────────────────────┘
```

---

## 🗂️ Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS                                       │
│  _id | name | email (unique) | password | isAdmin                       │
└─────────────────────────────────────────────────────────────────────────┘
         │              │              │              │
         │ owns         │ creates      │ records      │ has
         ▼              ▼              ▼              ▼
    ┌─────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
    │PRODUCTS │    │  SALES  │    │ EXPENSES │    │ SETTINGS │
    └─────────┘    └─────────┘    └──────────┘    └──────────┘
         │              │              │
         │              │              │
         │         ┌────┴────┐        │
         │         ▼         ▼        │
         │    ┌─────────┐   ┌────────────┐
         │    │CUSTOMERS│   │   EVENTS   │◄───────┘
         │    └─────────┘   └────────────┘
         │                        │
         │    ┌───────────────────┘
         │    │ contains
         ▼    ▼
    ┌─────────────┐
    │ CART_ITEMS  │
    │ (embedded)  │
    └─────────────┘
```

### Tables Summary

| Table | Key Fields | Links To |
|-------|-----------|----------|
| **Users** | `_id`, `email`, `isAdmin` | → Products, Sales, Expenses, Events, Settings |
| **Products** | `_id`, `user`, `itemCode`, `stockQuantity` | ← User |
| **Sales** | `_id`, `user`, `event`, `customer`, `items[]` | ← User, Event, Customer |
| **Expenses** | `_id`, `user`, `event`, `amount` | ← User, Event |
| **Events** | `_id`, `user`, `status` | ← User |
| **Customers** | `_id`, `phone` (unique) | → Sales |
| **Settings** | `_id`, `user` (unique) | ← User |

---

## 🛣️ API Routes

```
                        ┌─────────────────┐
                        │   /api/auth     │  🌐 PUBLIC
                        │  register       │
                        │  login          │
                        │  logout         │
                        └────────┬────────┘
                                 │
                          JWT Cookie
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  /api/products  │    │   /api/sales    │    │  /api/expenses  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  /api/events    │    │  /api/reports   │    │  /api/settings  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         
                        🔒 AUTHENTICATED                  
                                 │
                          isAdmin = true
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   /api/admin    │  👑 ADMIN ONLY
                        │  - All Users    │
                        │  - All Data     │
                        │  - Global Events│
                        └─────────────────┘
```

---

## 🎯 Access Control Matrix

```
                    ┌─────────┐     ┌─────────┐     ┌─────────┐
                    │ 🌐 Public│     │ 👤 User │     │ 👑 Admin │
                    └────┬────┘     └────┬────┘     └────┬────┘
                         │               │               │
  Register/Login    ─────●───────────────●───────────────●
                         │               │               │
  Own Products      ─────○───────────────●───────────────●
                         │               │               │
  Own Sales         ─────○───────────────●───────────────●
                         │               │               │
  Own Expenses      ─────○───────────────●───────────────●
                         │               │               │
  View Reports      ─────○───────────────●───────────────●
                         │               │               │
  View All Users    ─────○───────────────○───────────────●
                         │               │               │
  Modify Any Data   ─────○───────────────○───────────────●
                         │               │               │
  Delete Users      ─────○───────────────○───────────────●

                    ● = Allowed    ○ = Denied
```

| Action | 🌐 Public | 👤 User | 👑 Admin |
|--------|:---------:|:-------:|:--------:|
| Register/Login | ✅ | ✅ | ✅ |
| View Own Data | ❌ | ✅ | ✅ |
| View All Users | ❌ | ❌ | ✅ |
| Modify Any Data | ❌ | ❌ | ✅ |
| Delete Any User | ❌ | ❌ | ✅ |

---

## 📱 Frontend Navigation

```
                              ┌───────────┐
                              │     /     │  Home
                              └─────┬─────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              ┌─────────┐     ┌──────────┐    ┌──────────┐
              │ /login  │     │/register │    │  (auth)  │
              └────┬────┘     └────┬─────┘    └────┬─────┘
                   │               │               │
                   └───────────────┴───────────────┘
                                   │
                            ┌──────┴──────┐
                            ▼             │
                      ┌───────────┐       │
                      │/dashboard │◄──────┘
                      └─────┬─────┘
                            │
    ┌───────────┬───────────┼───────────┬───────────┬───────────┐
    ▼           ▼           ▼           ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌─────────┐ ┌─────────┐
│/invent.│ │ /sales │ │/expenses│ │/events │ │/reports │ │/settings│
└────────┘ └────────┘ └─────────┘ └────────┘ └─────────┘ └─────────┘
                                                               │
                                                        isAdmin│
                                                               ▼
                                                         ┌─────────┐
                                                         │ /admin  │
                                                         └─────────┘
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌──────────┐    dispatch    ┌──────────┐    fetch    ┌──────────┐     │
│  │ React UI │ ──────────────►│  Redux   │ ──────────►│ Services │     │
│  └──────────┘                │  Store   │             └────┬─────┘     │
│       ▲                      └──────────┘                  │           │
│       │ re-render                 ▲                        │           │
│       └───────────────────────────┤                        │           │
└───────────────────────────────────┼────────────────────────┼───────────┘
                                    │                        │
                              update│                        │ HTTP
                                    │                        │
┌───────────────────────────────────┼────────────────────────┼───────────┐
│                              BACKEND                       ▼           │
│  ┌──────────┐    validate    ┌──────────┐    logic   ┌──────────┐     │
│  │  Routes  │ ──────────────►│Middleware│ ─────────►│Controller│     │
│  └──────────┘                └──────────┘            └────┬─────┘     │
│                                                           │           │
│                                                      CRUD │           │
│                                                           ▼           │
│                                                     ┌──────────┐      │
│                                                     │  Models  │      │
│                                                     └────┬─────┘      │
└──────────────────────────────────────────────────────────┼────────────┘
                                                           │
                                                     Query │
                                                           ▼
                                                    ┌────────────┐
                                                    │  MongoDB   │
                                                    └────────────┘
```

---

## 🛡️ Security Flow

```
                              ┌─────────────┐
                              │   Request   │
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │  Has JWT?   │
                              └──────┬──────┘
                                     │
                     ┌───────────────┼───────────────┐
                     │ NO                            │ YES
                     ▼                               ▼
              ┌─────────────┐                 ┌─────────────┐
              │     401     │                 │Valid Token? │
              │Unauthorized │                 └──────┬──────┘
              └─────────────┘                        │
                                     ┌───────────────┼───────────────┐
                                     │ NO                            │ YES
                                     ▼                               ▼
                              ┌─────────────┐                 ┌─────────────┐
                              │     401     │                 │Admin Route? │
                              │Unauthorized │                 └──────┬──────┘
                              └─────────────┘                        │
                                                     ┌───────────────┼───────────────┐
                                                     │ NO                            │ YES
                                                     ▼                               ▼
                                              ┌─────────────┐                 ┌─────────────┐
                                              │  ✅ ALLOW   │                 │  isAdmin?   │
                                              └─────────────┘                 └──────┬──────┘
                                                                      ┌───────────────┼───────────────┐
                                                                      │ NO                            │ YES
                                                                      ▼                               ▼
                                                               ┌─────────────┐                 ┌─────────────┐
                                                               │     403     │                 │  ✅ ALLOW   │
                                                               │  Forbidden  │                 └─────────────┘
                                                               └─────────────┘
```

### Security Features

| Feature | Implementation |
|---------|---------------|
| Password | bcrypt (salt: 10) |
| Token | JWT in HTTP-only cookie |
| Expiry | 30 days |
| CORS | Restricted origins |

---

## 📁 Project Structure

```
APP/
│
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # 8 controller files
│   ├── middleware/      # Auth + Error handling
│   ├── models/          # 7 Mongoose schemas
│   ├── routes/          # 8 route files
│   ├── validation/      # Input validation
│   └── server.js        # Express entry
│
└── frontend/
    └── src/
        ├── components/  # Reusable UI
        ├── pages/       # 11 page components
        ├── state/
        │   ├── slices/  # Redux slices
        │   └── services/# API services
        └── App.tsx      # Router config
```

---

## 🔗 Key Relationships

```
User ──────┬──────► Products (1:N)
           │
           ├──────► Sales (1:N) ────────► Customer (N:1)
           │              │
           │              └──────► CartItems (1:N) ◄────── Product
           │
           ├──────► Expenses (1:N)
           │
           ├──────► Events (1:N) ◄────── Sales, Expenses
           │
           └──────► Settings (1:1)
```
