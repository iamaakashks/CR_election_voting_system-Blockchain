const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Helper Function to Generate JWT ---
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
};
const getUserProfile = async (req, res) => {
    // The user object is attached to the request in the 'protect' middleware
    res.json(req.user);
};


// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { collegeId, name, email, password } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { collegeId }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or College ID already exists.' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create a new user
        const user = await User.create({
            collegeId,
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role), // Also give them a token on registration
                message: 'User registered successfully!'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Authenticate/Login a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists by email
        const user = await User.findOne({ email });

        // 2. If user exists, check if password is correct
        if (user && (await bcrypt.compare(password, user.password))) {
            // 3. If credentials are correct, send back user data and a token
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            // 4. If credentials are wrong, send an error
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
module.exports = { registerUser, loginUser, getUserProfile };