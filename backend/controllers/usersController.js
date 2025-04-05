// controllers/authController.js
const User = require('../models/User');
const { validateRegister, validatePasswordChange } = require('../utils/validators');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

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
        // Check if email already exists
        if (await User.findOne({ email })) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Check if username already exists
        if (await User.findOne({ username })) {
            return res.status(400).json({ error: 'Username is already taken' });
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
    console.log('Login attempt for:', email);
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            console.log('Login failed: Invalid credentials');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = generateToken(user._id);
        console.log('Login successful, generated token:', token.substring(0, 20) + '...');

        const response = {
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
        };
        console.log('Response structure:', Object.keys(response));
        return res.status(200).json(response);
    } catch (err) {
        console.error('Login error:', err.message);
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

        const Question = require('../models/Question');
        const Answer = require('../models/Answer');

        // Get questions and answers posted by the user
        const [questionsPosted, answersPosted] = await Promise.all([
            Question.find({ user: user._id }).lean(),
            Answer.find({ user: user._id }).populate({ path: 'question', select: 'title' }).lean(),
        ]);

        // Count unique questions answered
        const uniqueQuestionsAnswered = await Answer.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: "$question" } },
            { $count: "count" }
        ]);
        
        // Get the count value or default to 0 if no results
        const uniqueQuestionsCount = uniqueQuestionsAnswered.length > 0 
            ? uniqueQuestionsAnswered[0].count 
            : 0;

        // Add counts to user object
        user.questionsPostedCount = questionsPosted.length;
        user.questionsAnsweredCount = uniqueQuestionsCount;
        
        // Calculate total upvotes
        let totalUpvotes = 0;
        
        // Count upvotes from questions
        if (questionsPosted.length > 0) {
            const questionUpvotes = questionsPosted.reduce((total, question) => {
                const upvotes = question.votes?.up?.length || 0;
                return total + upvotes;
            }, 0);
            totalUpvotes += questionUpvotes;
        }
        
        // Count upvotes from answers
        if (answersPosted.length > 0) {
            const answerUpvotes = answersPosted.reduce((total, answer) => {
                const upvotes = answer.votes?.up?.length || 0;
                return total + upvotes;
            }, 0);
            totalUpvotes += answerUpvotes;
        }
        
        user.upvotesReceived = totalUpvotes;

        const activities = [
            ...questionsPosted.map(q => ({ ...q, type: 'question' })),
            ...answersPosted.map(a => ({ ...a, type: 'answer' }))
        ];

        // Sort activities by createdAt date, newest first
        activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 3;
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

        // Get questions and answers count
        const Question = require('../models/Question');
        const Answer = require('../models/Answer');

        // Count questions posted by user
        const questionsCount = await Question.countDocuments({ user: user._id });
        
        // Count unique questions answered by user
        const uniqueQuestionsAnswered = await Answer.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: "$question" } },
            { $count: "count" }
        ]);
        
        // Get the count value or default to 0 if no results
        const answersCount = uniqueQuestionsAnswered.length > 0 
            ? uniqueQuestionsAnswered[0].count 
            : 0;
            
        // Get questions to calculate upvotes
        const questions = await Question.find({ user: user._id });

        // Calculate total upvotes received on questions
        let totalUpvotes = 0;
        if (questions.length > 0) {
            totalUpvotes = questions.reduce((total, question) => {
                // Get upvotes from the votes structure (only count upvotes, not downvotes)
                const upvotes = question.votes?.up?.length || 0;
                return total + upvotes;
            }, 0);
        }

        // Get answers to calculate upvotes on answers
        const answers = await Answer.find({ user: user._id });
        if (answers.length > 0) {
            const answerUpvotes = answers.reduce((total, answer) => {
                // Get upvotes from the votes structure (only count upvotes, not downvotes)
                const upvotes = answer.votes?.up?.length || 0;
                return total + upvotes;
            }, 0);
            totalUpvotes += answerUpvotes;
        }

        res.json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                profilePic: user.profilePic,
                questionsPostedCount: questionsCount,
                questionsAnsweredCount: answersCount,
                upvotesReceived: totalUpvotes
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
        console.log('Update profile request:', {
            body: req.body,
            file: req.file ? {
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : 'No file uploaded'
        });

        const { username, bio } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if the new username already exists (but only if it's different from current)
        if (username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Username is already taken' });
            }
        }

        user.username = username;
        user.bio = bio;
        if (req.file) {
            // Create a full URL for the profile picture
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            user.profilePic = `${baseUrl}/uploads/${req.file.filename}`;
            console.log('Setting profile pic to:', user.profilePic);
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
        console.error('Profile update error:', err);
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

// Get user notifications
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find notifications for this user and sort by newest first
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Mark notifications as read
const markNotificationsAsRead = async (req, res) => {
    try {
        console.log('markNotificationsAsRead called with req.user:', req.user);
        console.log('Request body:', req.body);
        
        // Make sure req.user exists and has an _id
        if (!req.user || !req.user._id) {
            console.error('markNotificationsAsRead: req.user is invalid', req.user);
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const userId = req.user._id;
        // Safely extract notificationIds with a fallback
        const notificationIds = req.body && req.body.notificationIds;
        
        console.log(`Marking notifications as read for user ${userId}, notificationIds:`, notificationIds);
        
        // If specific notification IDs provided, mark only those as read
        if (notificationIds && notificationIds.length > 0) {
            console.log(`Marking specific notifications as read: ${notificationIds.join(', ')}`);
            try {
                const result = await Notification.updateMany(
                    { _id: { $in: notificationIds }, recipient: userId },
                    { $set: { read: true } }
                );
                console.log('Update result for specific notifications:', result);
                return res.json({ 
                    success: true, 
                    count: result.modifiedCount,
                    message: `Marked ${result.modifiedCount} notifications as read`
                });
            } catch (updateError) {
                console.error('Error updating specific notifications:', updateError);
                throw updateError;
            }
        }
        
        // Otherwise mark all notifications as read
        console.log(`Marking all unread notifications as read for user ${userId}`);
        try {
            const result = await Notification.updateMany(
                { recipient: userId, read: false },
                { $set: { read: true } }
            );
            console.log('Update result for all notifications:', result);
            
            return res.json({ 
                success: true, 
                count: result.modifiedCount,
                message: `Marked all (${result.modifiedCount}) notifications as read`
            });
        } catch (updateError) {
            console.error('Error updating all notifications:', updateError);
            throw updateError;
        }
    } catch (error) {
        console.error('Error in markNotificationsAsRead:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ 
            error: 'Server error', 
            message: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile,
    updateSettings,
    getCurrentUser,
    getNotifications,
    markNotificationsAsRead
};
