// routes/users.js
const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile,
    updateSettings,
    getCurrentUser
} = require('../controllers/usersController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes - require authentication
router.get('/me', auth, getCurrentUser);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/settings', auth, updateSettings);

module.exports = router;
