# Tasky - Task Management System (MERN Stack)

A full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- User authentication and authorization
- Department-based task management
- Real-time chat functionality
- Task notifications and alerts
- Admin user management
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd tasky
\`\`\`

### 2. Install dependencies for both client and server
\`\`\`bash
# Install root dependencies
npm install

# Install server dependencies
npm run install-server

# Install client dependencies
npm run install-client
\`\`\`

### 3. Environment Setup

Create a `.env` file in the `server` directory:

\`\`\`bash
cd server
cp .env.example .env
\`\`\`

Edit the `.env` file with your configuration:
\`\`\`
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tasky
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
NODE_ENV=development
\`\`\`

### 4. Start MongoDB

Make sure MongoDB is running on your system:
- **Local MongoDB**: Start the MongoDB service
- **MongoDB Atlas**: Use your Atlas connection string in the `.env` file

### 5. Run the application

#### Development Mode (runs both client and server)
\`\`\`bash
npm run dev
\`\`\`

#### Run client and server separately
\`\`\`bash
# Terminal 1 - Start the server
npm run server

# Terminal 2 - Start the client
npm run client
\`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

\`\`\`
tasky-mern/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and contexts
│   │   └── hooks/          # Custom hooks
│   └── package.json
├── server/                 # Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── package.json
└── package.json           # Root package.json
\`\`\`

## Available Scripts

- `npm run dev` - Run both client and server in development mode
- `npm run server` - Run only the server
- `npm run client` - Run only the client
- `npm run build` - Build the client for production
- `npm start` - Start the server in production mode

## Default Users

The application supports two types of users:
- **Admin**: Can manage users and have full access
- **Staff**: Regular users with limited permissions

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks/department/:id` - Get tasks by department
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Users (Admin only)
- `GET /api/users/department` - Get users in department
- `PUT /api/users/:id/approve` - Approve a user
- `DELETE /api/users/:id` - Delete a user

### Chat
- `GET /api/chat/department` - Get department messages
- `POST /api/chat` - Send a message

### Notifications
- `GET /api/notifications/user` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
