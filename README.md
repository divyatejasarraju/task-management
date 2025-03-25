# Task Management System

## Overview
The Task Management System is a MERN stack (MongoDB, Express, React with Vite, and Node.js) application designed to allow users to create, view, update, and delete tasks with specific restrictions and role-based access control. The system ensures a user-friendly and secure task management experience.

## Features
- Users can create, view, update, and delete tasks.
- Tasks include title, description, priority, and due date.
- Users can mark tasks as completed.
- Filter tasks by priority and/or due date.
- Only admin/validators can delete tasks.
- Tasks cannot be created on public holidays.
- Undo functionality for changes.
- Responsive and user-friendly UI.

## Assumptions 

### Architecture Assumptions

  - Single Page Application (SPA): The frontend is built as a React SPA that communicates with the Express backend via  RESTful APIs, providing a seamless user experience without page reloads.
  - Stateful Authentication: User sessions are maintained using JWT tokens rather than traditional server-side sessions, allowing for better scalability.

### Data Model Assumptions

  - User Roles: The system supports distinct user roles (regular user, admin, validator) with different permission levels controlling access to features.
  - Task Ownership: Tasks belong to specific users, and regular users can only view and modify their own tasks. Admin users have additional permissions.
  - Historical Tracking: The system maintains a complete history of changes to tasks, enabling undo functionality and audit trails.
  - Holiday Integration: Holidays are tracked separately and are viewable by all users, but can only be managed by administrators.

### Technology Stack Assumptions

  - MongoDB: Chosen for its flexibility with document-based storage, allowing for easy schema evolution as requirements    change.
  - Express: Used for the backend API layer due to its lightweight nature and middleware support.
  - React: Selected for the frontend due to its component-based architecture and efficient rendering capabilities.
  - Node.js: Enables JavaScript throughout the stack, reducing context switching for developers.
  - TypeScript: Used on the frontend to improve code quality, maintainability, and developer experience.

### Authentication Assumptions

  - JWT-Based Authentication: Using JSON Web Tokens for stateless authentication, storing them in secure HTTP-only cookies.
  - Role-Based Access Control: Routes and components conditionally render or allow access based on user roles.
  - Token Expiration: Tokens have a limited lifespan, requiring periodic re-authentication for security.

### Deployment Assumptions

  - Separate Frontend/Backend Deployment: The backend API can be deployed independently from the frontend application.
  - Environment Configuration: Different environments (development, staging, production) can be managed through environment variables.
  - API Documentation: Swagger documentation is provided for developers to understand and test the API endpoints.

### Performance Assumptions

  - Optimistic Updates: The UI updates optimistically before server confirmation to provide a responsive user experience.
  - Pagination: For larger datasets (like tasks), data is loaded in paginated form to maintain performance.
  - Caching: Holiday data is cached in the frontend since it changes infrequently.

### Security Assumptions

  - Input Validation: All user inputs are validated on both client and server sides to prevent injection attacks.
  - CORS Configuration: The API implements proper CORS policies to control which domains can access it.
  - Rate Limiting: API endpoints have rate limiting to prevent abuse and DoS attacks.
  - Secure Password Storage: User passwords are hashed using bcrypt before storage in the database.

## Tech Stack
### Backend:
- **Node.js** with **Express.js** (RESTful API)
- **MongoDB** with **Mongoose** (Database)
- **JWT Authentication** for security
- **Role-based access control**

### Frontend:
- **React** with **Vite**
- **TypeScript** for type safety
- **Custom CSS** for styling
- **Axios** for API calls
- **Context API** State management across components
- **Jest** Testing Framework


### DevOps & Deployment:
- TBD

## Installation & Setup

### Prerequisites
- Node.js (LTS version)
- MongoDB (Local or Atlas)


### Backend Setup
```sh
cd backend
npm install
npm run dev
```
- Create a `.env` file with the required environment variables:
  ```env
  MONGO_URI=<your-mongodb-uri>
  JWT_SECRET=<your-secret-key>
  ````

- Scripts Usage

  To run the utility scripts:
  - Create an admin user
  node scripts/createAdminDirect.js

  - Create a validator user
  node scripts/createValidatorUser.js

### Mongo DB Setup

- Follow this link to setup based on the OS
  https://www.prisma.io/dataguide/mongodb/setting-up-a-local-mongodb-database?query=&page=1

### Frontend Setup
```sh
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint             | Description                         |
|--------|----------------------|-------------------------------------|
| POST   | /api/users/register  | User registration                   |
| POST   | /api/users/login     | User login                          |
| GET    | /api/users/profile   | Get User Profile                    |
| GET    | /api/users/me        | Get Current user info               |
| POST   | /api/tasks/          | Create a new task                   |
| GET    | /api/tasks/          | Get all tasks for logged-in user    |
| GET    | /api/tasks/          | Get a task by specific id           |
| PUT    | /api/tasks/:id       | Update a task                       |
| DELETE | /api/tasks/:id       | Delete a task (Admin only)          |
| POST   | /api/tasks/undo      | Undo the last change to a task      |
| GET    | /api/tasks/history   | Get the change history of a task    |
| POST   | /api/holidays        | Add a new holiday                   |
| GET    | /api/holidays        | Get all holidays                    |
| DELETE | /api/holidays/       | Delete a holiday (Admin only)       |


## Testing Strategies
- Unit Testing using Jest


## Code Structure
```

backend/
│
├── config/
│   └── db.js                    # MongoDB connection configuration
│
├── middleware/
│   └── authMiddleware.js        # Authentication and authorization middleware
│
├── routes/
│   ├── holidays/                # Holiday management module
│   │   ├── controller.js        # Holiday business logic
│   │   ├── index.js             # Holiday route definitions
│   │   └── model.js             # Holiday data model
│   │
│   ├── tasks/                   # Task management module
│   │   ├── controller.js        # Task business logic
│   │   ├── index.js             # Task route definitions
│   │   └── model.js             # Task data model
│   │
│   └── users/                   # User management module
│       ├── controller.js        # User business logic
│       ├── index.js             # User route definitions
│       └── model.js             # User data model
│
├── scripts/
│   ├── createAdminDirect.js     # Script to create admin user directly in DB
│   ├── createValidatorUser.js   # Script to create validator user
│   └── fetchAndSeedHolidays.js  # Script to fetch holidays data and seed DB
│
├── utils/
│   ├── generateToken.js         # JWT token generation utility
│   └── isHoliday.js             # Utility to check if date is a holiday
│
├── .env                         # Environment variables
├── package.json                 # Project dependencies and scripts
└── server.js                    # Application entry point

task-management/
├── public/                  # Static assets
├── src/                     # Source code
│   ├── __tests__/           # Test files
│   ├── components/          # Reusable UI components
│   │   ├── layouts/         # Layout components
│   │   │   ├── AppLayout.tsx    # Main application layout
│   │   │   └── AuthLayout.tsx   # Authentication pages layout
│   │   ├── AdminRoute.tsx       # Route wrapper for admin-only access
│   │   ├── AppHeader.tsx        # Application header component
│   │   ├── LoadingScreen.tsx    # Loading indicator component
│   │   ├── ProtectedRoute.tsx   # Route wrapper for authenticated users
│   │   ├── RoleBasedButton.tsx  # Button with role-based visibility
│   │   ├── RoleBasedComponent.tsx # Component with role-based visibility
│   │   ├── SignInForm.tsx       # User login form
│   │   ├── SignUpForm.tsx       # User registration form
│   │   ├── TaskFilter.tsx       # Filter component for tasks list
│   │   ├── TaskForm.tsx         # Form for creating/editing tasks
│   │   ├── TaskHistory.tsx      # Component to display task change history
│   │   ├── TaskItem.tsx         # Individual task display component
│   │   └── TaskList.tsx         # Component for displaying list of tasks
│   ├── context/              # React context providers
│   │   ├── AuthContext.tsx   # Authentication state management
│   │   ├── HolidayContext.tsx # Holiday data management
│   │   └── TaskContext.tsx   # Task data management
│   ├── pages/                # Page components
│   │   ├── AuthPage.tsx      # Login/Registration page
│   │   ├── Dashboard.tsx     # Main dashboard page
│   │   ├── HolidaysPage.tsx  # Holiday management page
│   │   ├── TaskDetailsPage.tsx # Detailed view of a task
│   │   └── TasksPage.tsx     # Tasks listing page
│   ├── styles/               # CSS and styling files
│   ├── types/                # TypeScript type definitions
│   │   ├── index.ts          # Shared type definitions
│   │   └── test.d.ts         # Type definitions for tests
│   ├── utils/                # Utility functions
│   │   └── tokenValidation.ts # JWT token validation helper
│   ├── App.css               # Application-wide styles
│   ├── App.tsx               # Main application component
│   ├── index.css             # Global CSS
│   ├── main.tsx              # Entry point
│   └── setupTests.js         # Test configuration
├── index.html                # HTML entry point
└── package.json              # Project dependencies and scripts
```



## Problem-Solving Approaches

### Integration with Calendar Providers
- Utilize APIs like Google Calendar API or Outlook API to sync tasks.
- Webhooks to update external calendars in real-time.

### Task Sharing
- Generate a unique shareable link with permissions.
- Role-based sharing (read/write access).
- Notify users via email using a service like Nodemailer.

### DevOps & Automation
- CI/CD pipeline using GitHub Actions can be implemented.
- Automated testing before deployment to be implemnted.
- Infrastructure as Code can be implemented(Terraform/Kubernetes for scalable deployment).

### Security Considerations

- **Authentication & Authorization**

  - Use short-lived JWT tokens (15-60 min) with refresh token rotation
  - Store tokens in HttpOnly cookies instead of localStorage
  - Implement strong password policies and rate limiting for login attempts
  - Validate user roles on both client and server sides

- **API Security**

  - Add server-side validation for all inputs
  - Configure CORS to allow only specific origins in production
  - Implement API rate limiting to prevent abuse
  - Use parameterized queries for database operations

- **Data Protection**

  - Minimize collection of personal data
  - Enable MongoDB authentication with restricted user permissions
  - Configure TLS/SSL for database connections
  - Maintain comprehensive audit logs for security-critical operations

- **Infrastructure**

  - Use environment variables for all secrets and configuration
  - Force HTTPS with proper TLS configuration
  - Run regular dependency security scans (npm audit)
  - Set up proper Content-Security-Policy headers
  - Deploy behind a configured reverse proxy

- **Maintenance**

  - Remove development backdoors and test accounts before deployment
  - Conduct regular security reviews and updates
  - Document incident response procedures
  - Subscribe to security advisories for dependencies


## Documentation & Instructions
- API Documentation with Swagger

## Known Issues

  - API calls being triggered twice in development environment
  - Mobile Responsive UI not tested
  - Upon editing a task the history is not updated immediately
  - The calendar doesnt disable the previous dates and user can still add the tasks
 

## Technical Debt

  - Add comprehensive unit test coverage for backend and frontend
  - Set up automated E2E testing 
  - Have env files configured to support all stages 
  - CI/CD Pipeline setup & implementation
  - Optimize the code with a cleaner version