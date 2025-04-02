// routes/users.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile,
    updateSettings,
    getCurrentUser,
    getNotifications,
    markNotificationsAsRead
} = require('../controllers/usersController');
const { auth } = require('../middleware/auth');

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes - require authentication
router.get('/me', auth, getCurrentUser);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('profilePhoto'), updateProfile);
router.put('/settings', auth, updateSettings);

// Notification routes
router.get('/notifications', auth, getNotifications);
router.put('/notifications/read', auth, markNotificationsAsRead);

// Test route for debugging auth
router.get('/auth-test', auth, (req, res) => {
    res.json({
        message: 'Authentication successful',
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    });
});

module.exports = router;
