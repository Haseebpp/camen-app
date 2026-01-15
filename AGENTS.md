# SalesTrack MERN Application

## Overview
SalesTrack is a multi-user sales tracking application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features
- **User Authentication**: JWT-based authentication with secure cookie sessions
- **Inventory Management**: Full CRUD operations for products
- **Point of Sale**: Individual and combo sales with real-time stock updates
- **Expense Tracking**: Track operational expenses with event linking
- **Event Management**: Create events to track sales and expenses per occasion
- **Dashboard**: Financial overview with charts and analytics
- **Reports**: Export data to PDF and Excel formats

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Custom validation middleware

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with class-variance-authority
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios

## Project Structure

```
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth and error middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── validation/     # Request validation
│   └── server.js       # Express server entry
│
├── frontend/
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # Reusable components
│       ├── lib/        # Utilities and constants
│       ├── pages/      # Page components
│       └── state/      # Redux store, slices, services
│
├── .env                # Environment variables
└── package.json        # Root package with scripts
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation
```bash
npm install
npm run build
```

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create sale

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `DELETE /api/expenses/:id` - Delete expense

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id/status` - Update event status
- `DELETE /api/events/:id` - Delete event

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### Reports
- `GET /api/reports/financials` - Get financial summary
- `GET /api/reports/dashboard` - Get dashboard data
