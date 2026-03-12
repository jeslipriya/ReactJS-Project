# Multi-Tenant Dashboard System

A full-stack role-based dashboard application with Admin, Tenant, and User portals. Built with React, Tailwind CSS, and JSON Server.

## Overview

This multi-tenant system allows platform administrators to manage multiple companies (tenants) and their users with role-based access control and comprehensive audit logging.

## Features

### Admin Portal

* Dashboard with analytics, statistics cards, and real-time activity feed
* Tenant management with complete CRUD operations and filtering
* User management across tenants with bulk operations
* Audit logs with advanced filters and export options

### Tenant Portal

* Company-specific dashboard with team statistics
* Team member management with invite functionality
* Company settings and role management

### User Portal

* Personal dashboard with profile details
* Team members preview
* Recent activity feed
* Company information view

## Tech Stack

**Frontend**

* React 18
* Vite
* React Router v6

**Styling & UI**

* Tailwind CSS
* Framer Motion
* Lucide React Icons

**Data Visualization**

* Recharts

**Networking**

* Axios

**Notifications**

* React Hot Toast

**Backend (Mock API)**

* JSON Server

## Project Structure

```
multi-tenant/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── admin/
│   │   ├── tenant/
│   │   └── user/
│   ├── context/
│   ├── routes/
│   ├── services/
│   └── App.jsx
├── db.json
└── package.json
```

## Installation

### Clone the Repository

```
git clone <repository-url>
cd multi-tenant
```

### Install Dependencies

```
npm install
```

### Install Additional Packages

```
npm install axios recharts lucide-react framer-motion react-hot-toast
npm install -D json-server concurrently
```

### Run the Application

Run both React and JSON Server:

```
npm run dev-all
```

Or run them separately:

```
npm run server
npm run dev
```

## Default Login Credentials

| Role   | Email                                       | Password  |
| ------ | ------------------------------------------- | --------- |
| Admin  | [admin@system.com](mailto:admin@system.com) | admin123  |
| Tenant | [admin@zoho.com](mailto:admin@zoho.com)     | tenant123 |
| User   | [jesli@zoho.com](mailto:jesli@zoho.com)     | user123   |

## Database Schema

### Users

```
{
  "id": "unique_id",
  "name": "User Name",
  "email": "user@email.com",
  "password": "hashed_password",
  "role": "admin | tenant | user",
  "tenantId": "tenant_id",
  "status": "active | inactive",
  "joinedAt": "YYYY-MM-DD"
}
```

### Tenants

```
{
  "id": "tenant_id",
  "name": "Company Name",
  "email": "contact@company.com",
  "plan": "Basic | Professional | Enterprise",
  "usersCount": 0,
  "status": "active | suspended"
}
```

## Available Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| npm run dev     | Start React development server |
| npm run server  | Start JSON Server              |
| npm run dev-all | Run both servers concurrently  |
| npm run build   | Build project for production   |
| npm run preview | Preview production build       |

## Key Features Implemented

* Role-based authentication (Admin, Tenant, User)
* Protected routes with role validation
* CRUD operations for tenants and users
* Real-time audit logging
* Advanced filtering and search
* Data export (CSV / JSON)
* Bulk user operations
* Responsive UI with Tailwind CSS
* Smooth animations with Framer Motion
* Toast notifications
* Company-level data isolation

## Responsive Design

The interface is optimized for multiple screen sizes:

* Desktop (1024px and above)
* Tablet (768px – 1023px)
* Mobile (below 768px)

## Contributing

1. Fork the repository
2. Create a feature branch

```
git checkout -b feature/YourFeature
```

3. Commit your changes

```
git commit -m "Add new feature"
```

4. Push the branch

```
git push origin feature/YourFeature
```

5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Jesli

>> Built for learning modern React development and full-stack dashboard architecture.
