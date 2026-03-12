const express = require('express');
const { submitAttempt, getAttempts } = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Protected routes
router.post('/:id/attempts', protect, submitAttempt);
router.get('/:id/attempts', protect, getAttempts);

module.exports = router;
