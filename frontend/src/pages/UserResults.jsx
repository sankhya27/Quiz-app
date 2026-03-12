import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserAttempts } from '../services/api';
import Navbar from '../components/Navbar';
import { setInternalNav } from '../utils/navigation';
import jsPDF from 'jspdf';
import './Dashboard.css';
import useSound from 'use-sound';

function UserResults() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const [playClick] = useSound('https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a733cd.mp3');

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const data = await getUserAttempts();
      // Sort by latest first
      setAttempts(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
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

  const handleDownloadCertificate = (attempt) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Dark Background Pattern (mimicking the site's aesthetic)
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 297, 210, 'F');

    // Gradient Edge (Gold)
    doc.setDrawColor(234, 179, 8); // Yellow 500
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    
    // Header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(40);
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
    const studentName = localStorage.getItem('userName') || attempt.userId?.name || 'STUDENT';
    doc.text(studentName.toUpperCase(), 148, 85, { align: 'center' });
    
    // Body Text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('has successfully demonstrated proficiency in the module:', 148, 105, { align: 'center' });
    
    // Quiz Title
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(`"${attempt.quizId?.title}"`, 148, 125, { align: 'center' });
    
    // Performance Metrics
    doc.setFontSize(14);
    doc.setTextColor(148, 163, 184); // Slate 400
    const scoreText = `Efficiency Rating: ${Math.round((attempt.score/attempt.totalQuestions)*100)}% | Date: ${new Date(attempt.createdAt).toLocaleDateString()}`;
    doc.text(scoreText, 148, 150, { align: 'center' });

    // Decorative Element
    doc.setDrawColor(99, 102, 241, 0.5);
    doc.line(100, 165, 197, 165);
    
    // Footer Branding
    doc.setFontSize(12);
    doc.setTextColor(234, 179, 8);
    doc.text('Verified by QuizMaster Verification Services', 148, 185, { align: 'center' });

    doc.save(`${attempt.quizId?.title}_Certificate.pdf`);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container glass">
          <div className="spinner"></div>
          <p>Retrieving Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container animate-fade-in">
        <header className="results-header">
          <div className="header-titles">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <button className="btn-back" onClick={() => { setInternalNav(); navigate(-1); }}>← Back</button>
              <h1 className="page-title" style={{ margin: 0 }}>Quiz History</h1>
            </div>
            <p className="subtitle">Track your quiz completions and performance metrics over time.</p>
          </div>
          <div className="overall-stats glass">
            <div className="mini-stat">
              <span className="label">Total Quizzes</span>
              <span className="val">{attempts.length}</span>
            </div>
            <div className="mini-stat">
              <span className="label">Average Efficiency</span>
              <span className="val">
                {attempts.length > 0 
                  ? Math.round(attempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / attempts.length * 100) 
                  : 0}%
              </span>
            </div>
          </div>
        </header>

        {error && <div className="error-alert glass">{error}</div>}

        {attempts.length === 0 ? (
          <div className="empty-state glass animate-slide-up">
            <div className="empty-visual">📜</div>
            <h3>No Records Captured</h3>
            <p>You haven't taken any quizzes yet. Head over to the Explore page to begin.</p>
            <button className="btn btn-primary" onClick={() => handleNav('/user-dashboard')}>
              Find First Quiz
            </button>
          </div>
        ) : (
          <div className="results-grid animate-slide-up">
            {attempts.map((attempt, idx) => {
              const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
              const isPass = percentage > 30;
              const isEligibleForCert = percentage >= 80;
              
              return (
                <div key={idx} className={`result-card glass ${isPass ? 'pass-border' : 'fail-border'}`}>
                  <div className="card-header">
                    <span className="date-stamp">{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    <span className={`status-pill ${isPass ? 'pass' : 'fail'}`}>
                      {isPass ? 'VALIDATED' : 'ANOMALY'}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <h3>{attempt.quizId?.title || 'Unknown Protocol'}</h3>
                    <div className="score-wrapper">
                      <div className="score-radial">
                        <span className="percent">{percentage}%</span>
                        <span className="ratio">{attempt.score}/{attempt.totalQuestions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="meta-info">
                      <div className="item">
                        <span className="icon">⏱️</span>
                        <span>{formatTime(attempt.timeTaken || 0)}</span>
                      </div>
                    </div>
                    {isEligibleForCert && (
                      <button 
                        className="btn-cert animate-fade-in"
                        onClick={() => handleDownloadCertificate(attempt)}
                      >
                        🎓 Download Certificate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .results-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; flex-wrap: wrap; gap: 2rem; }
        .header-titles h1 { text-align: left; margin-bottom: 0.5rem; }
        .overall-stats { display: flex; gap: 2rem; padding: 1.5rem 2.5rem; border-radius: 1.5rem; }
        .mini-stat { display: flex; flex-direction: column; }
        .mini-stat .label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--gray-500); letter-spacing: 0.05em; }
        .mini-stat .val { font-size: 1.8rem; font-weight: 900; color: var(--primary); }

        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
        .result-card { padding: 2rem; border-radius: 2rem; transition: transform 0.3s ease; border: 2px solid transparent; }
        .result-card:hover { transform: translateY(-8px); }
        .result-card.pass-border { border-color: rgba(16, 185, 129, 0.2); }
        .result-card.fail-border { border-color: rgba(239, 68, 68, 0.2); }

        .date-stamp { font-size: 0.85rem; font-weight: 700; color: var(--gray-400); }
        
        .result-card h3 { margin: 1.5rem 0 1.5rem; font-size: 1.25rem; font-weight: 800; line-height: 1.3; }
        
        .score-wrapper { display: flex; justify-content: center; margin-bottom: 1.5rem; }
        .score-radial { width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 6px solid var(--gray-100); background: white; }
        .pass-border .score-radial { border-color: #f0fdf4; color: #059669; }
        .fail-border .score-radial { border-color: #fef2f2; color: #dc2626; }
        
        .score-radial .percent { font-size: 1.5rem; font-weight: 900; line-height: 1; }
        .score-radial .ratio { font-size: 0.75rem; font-weight: 700; opacity: 0.7; }

        .meta-info { display: flex; gap: 1.5rem; }
        .meta-info .item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: var(--gray-500); }

        .btn-cert {
          margin-top: 1.5rem;
          width: 100%;
          background: var(--primary-gradient);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
        }
        .btn-cert:hover { transform: scale(1.02); filter: brightness(1.1); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }

        @media (max-width: 768px) {
          .results-header { flex-direction: column; align-items: flex-start; }
          .overall-stats { width: 100%; justify-content: space-around; }
        }
      `}</style>
    </div>
  );
}

export default UserResults;