# SalesTrack MERN Application

## Overview
SalesTrack is a comprehensive multi-user sales tracking application built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides robust features for inventory management, point of sale operations, expense tracking, and financial reporting.

## Features
- **User Authentication**: Secure JWT-based authentication with HTTP-only cookie sessions.
- **Inventory Management**: Complete CRUD operations for products with stock tracking.
- **Point of Sale (POS)**: Process individual and combo sales with real-time inventory updates.
- **Expense Tracking**: Log and categorize operational expenses.
- **Event Management**: Track sales and expenses specific to events or occasions.
- **Dashboard & Analytics**: Visual financial overview using charts (Recharts).
- **Reports**: Export data to PDF and Excel formats.

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with secure cookies
- **Validation**: Custom validation middleware

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components using `class-variance-authority`
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Project Structure

The repository is organized into the following main directories:

- **`backend/`**: Contains the Node.js/Express server code, including models, controllers, routes, and middleware.
- **`frontend/`**: The React client application built with Vite.
- **`salestrack-prototype/`**: An AI-powered prototype version of the application (separate from the main MERN app).
- **`api/`**: Serverless function entry point for Vercel deployment.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd salestrack-mern
    ```

2.  **Install dependencies:**
    This command installs dependencies for the root, backend, and frontend.
    ```bash
    npm install
    # The postinstall script should handle installing frontend dependencies,
    # but if not:
    # cd frontend && npm install && cd ..
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory based on `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Update the variables in `.env` with your configuration:
    ```
    NODE_ENV=development
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    API_KEY=your_gemini_api_key_here
    ```

### Running the Application

**Development Mode:**
Run both the backend server and frontend client concurrently:
```bash
npm run dev
```
- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173` (proxied to backend)

**Production Build:**
Build the frontend and start the production server:
```bash
npm run build
npm start
```

## API Endpoints

The backend provides the following RESTful API endpoints:

-   **Auth**: `/api/auth` (Register, Login, Logout, Profile)
-   **Products**: `/api/products` (CRUD operations)
-   **Sales**: `/api/sales` (Record sales)
-   **Expenses**: `/api/expenses` (Track expenses)
-   **Events**: `/api/events` (Manage events)
-   **Settings**: `/api/settings` (User preferences)
-   **Reports**: `/api/reports` (Financial summaries)
-   **Admin**: `/api/admin` (Admin operations)

## Deployment

This project is configured for deployment on Vercel using the `vercel.json` configuration. The `api/index.js` serves as the entry point for the serverless function.

## License

ISC
