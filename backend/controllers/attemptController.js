const Attempt = require('../models/Attempt');
const Quiz = require('../models/quizModel');

// Submit an attempt (answers as array)
const submitAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const answersArray = req.body.answers; // [{ selected: "..." }, ...]
    let score = 0;
    const feedback = [];

    // Compare each submitted answer with the correct one
    quiz.questions.forEach((q, index) => {
      const userAnswer = answersArray[index]?.selected || null;
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) score++;

      feedback.push({
        question: q.question,
        selected: userAnswer,
        correctAnswer: q.answer,
        correct: isCorrect,
      });
    });

    const attempt = new Attempt({
      quiz: quiz._id,
      user: req.user._id, // requires auth
      answers: answersArray,
      score,
    });

    await attempt.save();

    // ✅ Return full details, not just score
    res.json({
      score,
      totalQuestions: quiz.questions.length,
      feedback,
      attemptId: attempt._id,
      createdAt: attempt.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all attempts for a quiz
const getAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ quiz: req.params.id }).populate('user', 'name email');
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitAttempt, getAttempts };
