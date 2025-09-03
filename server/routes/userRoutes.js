const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, searchUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware'); // Import the middleware

router.post('/register', registerUser);
router.post('/login', loginUser);

// Any request to this route will first go through the 'protect' middleware.
// If the token is valid, it will then call 'getUserProfile'.
router.get('/profile', protect, getUserProfile);
router.get('/search', protect, admin, searchUsers); // Add this new route

module.exports = router;