import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAnnouncements } from '../services/api';
import { setInternalNav } from '../utils/navigation';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // State for user data to make Navbar reactive
  const [user, setUser] = useState({
    name: localStorage.getItem('userName'),
    role: localStorage.getItem('userRole'),
    id: localStorage.getItem('userId')
  });

  // Re-check localStorage and fetch notifications when location changes
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setUser({
      name: localStorage.getItem('userName'),
      role: localStorage.getItem('userRole'),
      id: userId
    });
    setShowMenu(false);

    if (userId) {
      fetchUnreadCount(userId);
    }
  }, [location]);

  const fetchUnreadCount = async (userId) => {
    try {
      const annData = await getAnnouncements();
      const unread = annData.filter(a => !a.isReadBy.includes(userId)).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Navbar notification fetch failed');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setInternalNav();
    navigate('/');
  };

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <div onClick={() => handleNav('/')} className="navbar-logo" style={{ cursor: 'pointer' }}>
          <span className="logo-icon">🎯</span>
          <span className="logo-text">QuizMaster</span>
        </div>

        <div className={`navbar-menu ${showMenu ? 'active' : ''}`}>
          {user.role === 'admin' && (
            <>
              <div onClick={() => handleNav('/admin-dashboard')} className="nav-link" style={{ cursor: 'pointer' }}>
                <span className="icon">🎮</span> Dashboard
              </div>
              <div onClick={() => handleNav('/admin-stats')} className="nav-link" style={{ cursor: 'pointer' }}>
                <span className="icon">📊</span> Analytics
              </div>
            </>
          )}

          {user.role === 'user' && (
            <>
              <div onClick={() => handleNav('/user-dashboard')} className="nav-link" style={{ cursor: 'pointer' }}>
                <span className="icon">📚</span> Explore
              </div>
              <div onClick={() => handleNav('/user-results')} className="nav-link" style={{ cursor: 'pointer' }}>
                <span className="icon">🏆</span> My Results
              </div>
            </>
          )}
        </div>

        <div className="navbar-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark Mode">
            {isDark ? '🌙' : '☀️'}
          </button>

          {user.id && (
            <div className="nav-notification-wrapper" style={{ position: 'relative', marginRight: '1rem' }}>
               <span className="nav-icon" style={{ fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => handleNav(user.role === 'admin' ? '/admin-announcements' : '/user-dashboard')}>
                🔔
               </span>
               {unreadCount > 0 && (
                 <span className="nav-badge" style={{
                   position: 'absolute',
                   top: '-8px',
                   right: '-8px',
                   background: '#ef4444',
                   color: 'white',
                   borderRadius: '100px',
                   padding: '2px 6px',
                   fontSize: '0.65rem',
                   fontWeight: 'bold',
                   border: '2px solid white'
                 }}>{unreadCount}</span>
               )}
            </div>
          )}
          
          {user.name ? (
            <div className="user-profile-nav">
              <span className="user-name" onClick={() => handleNav('/profile')} style={{ cursor: 'pointer' }}>👤 {user.name}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-nav-buttons">
              <button onClick={() => handleNav('/login')} className="btn-nav primary">Login</button>
              <button onClick={() => handleNav('/register')} className="btn-nav primary">Join Now</button>
            </div>
          )}

          <div className="hamburger" onClick={() => setShowMenu(!showMenu)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;