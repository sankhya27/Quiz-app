import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createAnnouncement, getAnnouncements } from '../services/api';
import { setInternalNav } from '../utils/navigation';
import './AdminDashboard.css';

function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('user');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setMessage('Please fill all fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await createAnnouncement({ title, content, targetRoles: [targetRole] });
      setMessage('✅ Announcement posted successfully!');
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (err) {
      setMessage(err.message || 'Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="admin-dashboard premium-theme">
        <header className="admin-header">
          <div className="header-titles">
            <h1>📢 Announcements</h1>
            <p>Send notifications to all students or admins</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => { setInternalNav(); navigate(-1); }}>← Back</button>
          </div>
        </header>

        <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', marginBottom: '3rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Announcement Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Quiz Released!"
                className="glass"
              />
            </div>
            <div className="form-group">
              <label>Target Audience</label>
              <select 
                value={targetRole} 
                onChange={(e) => setTargetRole(e.target.value)}
                className="glass"
                style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
              >
                <option value="user">All Students</option>
                <option value="admin">All Admins</option>
              </select>
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your message here..."
                className="glass"
                style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Announcement'}
            </button>
            {message && <p style={{ marginTop: '1rem', color: message.includes('✅') ? '#10b981' : '#ef4444' }}>{message}</p>}
          </form>
        </div>

        <section className="quizzes-management">
          <h2>Past Announcements</h2>
          {fetching ? <p>Loading...</p> : (
            <div className="infra-grid">
              {announcements.map(ann => (
                <div key={ann._id} className="infra-card glass">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="status-pill live" style={{ background: ann.targetRoles.includes('admin') ? '#fef9c3' : '#dcfce7', color: ann.targetRoles.includes('admin') ? '#a16207' : '#15803d' }}>
                      To: {ann.targetRoles.join(', ')}
                    </span>
                    <small>{new Date(ann.createdAt).toLocaleDateString()}</small>
                  </div>
                  <h3>{ann.title}</h3>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>{ann.content}</p>
                </div>
              ))}
              {announcements.length === 0 && <p>No announcements found.</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminAnnouncements;
