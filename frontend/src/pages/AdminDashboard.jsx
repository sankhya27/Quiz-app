import React, { useEffect, useState } from 'react';
import { getQuizzes, deleteQuiz, getOverallStats } from '../services/api';
import Navbar from '../components/Navbar';
import { setInternalNav } from '../utils/navigation';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quizzesData, statsData] = await Promise.all([
        getQuizzes(),
        getOverallStats()
      ]);
      setQuizzes(quizzesData);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('🚨 Permanent Action: Delete this quiz?')) return;

    setDeleteLoading(quizId);
    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter(q => q._id !== quizId));
    } catch (err) {
      setError(err.message || 'Failed to delete quiz');
    } finally {
      setDeleteLoading(null);
    }
  };


  if (loading) return <div className="loading">Initializing Core Systems...</div>;

  return (
    <div>
      <Navbar />
      <div className="admin-dashboard premium-theme">
        <header className="admin-header">
          <div className="header-titles">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <button className="btn-back" onClick={() => { setInternalNav(); navigate(-1); }}>← Back</button>
              <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
            </div>
            <p>Quiz Overview & Control Panel</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-secondary btn-glow"
              onClick={() => handleNav('/admin-announcements')}
              style={{ border: '2px solid #3b82f6', color: '#3b82f6' }}
            >
              <span>📢</span> News
            </button>
            <button 
              className="btn btn-primary btn-glow"
              onClick={() => handleNav('/admin-create-quiz')}
              style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
            >
              <span>+</span> Create New Quiz
            </button>
          </div>
        </header>

        {error && <div className="error-alert glass">{error}</div>}

        {stats && (
          <div className="overall-stats-grid">
            <div className="infra-card stat-card glass">
              <span className="stat-label">Total Quizzes</span>
              <span className="stat-value">{stats.totalQuizzes}</span>
              <div className="stat-icon">📚</div>
            </div>
            <div className="infra-card stat-card glass">
              <span className="stat-label">Total Attempts</span>
              <span className="stat-value">{stats.totalAttempts}</span>
              <div className="stat-icon">📝</div>
            </div>
            <div className="infra-card stat-card glass">
              <span className="stat-label">Active Students</span>
              <span className="stat-value">{stats.totalUsers}</span>
              <div className="stat-icon">👥</div>
            </div>
            <div className="infra-card stat-card glass">
              <span className="stat-label">Avg. Proficiency</span>
              <span className="stat-value">{stats.averageScore}%</span>
              <div className="stat-icon">🎯</div>
            </div>
          </div>
        )}

        <section className="quizzes-management">
          <div className="section-header">
            <h2>Active Quizzes</h2>
          </div>

          {quizzes.length === 0 ? (
            <div className="empty-state glass">
              <p>No active quizzes detected.</p>
              <button 
                className="btn btn-primary"
                onClick={() => handleNav('/admin-create-quiz')}
              >
                Create First Quiz
              </button>
            </div>
          ) : (
            <div className="infra-grid">
              {quizzes.map(quiz => (
                <div key={quiz._id} className="infra-card quiz-item glass">
                  <div className="card-header">
                    <div className="card-actions">
                      <button onClick={() => handleNav(`/admin-edit-quiz/${quiz._id}`)} title="Edit Quiz">✏️</button>
                      <button 
                        onClick={() => handleDelete(quiz._id)}
                        className={deleteLoading === quiz._id ? 'spinning' : ''}
                        title="Remove Quiz"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <h3>{quiz.title}</h3>
                    <div className="quiz-meta-info">
                      <span>❓ {quiz.questions?.length || 0} Questions</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button 
                      className="btn-link"
                      onClick={() => handleNav(`/admin-quiz-stats/${quiz._id}`)}
                    >
                      Advanced Analytics →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .admin-dashboard.premium-theme { padding: 40px; max-width: 1400px; margin: 0 auto; min-height: 100vh; background: transparent; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .header-titles h1 { font-size: 2.5rem; font-weight: 900; color: var(--dark); margin: 0; }
        .header-titles p { color: var(--gray-500); margin: 5px 0 0; }
        
        .error-alert { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; padding: 15px 25px; border-radius: 12px; margin-bottom: 30px; font-weight: 600; }
        
        .overall-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .infra-card { border-radius: 20px; padding: 24px; position: relative; overflow: hidden; }
        .stat-card { display: flex; flex-direction: column; background: var(--glass-bg); border: 2px solid var(--glass-border); box-shadow: var(--shadow); backdrop-filter: blur(10px); }
        .stat-label { font-size: 0.9rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; }
        .stat-value { font-size: 2.2rem; font-weight: 800; color: var(--primary); margin-top: 5px; }
        .stat-icon { position: absolute; right: 20px; bottom: 20px; font-size: 2rem; opacity: 0.15; transform: rotate(-15deg); }
        
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .section-header h2 { font-size: 1.5rem; color: var(--dark); font-weight: 800; }
        
        .infra-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 30px; }
        .quiz-item { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; background: var(--glass-bg); border: 2px solid var(--glass-border); box-shadow: var(--shadow); backdrop-filter: blur(10px); }
        .quiz-item:hover { transform: translateY(-5px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); border-color: var(--primary); }
        
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .status-pill { padding: 5px 14px; border-radius: 100px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; }
        .status-pill.live { background: #dcfce7; color: #15803d; }
        .status-pill.draft { background: #fef9c3; color: #a16207; }
        
        .card-actions { display: flex; gap: 8px; }
        .card-actions button { background: var(--gray-100); border: 1px solid var(--border); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .card-actions button:hover { background: var(--white); border-color: var(--primary); transform: scale(1.1); }
        
        .card-body h3 { font-size: 1.35rem; font-weight: 800; color: var(--dark); margin: 0 0 12px; line-height: 1.2; }
        .description-text { color: var(--gray-500); font-size: 0.95rem; line-height: 1.6; margin-bottom: 22px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .quiz-meta-info { display: flex; gap: 15px; font-size: 0.85rem; color: var(--gray-400); font-weight: 600; }
        
        .card-footer { margin-top: auto; padding-top: 25px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .btn-link { background: none; border: none; color: var(--primary); font-weight: 700; cursor: pointer; padding: 0; font-size: 0.9rem; }
        
        
        .empty-state { padding: 60px; text-align: center; border-radius: 24px; border: 2px dashed var(--border); margin-top: 20px; }
        .empty-state p { font-size: 1.1rem; color: var(--gray-500); margin-bottom: 20px; }
        
        .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; font-size: 1.2rem; font-weight: 600; color: var(--primary); letter-spacing: 1px; }
        
        @media (max-width: 1024px) { .overall-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { 
          .overall-stats-grid { grid-template-columns: 1fr; }
          .infra-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;