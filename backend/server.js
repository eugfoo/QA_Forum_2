const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Question = require('./models/Question');


dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware

app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(cors({
    origin: 'http://localhost:5173', // or wherever your frontend runs
    credentials: true
}));

// API routes
app.use('/api/users', require('./routes/users'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/answers', require('./routes/answers')); // Create similar routes for answers

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
