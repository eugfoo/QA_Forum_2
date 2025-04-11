// controllers/authController.js
const User = require('../models/User');
const { validateRegister, validatePasswordChange } = require('../utils/validators');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '30d' }
    );
};

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

        if (await User.findOne({ username })) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        const user = await new User({ username, email, password }).save();

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
            console.log('Login failed: Invalid credentials');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

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
        return res.status(200).json(response);
    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ error: err.message });
    }
};

const logoutUser = (req, res) => {
    return res.status(200).json({ message: 'Logout successful' });
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).lean();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const Question = require('../models/Question');
        const Answer = require('../models/Answer');

        const [questionsPosted, answersPosted] = await Promise.all([
            Question.find({ user: user._id }).lean(),
            Answer.find({ user: user._id }).populate({ path: 'question', select: 'title' }).lean(),
        ]);

        const uniqueQuestionsAnswered = await Answer.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: "$question" } },
            { $count: "count" }
        ]);
        
        const uniqueQuestionsCount = uniqueQuestionsAnswered.length > 0 
            ? uniqueQuestionsAnswered[0].count 
            : 0;

        user.questionsPostedCount = questionsPosted.length;
        user.questionsAnsweredCount = uniqueQuestionsCount;
        
        let totalUpvotes = 0;
        
        if (questionsPosted.length > 0) {
            const questionUpvotes = questionsPosted.reduce((total, question) => {
                const upvotes = question.votes?.up?.length || 0;
                return total + upvotes;
            }, 0);
            totalUpvotes += questionUpvotes;
        }
        
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

const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const Question = require('../models/Question');
        const Answer = require('../models/Answer');

        const questionsCount = await Question.countDocuments({ user: user._id });
        
        const uniqueQuestionsAnswered = await Answer.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: "$question" } },
            { $count: "count" }
        ]);
        
        const answersCount = uniqueQuestionsAnswered.length > 0 
            ? uniqueQuestionsAnswered[0].count 
            : 0;
            
        const questions = await Question.find({ user: user._id });

        let totalUpvotes = 0;
        if (questions.length > 0) {
            totalUpvotes = questions.reduce((total, question) => {
                const upvotes = question.votes?.up?.length || 0;
                return total + upvotes;
            }, 0);
        }

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

const updateProfile = async (req, res) => {
    try {
        const { username, bio } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Username is already taken' });
            }
        }

        user.username = username;
        user.bio = bio;
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            user.profilePic = `${baseUrl}/uploads/${req.file.filename}`;
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

const markNotificationsAsRead = async (req, res) => {
    try {
        
        if (!req.user || !req.user._id) {
            console.error('markNotificationsAsRead: req.user is invalid', req.user);
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const userId = req.user._id;
        const notificationIds = req.body && req.body.notificationIds;
                
        // If specific notification IDs provided, mark only those as read
        if (notificationIds && notificationIds.length > 0) {
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
