const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, forgotPasswordCheck, resetPassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPasswordCheck);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getUserProfile);

module.exports = router;