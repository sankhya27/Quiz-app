import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizDetailedStats, getQuizById } from '../services/api';
import Navbar from '../components/Navbar';
import { setInternalNav } from '../utils/navigation';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminQuizStats() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, quizData] = await Promise.all([
          getQuizDetailedStats(quizId),
          getQuizById(quizId)
        ]);
        setStats(statsData);
        setQuiz(quizData);
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId]);

  if (loading) return <div className="loading">Analyzing Data...</div>;
  if (error) return <div className="error">{error}</div>;

  const barData = {
    labels: stats.hardestQuestions.map(q => q.question.substring(0, 30) + (q.question.length > 30 ? '...' : '')),
    datasets: [
      {
        label: 'Error Rate (%)',
        data: stats.hardestQuestions.map(q => q.errorRate),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ['Pass Rate', 'Fail Rate'],
    datasets: [
      {
        data: [stats.passRate, 100 - stats.passRate],
        backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)'],
        borderColor: ['#10b981', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <Navbar />
      <div className="admin-stats-container">
        <div className="stats-header">
          <button className="btn-back" onClick={() => { setInternalNav(); navigate(-1); }}>← Back</button>
          <h1>Analytics for: {quiz?.title}</h1>
        </div>

        <div className="stats-overview-grid">
          <div className="stat-card glass">
            <h3>Total Attempts</h3>
            <p className="stat-value">{stats.totalAttempts}</p>
          </div>
          <div className="stat-card glass">
            <h3>Avg. Time</h3>
            <p className="stat-value">{stats.averageTime}s</p>
          </div>
          <div className="stat-card glass">
            <h3>Pass Rate</h3>
            <p className="stat-value">{stats.passRate}%</p>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-card glass">
            <h3>Performance Breakdown</h3>
            <div className="chart-wrapper">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="chart-card glass">
            <h3>Question Difficulty (Hardest)</h3>
            <div className="chart-wrapper">
              <Bar 
                data={barData} 
                options={{ 
                  indexAxis: 'y',
                  maintainAspectRatio: false,
                  scales: { x: { beginAtZero: true, max: 100 } }
                }} 
              />
            </div>
          </div>
        </div>

        <div className="hardest-questions-table glass">
          <h3>Question Performance Insights</h3>
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Total Responses</th>
                <th>Correct</th>
                <th>Error Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.hardestQuestions.map((q, idx) => (
                <tr key={idx}>
                  <td>{q.question}</td>
                  <td>{q.total}</td>
                  <td>{q.correct}</td>
                  <td className="error-text">{q.errorRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .admin-stats-container { padding: 40px; max-width: 1200px; margin: 0 auto; }
        .stats-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
        .stats-overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { padding: 25px; text-align: center; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2); }
        .stat-value { font-size: 2.5rem; font-weight: 800; color: #6366f1; margin: 10px 0 0; }
        .charts-section { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 30px; }
        .chart-card { padding: 25px; border-radius: 16px; min-height: 400px; display: flex; flex-direction: column; }
        .chart-wrapper { flex: 1; position: relative; }
        .hardest-questions-table { padding: 25px; border-radius: 16px; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { text-align: left; padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .error-text { color: #ef4444; font-weight: 700; }
        .glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); }
      `}</style>
    </div>
  );
}

export default AdminQuizStats;