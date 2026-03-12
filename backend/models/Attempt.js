const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  quizId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quiz', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  answers: {
    type: [String],
    required: true
  },
  score: { 
    type: Number, 
    required: true 
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  isPass: {
    type: Boolean,
    default: false
  },
  feedback: [
    {
      question: String,
      selected: String,
      correctAnswer: String,
      correct: Boolean
    }
  ],
  achievements: {
    type: [String], // e.g., ['PERFECT_SCORE', 'SPEED_DEMON', 'CERTIFIED']
    default: []
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Attempt', attemptSchema);