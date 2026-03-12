const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitAttempt,
  getQuizAttempts,
  getUserAttempts,
  generateQuiz
} = require('../controllers/quizController');
const { protect, admin } = require('../middleware/authMiddleware');

// ⭐ SPECIFIC ROUTES FIRST (before /:id)
router.get('/user/my-attempts', protect, getUserAttempts);
router.get('/attempts/:quizId', protect, getQuizAttempts);
router.post('/generate', protect, admin, generateQuiz);

// Protected routes (require authentication)
router.post('/', protect, admin, createQuiz);
router.put('/:id', protect, admin, updateQuiz);
router.delete('/:id', protect, admin, deleteQuiz);

// Attempt routes
router.post('/:id/attempt', protect, submitAttempt);

// ⭐ GENERAL ROUTES LAST (after specific ones)
router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuizById);

module.exports = router;