const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://quiz-app-9fjj.onrender.com/api';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const API_BASE_URL = getBaseUrl();
console.log('API Base URL:', API_BASE_URL);

// ============ USER ENDPOINTS ============

// Register User
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/user/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
};

// Login User
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
};

// Forgot Password - verify email
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/user/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Email not found');
  }

  return response.json();
};

// Reset Password - set new password by email
export const resetPassword = async (email, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/user/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Password reset failed');
  }

  return response.json();
};

// Get User Profile
export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch profile');
  }

  return response.json();
};

// ============ QUIZ ENDPOINTS ============

// Get All Quizzes
export const getQuizzes = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/quiz`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch quizzes');
  }

  return response.json();
};

// Get Quiz by ID
export const getQuizById = async (quizId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch quiz');
  }

  return response.json();
};

// Create Quiz
export const createQuiz = async (quizData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(quizData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create quiz');
  }

  return response.json();
};

// Update Quiz
export const updateQuiz = async (quizId, quizData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(quizData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update quiz');
  }

  return response.json();
};

// Delete Quiz
export const deleteQuiz = async (quizId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete quiz');
  }

  return response.json();
};

// Generate Quiz using AI
export const generateAIQuiz = async (topic, numQuestions) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ topic, numQuestions })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate AI quiz');
  }

  return response.json();
};

// ============ ANNOUNCEMENT ENDPOINTS ============

export const createAnnouncement = async (announcementData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(announcementData)
  });
  return response.json();
};

export const getAnnouncements = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/announcements`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const markAnnouncementAsRead = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/announcements/${id}/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// ============ ATTEMPT ENDPOINTS ============

// Submit Quiz Attempt
export const submitAttempt = async (quizId, answers, timeTaken) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/attempt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ quizId, answers, timeTaken })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit attempt');
  }

  return response.json();
};

// Get Leaderboard for Quiz
export const getLeaderboard = async (quizId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/stats/leaderboard/${quizId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch leaderboard');
  }

  return response.json();
};

// Get Quiz Attempts (for stats)
export const getQuizAttempts = async (quizId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/quiz/attempts/${quizId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch attempts');
  }

  return response.json();
};

// Get User's Attempts
export const getUserAttempts = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/quiz/user/my-attempts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user attempts');
  }

  return response.json();
};

// ============ STATS ENDPOINTS ============

// Get Overall Stats (Admin)
export const getOverallStats = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/stats/overall`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch stats');
  }

  return response.json();
};

// Get Quiz Stats
export const getQuizStats = async (quizId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch quiz stats');
  }

  return response.json();
};

// Get User Stats
export const getUserStats = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/stats/user`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user stats');
  }

  return response.json();
};

// Get Detailed Quiz Stats (Admin)
export const getQuizDetailedStats = async (quizId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/stats/quiz-detailed/${quizId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch detailed quiz stats');
  }

  return response.json();
};