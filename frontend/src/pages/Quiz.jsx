import React, { useState } from 'react';
import { attemptQuiz } from '../services/api';

function Quiz() {
  const [quizId, setQuizId] = useState('');
  const [answers, setAnswers] = useState([]);

  const handleAttempt = async () => {
    const data = await attemptQuiz({ quizId, answers });
    if (data.score !== undefined) {
      alert(`Quiz: ${data.quizId}\nUser: ${data.user}\nScore: ${data.score}`);
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <h2>Attempt Quiz</h2>
      <input type="text" placeholder="Quiz ID" value={quizId} onChange={e => setQuizId(e.target.value)} />
      <input type="text" placeholder="Answers (comma separated)" 
             onChange={e => setAnswers(e.target.value.split(','))} />
      <button onClick={handleAttempt}>Submit Attempt</button>
    </div>
  );
}

export default Quiz;
