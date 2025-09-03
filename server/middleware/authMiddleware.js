const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// --- NEW ADMIN MIDDLEWARE ---
const admin = (req, res, next) => {
    // This middleware should run AFTER the 'protect' middleware
    if (req.user && (req.user.role === 'SuperAdmin' || req.user.role === 'SectionAdmin')) {
        next(); // User is an admin, proceed to the next function
    } else {
        res.status(403).json({ message: 'Forbidden. Not authorized as an admin.' });
    }
};

module.exports = { protect, admin }; // Export the new middleware