import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { setInternalNav } from '../utils/navigation';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleType, setRoleType] = useState('student'); // 'student' or 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await loginUser({ email, password });
      
      if (roleType === 'admin' && !data.isAdmin) {
        throw new Error('This account does not have Admin privileges');
      }
      if (roleType === 'student' && data.isAdmin) {
        throw new Error('This is an Admin account. Please select Admin to login');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.isAdmin ? 'admin' : 'user');
      localStorage.setItem('userId', data._id);
      localStorage.setItem('userName', data.name);

      handleNav(data.isAdmin ? '/admin-dashboard' : '/user-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass">
        <div className="auth-header">
          <div onClick={() => { setInternalNav(); navigate(-1); }} className="back-home" style={{ cursor: 'pointer' }}>← Back</div>
          <h2>{roleType === 'admin' ? '🛡️ Admin Login' : '🎓 Student Login'}</h2>
          <p>Welcome back! Please sign in to your {roleType} account.</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="role-switch">
          <button 
            type="button"
            className={`switch-btn ${roleType === 'student' ? 'active' : ''}`}
            onClick={() => setRoleType('student')}
          >
            🎓 Student
          </button>
          <button 
            type="button"
            className={`switch-btn ${roleType === 'admin' ? 'active' : ''}`}
            onClick={() => setRoleType('admin')}
          >
            🛡️ Admin
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="glass"
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>Password</label>
              <div onClick={() => handleNav('/forgot-password')} className="forgot-password" style={{ cursor: 'pointer' }}>Forgot?</div>
            </div>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="glass"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? '🔐 Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <span onClick={() => handleNav('/register')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Create one</span></p>
        </div>
      </div>
    </div>
  );
}

export default Login;