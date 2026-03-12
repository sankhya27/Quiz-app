const { body, validationResult } = require('express-validator');

// Validation middleware wrapper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// User validations
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Quiz validations
const validateCreateQuiz = [
  body('title').trim().notEmpty().withMessage('Quiz title required'),
  body('questions').isArray({ min: 1 }).withMessage('At least 1 question required'),
  body('questions.*.question').trim().notEmpty().withMessage('Question text required'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('Min 2 options per question'),
  body('questions.*.answer').trim().notEmpty().withMessage('Correct answer required'),
  validate
];

const validateAttempt = [
  body('quizId').notEmpty().withMessage('Quiz ID required'),
  body('answers').isArray().withMessage('Answers must be an array'),
  validate
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateQuiz,
  validateAttempt,
  validate
};