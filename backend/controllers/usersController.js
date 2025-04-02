// controllers/authController.js
const User = require('../models/User');
const { validateRegister, validatePasswordChange } = require('../utils/validators');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '30d' }
    );
};

// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password, password2 } = req.body;
    const errors = validateRegister(username, email, password, password2);

    if (errors.length) {
        return res.status(400).json({ errors });
    }

    try {
        if (await User.findOne({ email })) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const user = await new User({ username, email, password }).save();
        
        // Generate JWT token
        const token = generateToken(user._id);
        
        return res.status(201).json({ 
            message: 'User created', 
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                profilePic: user.profilePic
            },
            token
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = generateToken(user._id);
        
        return res.status(200).json({ 
            message: 'Login successful', 
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                profilePic: user.profilePic
            },
            token
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Logout a user - with JWT, logout is handled client-side by removing the token
const logoutUser = (req, res) => {
    return res.status(200).json({ message: 'Logout successful' });
};

// Get the profile of the logged-in user along with their activities
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).lean();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const [questionsPosted, answersPosted] = await Promise.all([
            require('../models/Question').find({ user: user._id }).lean(),
            require('../models/Answer').find({ user: user._id }).populate({ path: 'question', select: 'title' }).lean(),
        ]);

        const activities = [
            ...questionsPosted.map(q => ({ ...q, type: 'question' })),
            ...answersPosted.map(a => ({ ...a, type: 'answer' }))
        ];

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 4;
        const totalPages = Math.ceil(activities.length / limit);
        const paginatedActivities = activities.slice((page - 1) * limit, page * limit);

        return res.status(200).json({ user, activities: paginatedActivities, currentPage: page, totalPages });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error loading profile' });
    }
};

// Get current user details
const getCurrentUser = async (req, res) => {
    try {
        // req.user is already attached by the auth middleware
        const user = req.user;
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ 
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                profilePic: user.profilePic
            }
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update the user's profile
const updateProfile = async (req, res) => {
    try {
        const { username, bio } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.username = username;
        user.bio = bio;
        if (req.file) {
            user.profilePic = '/uploads/' + req.file.filename;
        }

        await user.save();
        
        return res.status(200).json({ 
            message: 'Profile updated successfully', 
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                profilePic: user.profilePic
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error updating profile' });
    }
};

// Update the user's password
const updateSettings = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    let errors = validatePasswordChange(currentPassword, newPassword, confirmPassword);
    let user;
    try {
        user = await User.findById(req.user._id);
        if (!user) {
            errors.push({ msg: 'User not found' });
        } else {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                errors.push({ msg: 'Current password is incorrect' });
            }
        }
    } catch (err) {
        errors.push({ msg: 'Error retrieving user' });
    }

    if (errors.length) {
        return res.status(400).json({ errors });
    }

    try {
        user.password = newPassword;
        await user.save();
        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        return res.status(500).json({ error: 'Error changing password' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile,
    updateSettings,
    getCurrentUser
};
