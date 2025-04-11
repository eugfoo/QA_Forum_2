# IS3106 Assignment 2 - QAForum

QAForum is a web application that allows users to post and answer questions. The application supports user authentication, profile management, notifications, and question management and voting features.

## Student Information
Name: Eugene Foo

Matric Number: A0273384X

## Features

- **User Authentication**: Allows users to sign up, log in, and manage their profile.
- **Post Questions**: Users can ask questions and provide details like title, body, and tags.
- **Answer Questions**: Users can answer questions posted by others.
- **Anonymous Answering**: Users can answer questions anonymously.
- **Vote on Questions and Answers**: Users can upvote and downvote questions and answers.
- **Profile Management**: Users can edit their profile details including username, bio, and profile picture.
- **Notification System**: Users can receive and view notifications of answers answered by other users.
- **Search System**: Users can search for questions via title, body, or tags.
- **Question Management**: Users can update, delete or lock their questions.


## Tech Stack

### Frontend
- React
- React Router
- Axios
- Tailwind CSS
- Font Awesome
- React Toastify

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd QA_Forum_2
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend directory with the following variables:

```
SESSION_SECRET = your_session_secret
DB_URL = mongodb://localhost:27017/qaforum
PORT = 3000
JWT_SECRET = your_jwt_secret_key
```

Replace the values with your own secure keys. For MongoDB, you can use a local instance or a MongoDB Atlas connection string.

### 4. Start the development servers

From the root directory:

```bash
npm run dev
```

This will start both the backend and frontend servers concurrently.

- Backend will run on: http://localhost:3000
- Frontend will run on: http://localhost:5173

## Project Structure

```
QA_Forum_2/
├── backend/              # Backend code
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── uploads/          # Uploaded files
│   ├── .env              # Environment variables
│   └── server.js         # Entry point
├── frontend/             # Frontend code
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.jsx       # Main component
│   └── package.json      # Frontend dependencies
└── package.json          # Root dependencies
```

## API Endpoints

### Authentication
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login user
- POST `/api/users/logout` - Logout user

### Questions
- GET `/api/questions` - Get all questions
- POST `/api/questions` - Create a new question
- GET `/api/questions/:id` - Get question details
- PUT `/api/questions/:id` - Update a question
- DELETE `/api/questions/:id` - Delete a question
- POST `/api/questions/:id/vote` - Vote on a question
- POST `/api/questions/:id/lock` - Lock a question
- POST `/api/questions/:id/unlock` - Unlock a question

### Answers
- GET `/api/questions/:id/answers` - Get answers for a question
- POST `/api/answers/:questionId` - Create a new answer
- POST `/api/answers/:id/update` - Update an answer
- POST `/api/answers/:id/vote` - Vote on an answer
- GET `/api/answers/:id/delete` - Delete an answer

### Users
- GET `/api/users/me` - Get current user
- PUT `/api/users/profile` - Update user profile
- PUT `/api/users/settings` - Update user settings
- GET `/api/users/notifications` - Get user notifications
- PUT `/api/users/notifications/read` - Mark notifications as read
