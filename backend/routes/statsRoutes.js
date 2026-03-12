const express = require('express');
const router = express.Router();
const { 
  getOverallStats, 
  getUserStats, 
  getLeaderboardByQuiz,
  getQuizDetailedStats 
} = require('../controllers/statsController');
const { protect, admin } = require('../middleware/authMiddleware');


// Get Overall Stats (Admin only)
router.get('/overall', protect, admin, getOverallStats);

// Get Detailed Quiz Stats (Admin only)
router.get('/quiz-detailed/:quizId', protect, admin, getQuizDetailedStats);

// Get Stats for User
router.get('/user', protect, getUserStats);

// Get Leaderboard for Quiz
router.get('/leaderboard/:quizId', protect, getLeaderboardByQuiz);

module.exports = router;
