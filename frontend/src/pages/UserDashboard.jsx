import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setInternalNav } from '../utils/navigation';
import { getQuizzes, getQuizById, submitAttempt, getLeaderboard, getAnnouncements, markAnnouncementAsRead } from '../services/api';
import Navbar from '../components/Navbar';
import './Dashboard.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import confetti from 'canvas-confetti';
import useSound from 'use-sound';

function UserDashboard() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sound effects
  const [playSuccess] = useSound('https://cdn.pixabay.com/audio/2021/08/04/audio_bbd1297d4c.mp3'); // Tada
  const [playClick] = useSound('https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a733cd.mp3'); // Click
  const [playSubmit] = useSound('https://cdn.pixabay.com/audio/2021/08/04/audio_0625c11bc3.mp3'); // Level up

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesData, annData] = await Promise.all([
          getQuizzes(),
          getAnnouncements()
        ]);
        setQuizzes(quizzesData);
        setAnnouncements(annData);
        
        // Count unread
        const userId = localStorage.getItem('userId');
        const unread = annData.filter(a => !a.isReadBy.includes(userId)).length;
        setUnreadCount(unread);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAnnouncementAsRead(id);
      setAnnouncements(announcements.map(a => 
        a._id === id ? { ...a, isReadBy: [...a.isReadBy, localStorage.getItem('userId')] } : a
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  useEffect(() => {
    let timer;
    if (selectedQuiz && timeLeft !== null && !result) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [selectedQuiz, timeLeft, result]);

  const filteredQuizzes = quizzes.filter(q => 
    (q?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAttemptClick = async (quiz) => {
    playClick();
    try {
      const fullQuiz = await getQuizById(quiz._id);
      setSelectedQuiz(fullQuiz);
      setAnswers(new Array(fullQuiz.questions.length).fill(''));
      setResult(null);
      setError('');
      setCurrentQuestion(0);
      setStartTime(Date.now());
      if (fullQuiz.timeLimit > 0) {
        setTimeLeft(fullQuiz.timeLimit);
      } else {
        setTimeLeft(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load quiz');
    }
  };

  const handleAnswerChange = (index, value) => {
    playClick();
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!selectedQuiz) return;
    playSubmit();
    setSubmitting(true);
    setError('');

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const data = await submitAttempt(selectedQuiz._id, answers, timeTaken);
      setResult(data);
      if (data.score === data.totalQuestions) {
        playSuccess();
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to submit attempt');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  };

  const downloadCertificate = () => {
    if (!result || !selectedQuiz) return;
    
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    if (percentage < 80) return; // Only allow download if 80%+
    
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Background
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 297, 210, 'F');
    
    // Borders
    doc.setDrawColor(234, 179, 8); // Yellow 500 (Gold)
    doc.setLineWidth(4);
    doc.rect(8, 8, 281, 194);
    doc.setDrawColor(51, 65, 85); // Slate 700 (Inner Border)
    doc.setLineWidth(1);
    doc.rect(14, 14, 269, 182);
    
    // Header
    doc.setFontSize(48);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF EXCELLENCE', 148, 45, { align: 'center' });
    
    // Subheader
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225); // Slate 300
    doc.text('This is to officially certify that', 148, 65, { align: 'center' });
    
    // Recipient Name
    doc.setFontSize(32);
    doc.setTextColor(99, 102, 241); // Indigo 500
    doc.setFont('helvetica', 'bold');
    const studentName = localStorage.getItem('userName') || 'STUDENT';
    doc.text(studentName.toUpperCase(), 148, 85, { align: 'center' });
    
    // Body Text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('has successfully demonstrated proficiency in the module:', 148, 105, { align: 'center' });
    
    // Quiz Title
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(`"${selectedQuiz.title}"`, 148, 125, { align: 'center' });
    
    // Performance Metrics
    doc.setFontSize(14);
    doc.setTextColor(148, 163, 184); // Slate 400
    const scoreText = `Efficiency Rating: ${percentage}% | Date: ${new Date().toLocaleDateString()}`;
    doc.text(scoreText, 148, 150, { align: 'center' });

    // Decorative Element
    doc.setDrawColor(99, 102, 241, 0.5);
    doc.line(100, 165, 197, 165);
    
    // Footer Branding
    doc.setFontSize(12);
    doc.setTextColor(234, 179, 8);
    doc.text('Verified by QuizMaster Verification Services', 148, 185, { align: 'center' });

    doc.save(`${selectedQuiz.title}_Certificate.pdf`);
  };

  const getAchievementLabel = (slug) => {
    const labels = {
      'PERFECT_SCORE': '✨ Perfect Score',
      'SPEED_DEMON': '⚡ Speed Demon',
      'GOAL_ACHIEVER': '🎯 Goal Achiever'
    };
    return labels[slug] || slug;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container glass">
          <div className="spinner"></div>
          <p>Initializing Quiz Systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-container">
          {selectedQuiz ? (
            <div className="quiz-container">
              <div className="quiz-header">
                <div className="quiz-header-main">
                  <button
                    className="btn-back"
                    onClick={() => {
                      setSelectedQuiz(null);
                      setResult(null);
                      setTimeLeft(null);
                    }}
                  >
                    ← Back
                  </button>
                  <div className="quiz-title-section">
                    <h2>{selectedQuiz.title}</h2>
                  </div>
                  {timeLeft !== null && (
                    <div className={`quiz-timer ${timeLeft < 30 ? 'timer-low' : ''}`}>
                      <span className="timer-icon">⏳</span>
                      <span className="timer-text">{formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="quiz-progress-wrapper">
                <div className="quiz-progress-text">
                  <div className="progress-label">
                    <span>Completion Status</span>
                  </div>
                  <span>{answers.filter(a => a !== '').length} / {selectedQuiz.questions.length} Answered</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${(answers.filter(a => a !== '').length / selectedQuiz.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {error && <div className="error-alert">{error}</div>}

              {result ? (
                <div className="result-container animate-fade-in">
                  <div className="result-header">
                    <div className="score-circle">
                      <span className="score-number">{result.score}</span>
                      <span className="score-total">/ {result.totalQuestions}</span>
                    </div>
                    <div className="result-status-main">
                      <h3>
                        {result.isPass ? '🎉 Goal Achieved!' : '💪 Keep Practicing!'}
                      </h3>
                      <div className={`status-badge ${result.isPass ? 'pass' : 'fail'}`}>
                        {result.isPass ? 'PASSED' : 'FAILED'} (Req: {selectedQuiz.passingScore || 70}%)
                      </div>
                    </div>
                  </div>

                  {result.achievements && result.achievements.length > 0 && (
                    <div className="achievements-display">
                      {result.achievements.map(slug => (
                        <span key={slug} className="achievement-badge">
                          {getAchievementLabel(slug)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="result-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">Time Taken</span>
                      <span className="meta-value">{formatTime(result.attempt?.timeTaken || 0)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Accuracy Ratio</span>
                      <span className="meta-value">{Math.round((result.score/result.totalQuestions)*100)}%</span>
                    </div>
                  </div>

                  <div className="feedback-container">
                    {result.feedback.map((f, idx) => (
                      <div
                        key={idx}
                        className={`feedback-item ${f.correct ? 'correct' : 'incorrect'}`}
                      >
                        <div className="feedback-header">
                          <span className="feedback-icon">{f.correct ? '✅' : '❌'}</span>
                          <span className="feedback-question">Question {idx + 1}</span>
                        </div>
                        <p className="question-text">{f.question}</p>
                        <div className="answer-details">
                          <p>
                            <strong>Your Response:</strong>{' '}
                            <span className={f.correct ? 'correct-answer' : 'incorrect-answer'}>
                              {f.selected || 'Skip'}
                            </span>
                          </p>
                          {!f.correct && (
                            <p>
                              <strong>Correct Key:</strong>{' '}
                              <span className="correct-answer">{f.correctAnswer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="result-actions">
                    <button className="btn btn-primary" onClick={() => { playClick(); setSelectedQuiz(null); setResult(null); }}>
                      Explore More
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={async () => {
                        playClick();
                        try {
                          const data = await getLeaderboard(selectedQuiz._id);
                          setLeaderboardData(data);
                          setShowLeaderboard(true);
                        } catch (err) {
                          setError('Failed to load leaderboard');
                        }
                      }}
                    >
                      🏆 Rankings
                    </button>
                    {Math.round((result.score / result.totalQuestions) * 100) >= 80 && (
                      <button className="btn btn-success" onClick={() => { playClick(); downloadCertificate(); }}>
                        🎓 Certificate
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="question-container animate-slide-up">
                  <div className="question-header">
                    <h3>{selectedQuiz.questions[currentQuestion]?.question}</h3>
                  </div>

                  <div className="options">
                    {selectedQuiz.questions[currentQuestion]?.options.map((option, idx) => (
                      <label 
                        key={idx} 
                        className={`option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q${currentQuestion}`}
                          value={option}
                          checked={answers[currentQuestion] === option}
                          onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                        />
                        <span className="option-label">{option}</span>
                      </label>
                    ))}
                  </div>

                  <div className="question-nav">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        playClick();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setCurrentQuestion(Math.max(0, currentQuestion - 1));
                      }}
                      disabled={currentQuestion === 0}
                    >
                      ← Previous
                    </button>

                    <div className="question-indicators">
                      {selectedQuiz.questions.map((_, idx) => (
                        <button
                          key={idx}
                          className={`indicator ${answers[idx] ? 'answered' : ''} ${
                            idx === currentQuestion ? 'active' : ''
                          }`}
                          onClick={() => {
                            playClick();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setCurrentQuestion(idx);
                          }}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    {currentQuestion === selectedQuiz.questions.length - 1 ? (
                      <button
                        className="btn-success"
                        onClick={handleSubmit}
                        disabled={submitting || answers.some((a) => !a)}
                      >
                        {submitting ? 'Submitting...' : '✨ Submit Quiz'}
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => {
                          playClick();
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          setCurrentQuestion(currentQuestion + 1);
                        }}
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="quizzes-listing animate-fade-in">
              {/* Announcements Section */}
              {announcements.length > 0 && (
                <div className="announcements-section glass" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(59, 130, 246, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>📢</span>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e40af' }}>System Broadcasts</h2>
                    {unreadCount > 0 && <span className="unread-badge" style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem' }}>{unreadCount} New</span>}
                  </div>
                  <div className="ann-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {announcements.map(ann => {
                      const isRead = ann.isReadBy.includes(localStorage.getItem('userId'));
                      return (
                        <div key={ann._id} className={`ann-item ${isRead ? 'read' : 'unread'}`} style={{ 
                          padding: '1rem', 
                          borderRadius: '1rem', 
                          background: isRead ? 'transparent' : 'white',
                          border: isRead ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(59, 130, 246, 0.2)',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>{ann.title}</h3>
                            <small color="var(--gray-400)">{new Date(ann.createdAt).toLocaleDateString()}</small>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gray-600)' }}>{ann.content}</p>
                          {!isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(ann._id)}
                              style={{ 
                                marginTop: '0.5rem', 
                                background: 'none', 
                                border: 'none', 
                                color: '#3b82f6', 
                                cursor: 'pointer', 
                                fontSize: '0.8rem',
                                padding: 0,
                                fontWeight: 'bold'
                              }}
                            >
                              Mark as read ✓
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="listing-header" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                <button className="btn-back" onClick={() => { setInternalNav(); navigate(-1); }}>← Back</button>
                <div className="header-text">
                  <h1 className="page-title" style={{ margin: 0 }}>Explore Quizzes</h1>
                  <p className="subtitle">Select a quiz to begin. Complete all questions with 70%+ accuracy to earn certification.</p>
                </div>
                
                <div className="listing-controls glass">
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input 
                      type="text" 
                      placeholder="Search protocols, systems, or keywords..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {error && <div className="error-alert">{error}</div>}

              {filteredQuizzes.length === 0 ? (
                <div className="no-quizzes-found glass animate-fade-in">
                  <div className="empty-visual">🔎</div>
                  <h3>no quizzes related to "{searchTerm}"</h3>
                  <p>Check your spelling or try a different keyword.</p>
                  <button className="btn btn-secondary" onClick={() => { playClick(); setSearchTerm(''); }}>
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="quizzes-grid">
                  {filteredQuizzes.map((q) => (
                    <div key={q._id} className="quiz-card premium-card glass">
                      <div className="card-top">
                        <div className="quiz-status-pill">
                          <span className="dot pulse"></span> Active
                        </div>
                      </div>
                      
                      <div className="card-mid">
                        <div className="quiz-icon-large">🧩</div>
                        <div className="quiz-info">
                          <h3>{q.title}</h3>
                          <p>{q.description || 'No detailed system logs available. Proceed with standard protocols.'}</p>
                        </div>
                      </div>

                      <div className="card-bottom">
                        <div className="quiz-stats-row">
                          <div className="stat">
                            <span className="label">Complexity</span>
                            <span className="val">{q.questions?.length || 0} Layers</span>
                          </div>
                          <div className="stat">
                            <span className="label">SLA</span>
                            <span className="val">{q.timeLimit > 0 ? formatTime(q.timeLimit) : '∞'}</span>
                          </div>
                        </div>
                        <button
                          className="btn btn-primary btn-full"
                          onClick={() => handleAttemptClick(q)}
                        >
                          Take Quiz
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showLeaderboard && (
        <div className="modal-overlay" onClick={() => { playClick(); setShowLeaderboard(false); }}>
          <div className="leaderboard-modal glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏆 System Rankings</h2>
              <button className="close-btn" onClick={() => { playClick(); setShowLeaderboard(false); }}>×</button>
            </div>
            <div className="leaderboard-table">
              {leaderboardData.length === 0 ? (
                <p className="no-data">No data points recorded yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student</th>
                      <th>Score</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((item, idx) => (
                      <tr key={idx} className={item.isPass ? 'pass-row' : ''}>
                        <td className="rank-cell">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                        </td>
                        <td className="name-cell">{item.userId.name}</td>
                        <td className="score-cell">{item.score}/{item.totalQuestions}</td>
                        <td className="time-cell">{formatTime(item.timeTaken)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;