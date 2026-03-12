import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserProfile, getUserStats } from '../services/api';
import { setInternalNav } from '../utils/navigation';
import './Dashboard.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getUserProfile();
        setProfile(profileData);

        const statsData = await getUserStats();
        setStats(statsData);
      } catch (err) {
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>👤 User Profile</h1>
          <button 
            className="btn btn-secondary" 
            onClick={() => { setInternalNav(); navigate(-1); }}
          >
            ← Back
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="profile-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem'
        }}>
          {/* User Info Card */}
          <div className="quiz-card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                color: 'white',
                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
              }}>
                {profile?.name?.[0].toUpperCase()}
              </div>
              <h3>{profile?.name}</h3>
              <p className="quiz-questions" style={{ display: 'inline-block' }}>
                {profile?.isAdmin ? '🛡️ Administrator' : '🎓 Student'}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600' }}>EMAIL ADDRESS</label>
                <p style={{ fontWeight: '500', color: '#1f2937' }}>{profile?.email}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600' }}>MEMBER SINCE</label>
                <p style={{ fontWeight: '500', color: '#1f2937' }}>
                  {new Date(profile?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="quiz-card" style={{ padding: '2.5rem' }}>
            <h3>📊 Quick Statistics</h3>
            <p>Your learning journey at a glance.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '1rem' }}>
                <h4 style={{ color: '#6366f1', fontSize: '2rem', margin: '0' }}>{stats?.totalAttempts || 0}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0' }}>Quizzes Taken</p>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '1rem' }}>
                <h4 style={{ color: '#10b981', fontSize: '2rem', margin: '0' }}>{stats?.averageScore || 0}%</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0' }}>Avg. Performance</p>
              </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#6b7280' }}>
                "The only limit to our realization of tomorrow will be our doubts of today."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
