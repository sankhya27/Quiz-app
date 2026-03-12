import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOverallStats } from '../services/api';
import Navbar from '../components/Navbar';
import { setInternalNav } from '../utils/navigation';
import './Dashboard.css';

function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getOverallStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch overall statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading platform statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Platform Analytics</h1>
          <button className="btn-back" onClick={() => { setInternalNav(); navigate(-1); }}>← Back</button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="stats-overview" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem' 
        }}>
          <div className="quiz-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h4 style={{ margin: '0', color: '#6b7280' }}>Total Quizzes</h4>
            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#6366f1' }}>{stats?.totalQuizzes || 0}</h2>
          </div>

          <div className="quiz-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h4 style={{ margin: '0', color: '#6b7280' }}>Total Users</h4>
            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#8b5cf6' }}>{stats?.totalUsers || 0}</h2>
          </div>

          <div className="quiz-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
            <h4 style={{ margin: '0', color: '#6b7280' }}>Total Attempts</h4>
            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#10b981' }}>{stats?.totalAttempts || 0}</h2>
          </div>

          <div className="quiz-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h4 style={{ margin: '0', color: '#6b7280' }}>Avg. Performance</h4>
            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#f59e0b' }}>{stats?.averageScore || 0}%</h2>
          </div>
        </div>

        <div className="quiz-card" style={{ marginTop: '3rem', padding: '3rem' }}>
          <h3>Growth & Activity Summary</h3>
          <p>The platform is seeing healthy engagement across all modules.</p>
          <div style={{ 
            marginTop: '2rem', 
            padding: '2rem', 
            background: '#f8fafc', 
            borderRadius: '1rem',
            borderLeft: '5px solid #6366f1'
          }}>
            <p style={{ margin: '0', color: '#1f2937', fontWeight: '500' }}>
              Currently, there are {stats?.totalQuizzes} active quizzes being attempted by {stats?.totalUsers} registered users. 
              The platform has successfully facilitated {stats?.totalAttempts} learning sessions with an overall performance rate of {stats?.averageScore}%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;