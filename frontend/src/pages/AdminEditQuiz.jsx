import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getQuizById, updateQuiz } from '../services/api';
import { setInternalNav } from '../utils/navigation';
import './AdminCreateQuiz.css';

function AdminEditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const quiz = await getQuizById(quizId);
      setTitle(quiz.title || '');
      setDescription(quiz.description || '');
      setCategory(quiz.category || 'General');
      // Ensure questions have options array to prevent crashes
      const sanitizedQuestions = (quiz.questions || []).map(q => ({
        ...q,
        options: q.options || ['', '', ''],
        answer: q.answer || ''
      }));
      setQuestions(sanitizedQuestions);
    } catch (err) {
      setMessage(err.message || 'Failed to fetch quiz');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', ''], answer: '' }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = questions.map((q, i) => {
      if (i === qIndex) {
        const newOptions = [...q.options];
        newOptions[oIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuestions(newQuestions);
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage('Quiz title is required');
      return;
    }

    if (questions.length === 0) {
      setMessage('Add at least one question');
      return;
    }

    const allQuestionsValid = questions.every(q => 
      q.question.trim() && 
      q.options && q.options.every(o => o.trim()) && 
      q.answer.trim()
    );

    if (!allQuestionsValid) {
      setMessage('Please fill all question fields');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await updateQuiz(quizId, { title, description, category, questions });
      alert('Quiz updated successfully!');
      handleNav('/admin-dashboard');
    } catch (err) {
      setMessage(err.message || 'Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container glass">
          <div className="spinner"></div>
          <p>Analyzing Quiz Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="create-quiz-container">
        <div className="create-quiz-header">
          <h1>✏️ Edit Quiz</h1>
          <button 
            className="btn btn-secondary"
            onClick={() => { setInternalNav(); navigate(-1); }}
          >
            ← Back
          </button>
        </div>

        {message && (
          <div className={`alert ${message.includes('✨') || message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdateQuiz} className="quiz-form">
          <div className="form-section glass">
            <h2>Quiz Details</h2>
            
            <div className="form-group">
              <label>Quiz Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., JavaScript Mastery"
                className="glass"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your quiz..."
                className="glass"
                style={{ width: '100%', borderRadius: '12px', padding: '12px', border: '1px solid var(--border)', minHeight: '100px' }}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2>Questions ({questions.length})</h2>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addQuestion}
              >
                + Add Question
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="question-form glass animate-slide-up">
                <div className="question-header">
                  <h3>Question {qIndex + 1}</h3>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    🗑️
                  </button>
                </div>

                <div className="form-group">
                  <label>Question Text *</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="Enter question"
                    className="glass"
                  />
                </div>

                <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {(q.options || ['', '', '']).map((option, oIndex) => (
                    <div key={oIndex} className="form-group">
                      <label>Option {oIndex + 1}</label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="glass"
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label>Correct Answer *</label>
                  <select
                    value={q.answer}
                    onChange={(e) => updateQuestion(qIndex, 'answer', e.target.value)}
                    className="glass"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
                  >
                    <option value="">Select correct answer</option>
                    {(q.options || []).map((option, idx) => (
                      <option key={idx} value={option}>
                        {option || `Type Option ${idx + 1} first`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={saving}
              className="btn btn-primary btn-large btn-glow"
            >
              {saving ? '🔄 Updating...' : '✨ Update Quiz'}
            </button>
            <button 
              type="button"
              onClick={() => { setInternalNav(); navigate(-1); }}
              className="btn btn-secondary btn-large"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEditQuiz;