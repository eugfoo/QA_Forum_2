// routes/users.js
const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile,
    updateSettings
} = require('../controllers/usersController');
const {isLoggedIn} = require('../middleware/auth')

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', isLoggedIn, getProfile);
router.put('/profile', updateProfile);
router.put('/settings', updateSettings);

module.exports = router;
