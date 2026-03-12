import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../services/api';
import { validatePasswordStrength } from '../utils/validation';
import { setInternalNav } from '../utils/navigation';
import './Auth.css';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  // Step 1: verify email | Step 2: set new password | Step 3: success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — verify email exists
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — reset password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email, newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass fp-container">

        {/* Header */}
        <div className="auth-header">
          <div onClick={() => { setInternalNav(); navigate(-1); }} className="back-home" style={{ cursor: 'pointer' }}>← Back</div>
          <h2>🔑 Forgot Password</h2>
          {step < 3 && (
            <div className="fp-steps">
              <div className={`fp-step ${step >= 1 ? 'active' : ''}`}>1. Verify Email</div>
              <div className="fp-step-divider" />
              <div className={`fp-step ${step >= 2 ? 'active' : ''}`}>2. New Password</div>
            </div>
          )}
        </div>

        {error && <div className="error-alert">{error}</div>}

        {/* ── Step 1: Enter Email ── */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <p className="fp-desc">Enter the email address linked to your account.</p>
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
            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? '🔍 Verifying...' : 'Verify Email →'}
            </button>
          </form>
        )}

        {/* ── Step 2: Set New Password ── */}
        {step === 2 && (
          <form onSubmit={handleResetSubmit}>
            <p className="fp-desc">Choose a strong new password for <strong>{email}</strong>.</p>

            <div className="form-group">
              <label>New Password</label>
              <div className="password-input">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  className="glass"
                />
                <button type="button" className="toggle-password" onClick={() => setShowNew(!showNew)}>
                  {showNew ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '5px' }}>
                Must be at least 8 chars with uppercase, lowercase, number, & special char.
              </p>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="password-input">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="glass"
                />
                <button type="button" className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? '🔐 Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              className="btn-secondary btn-full"
              style={{ marginTop: '0.5rem' }}
              onClick={() => { setStep(1); setError(''); }}
              disabled={loading}
            >
              ← Change Email
            </button>
          </form>
        )}

        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <div className="fp-success">
            <div className="fp-success-icon">✅</div>
            <h3>Password Reset!</h3>
            <p>Your password has been updated successfully. You can now sign in with your new password.</p>
            <button
              className="btn-primary btn-full"
              onClick={() => handleNav('/login')}
            >
              Go to Login →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
