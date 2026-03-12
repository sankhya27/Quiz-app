const Quiz = require('../models/quizModel');
const Attempt = require('../models/Attempt');
const User = require('../models/User');

// Get Overall Stats (Admin)
const getOverallStats = async (req, res) => {
  try {
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await Attempt.countDocuments();
    const totalUsers = await User.countDocuments();

    // Average score across all attempts
    const attempts = await Attempt.find();
    let totalScore = 0;
    let totalQuestions = 0;
    
    attempts.forEach(a => {
      totalScore += a.score;
      totalQuestions += (a.totalQuestions || 0);
    });

    const averageScore = totalQuestions > 0 ? ((totalScore / totalQuestions) * 100).toFixed(2) : 0;

    res.json({
      totalQuizzes,
      totalAttempts,
      totalUsers,
      averageScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overall stats', error: error.message });
  }
};

// Get Stats for User (My Stats)
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const attempts = await Attempt.find({ userId });

    const totalAttempts = attempts.length;
    let totalScore = 0;
    let totalQuestions = 0;

    attempts.forEach(a => {
      totalScore += a.score;
      totalQuestions += (a.totalQuestions || 0);
    });

    const averageScore = totalQuestions > 0 ? ((totalScore / totalQuestions) * 100).toFixed(2) : 0;

    res.json({
      totalAttempts,
      averageScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};

// Get Leaderboard for a specific Quiz
const getLeaderboardByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Top 10 attempts: Highest score first, then lowest time taken
    const leaderboard = await Attempt.find({ quizId })
      .populate('userId', 'name')
      .sort({ score: -1, timeTaken: 1 })
      .limit(10);
      
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};

// Get Detailed analytics for a specific quiz (Admin)
const getQuizDetailedStats = async (req, res) => {
  try {
    const { quizId } = req.params;
    const attempts = await Attempt.find({ quizId });

    if (attempts.length === 0) {
      return res.json({ message: 'No attempts found', stats: null });
    }

    const totalAttempts = attempts.length;
    let totalScore = 0;
    let passCount = 0;
    let totalTimeTaken = 0;
    const questionStats = {};

    attempts.forEach(attempt => {
      totalScore += attempt.score;
      if (attempt.isPass) passCount++;
      totalTimeTaken += (attempt.timeTaken || 0);

      // Analyze question performance
      attempt.feedback.forEach(f => {
        if (!questionStats[f.question]) {
          questionStats[f.question] = { question: f.question, correct: 0, total: 0 };
        }
        questionStats[f.question].total++;
        if (f.correct) questionStats[f.question].correct++;
      });
    });

    const averageTime = (totalTimeTaken / totalAttempts).toFixed(2);
    const passRate = ((passCount / totalAttempts) * 100).toFixed(2);

    // Hardest questions: sort by error percentage desc
    const hardestQuestions = Object.values(questionStats)
      .map(q => ({
        ...q,
        errorRate: ((q.total - q.correct) / q.total * 100).toFixed(2)
      }))
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5); // top 5 hardest

    res.json({
      totalAttempts,
      passRate,
      averageTime,
      hardestQuestions,
      quizId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching detailed stats', error: error.message });
  }
};

module.exports = {
  getOverallStats,
  getUserStats,
  getLeaderboardByQuiz,
  getQuizDetailedStats
};
