// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to request
const auth = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    try {
        const token = authHeader?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided in request');
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
        try {
            const decoded = jwt.verify(token, jwtSecret);
            console.log('Token decoded successfully:', decoded);
            
            const user = await User.findById(decoded.userId);
            
            if (!user) {
                console.log(`User not found for ID: ${decoded.userId}`);
                return res.status(401).json({ error: 'User not found' });
            }
            
            console.log(`User authenticated: ${user.username} (${user._id})`);
            
            req.user = user;
            req.token = token;
            
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError.message);
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired, please login again' });
            }
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Authentication error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired, please login again' });
        }
        res.status(401).json({ error: 'Invalid authentication' });
    }
};

module.exports = { auth };
