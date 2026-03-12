import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { validatePasswordStrength } from '../utils/validation';
import { setInternalNav } from '../utils/navigation';
import './Auth.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleType, setRoleType] = useState('student'); // 'student' or 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const navigate = useNavigate();

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const isAdmin = roleType === 'admin';
      const data = await registerUser({ 
        name, 
        email, 
        password, 
        isAdmin,
        adminSecret
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.isAdmin ? 'admin' : 'user');
      localStorage.setItem('userId', data._id);
      localStorage.setItem('userName', data.name);
      
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        handleNav(data.isAdmin ? '/admin-dashboard' : '/user-dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass">
        <div className="auth-header">
          <div onClick={() => { setInternalNav(); navigate(-1); }} className="back-home" style={{ cursor: 'pointer' }}>← Back</div>
          <h2>Create Account</h2>
          <p>Start your learning journey today.</p>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {success && <div className="success-alert">{success}</div>}

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

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="glass"
            />
          </div>

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
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="glass"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '5px' }}>
              Minimum 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character.
            </p>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="glass"
            />
          </div>
          
          {roleType === 'admin' && (
            <div className="form-group animate-slide-up">
              <label>Admin Secret Key</label>
              <input
                type="password"
                placeholder="Enter special access key"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                disabled={loading}
                className="glass"
                style={{ borderColor: 'var(--primary)', borderWidth: '2px' }}
                required
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '5px' }}>
                🛡️ Required for administrative access.
              </p>
            </div>
          )}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? '📝 Creating Account...' : '✨ Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <span onClick={() => handleNav('/login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Sign In</span></p>
        </div>
      </div>
    </div>
  );
}

export default Register;