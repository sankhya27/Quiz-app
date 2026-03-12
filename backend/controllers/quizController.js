const Quiz = require('../models/quizModel');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const { generateSemanticQuiz } = require('../utils/semanticGenerator');

// Create Quiz
const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, category, passingScore, timeLimit, isDraft } = req.body;
    const userId = req.user._id;

    const newQuiz = new Quiz({
      title,
      description,
      questions,
      category,
      passingScore,
      timeLimit,
      isDraft,
      user: userId
    });

    await newQuiz.save();
    await newQuiz.populate('user', 'name email');

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: newQuiz
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating quiz', error: error.message });
  }
};

// Get All Quizzes
const getQuizzes = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.isAdmin;
    const query = isAdmin ? {} : { isDraft: { $ne: true } };
    
    const quizzes = await Quiz.find(query).populate('user', 'name email');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
  }
};

// Get Quiz by ID
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('user', 'name email');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // If quiz is draft and user is not admin and not creator
    if (quiz.isDraft && (!req.user || (!req.user.isAdmin && quiz.user.toString() !== req.user._id.toString()))) {
      return res.status(403).json({ message: 'This quiz is a draft' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz', error: error.message });
  }
};

// Update Quiz
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions, category, passingScore, timeLimit, isDraft } = req.body;
    const userId = req.user._id;

    let quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is admin or quiz creator
    if (quiz.user.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this quiz' });
    }

    quiz = await Quiz.findByIdAndUpdate(
      id,
      { title, description, questions, category, passingScore, timeLimit, isDraft },
      { new: true }
    ).populate('user', 'name email');

    res.json({
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating quiz', error: error.message });
  }
};

// Delete Quiz
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is admin or quiz creator
    if (quiz.user.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await Quiz.findByIdAndDelete(id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz', error: error.message });
  }
};

// Submit Quiz Attempt
const submitAttempt = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quizId = req.params.id;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const feedback = quiz.questions.map((q, idx) => {
      const isCorrect = answers[idx] === q.answer;
      if (isCorrect) score++;
      return {
        question: q.question,
        selected: answers[idx],
        correctAnswer: q.answer,
        correct: isCorrect
      };
    });

    const scorePercentage = (score / quiz.questions.length) * 100;
    const isPass = scorePercentage > 30;

    // Award achievements
    const achievements = [];
    if (score === quiz.questions.length) {
      achievements.push('PERFECT_SCORE');
    }
    if (isPass) {
      achievements.push('GOAL_ACHIEVER');
    }
    // Speed Demon if time limit exists and they finish in < 50% of it
    if (quiz.timeLimit > 0 && timeTaken < quiz.timeLimit / 2) {
      achievements.push('SPEED_DEMON');
    }

    const attempt = new Attempt({
      userId,
      quizId,
      answers,
      score,
      totalQuestions: quiz.questions.length,
      timeTaken,
      isPass,
      feedback,
      achievements
    });

    await attempt.save();
    await attempt.populate('userId', 'name email');

    res.status(201).json({
      message: 'Attempt submitted successfully',
      score,
      totalQuestions: quiz.questions.length,
      feedback,
      isPass,
      achievements,
      attempt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting attempt', error: error.message });
  }
};


// Auto-generate Quiz using Template-based Semantic Injection
const generateQuiz = async (req, res) => {
  try {
    const { topic, numQuestions } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const count = parseInt(numQuestions) || 10;
    const questions = generateSemanticQuiz(topic, count);

    res.json({
      message: 'Semantic Quiz generated successfully (Template Injection)',
      topic,
      questions
    });
  } catch (error) {
    console.error('Semantic Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate quiz with semantic patterns', error: error.message });
  }
};

// Get Quiz Attempts (for stats)
const getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;

    const attempts = await Attempt.find({ quizId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attempts', error: error.message });
  }
};

// Get User's Attempts
const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user._id;

    const attempts = await Attempt.find({ userId })
      .populate('quizId', 'title')
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attempts', error: error.message });
  }
};

// Export all functions
module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitAttempt,
  getQuizAttempts,
  getUserAttempts,
  generateQuiz
};