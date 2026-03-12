import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { createQuiz, generateAIQuiz } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { setInternalNav } from '../utils/navigation';
import './AdminCreateQuiz.css';

function AdminCreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', ''], answer: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleNav = (path) => {
    setInternalNav();
    navigate(path);
  };

  const handleAiGenerate = async () => {
    if (!topic.trim()) {
      setMessage('Please enter a topic for AI generation');
      return;
    }
    setAiLoading(true);
    setMessage('');
    try {
      const data = await generateAIQuiz(topic, numQuestions);
      setQuestions(data.questions);
      setMessage('✨ AI has generated the questions! You can now review and edit them below.');
    } catch (err) {
      setMessage(err.message || 'AI Generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', ''], answer: '' }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage('Quiz title is required');
      return;
    }

    const allQuestionsValid = questions.every(q => 
      q.question.trim() && 
      q.options.every(o => o.trim()) && 
      q.answer.trim()
    );

    if (!allQuestionsValid) {
      setMessage('Please fill all question fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await createQuiz({ 
        title, 
        description, 
        questions,
        category: topic || 'General' 
      });
      alert('Quiz created successfully!');
      handleNav('/admin-dashboard');
    } catch (err) {
      setMessage(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="create-quiz-container">
        <div className="create-quiz-header">
          <h1>✨ Create New Quiz</h1>
          <button className="btn btn-secondary" onClick={() => { setInternalNav(); navigate(-1); }}>
            ← Back
          </button>
        </div>

        {message && (
          <div className={`alert ${message.includes('Success') || message.includes('✨') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="quiz-form">
          {/* AI Generator Panel */}
          <div className="form-section ai-panel glass" style={{ border: '2px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.05)' }}>
            <h2 style={{ color: '#8b5cf6' }}>🚀 AI Smart Generation</h2>
            <p>Enter a topic and let AI draft the questions for you!</p>
            <div className="ai-controls-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Topic</label>
                <input 
                  type="text" 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Science, Maths, JavaScript..."
                  className="glass"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Num. Questions</label>
                <input 
                  type="number" 
                  value={numQuestions} 
                  onChange={(e) => setNumQuestions(e.target.value)}
                  min="1" max="20"
                  className="glass"
                />
              </div>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleAiGenerate}
                disabled={aiLoading}
                style={{ alignSelf: 'flex-end', height: '45px', background: '#8b5cf6', border: 'none' }}
              >
                {aiLoading ? 'Thinking...' : 'Done ✨'}
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateQuiz}>
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
                  style={{ width: '100%', borderRadius: '12px', padding: '12px', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h2>Questions ({questions.length})</h2>
                <button type="button" className="btn btn-secondary" onClick={addQuestion}>
                  + Add Question
                </button>
              </div>

              {questions.map((q, qIndex) => (
                <div key={qIndex} className="question-form glass animate-slide-up">
                  <div className="question-header">
                    <h3>Question {qIndex + 1}</h3>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qIndex)}>
                      🗑️
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Question Text</label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Enter question"
                      className="glass"
                    />
                  </div>

                  <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {q.options.map((option, oIndex) => (
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
                    <label>Correct Answer</label>
                    <select
                      value={q.answer}
                      onChange={(e) => updateQuestion(qIndex, 'answer', e.target.value)}
                      className="glass"
                      style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
                    >
                      <option value="">Select Correct Option</option>
                      {q.options.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt || `Type Option ${idx+1} first`}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-large btn-glow" disabled={loading}>
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
              <button type="button" className="btn btn-secondary btn-large" onClick={() => { setInternalNav(); navigate(-1); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminCreateQuiz;