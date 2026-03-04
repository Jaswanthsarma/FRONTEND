import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import apiService from '../services/api';
import './QuizResultsPage.css';

const QuizResultsPage = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  const isAutoSubmitted = location.state?.autoSubmitted;
  const isSubmitted = location.state?.submitted;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
      return;
    }

    const loadResults = async () => {
      try {
        setLoading(true);
        
        console.log('📊 Loading quiz results for attemptId:', attemptId);
        
        if (!attemptId || attemptId === 'undefined') {
          console.error('❌ Invalid attemptId:', attemptId);
          setError('Invalid attempt ID. Please try taking the quiz again.');
          setLoading(false);
          return;
        }

        const response = await apiService.getAttemptResults(attemptId);
        
        if (response.success) {
          console.log('✅ Results loaded successfully');
          setResults(response.data);
        } else {
          console.error('❌ Failed to load results:', response.message);
          setError(response.message || 'Failed to load quiz results');
        }
      } catch (err) {
        console.error('❌ Error loading results:', err);
        setError(err.message || 'Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [attemptId, navigate]);

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#16a34a'; // Green
    if (percentage >= 60) return '#d97706'; // Orange
    return '#dc2626'; // Red
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handleRetakeQuiz = () => {
    navigate(`/student/quizzes/${quizId}/attempt`);
  };

  const handleViewQuizzes = () => {
    navigate('/student/quizzes');
  };

  const handleViewMyAttempts = () => {
    navigate('/student/quizzes');
  };

  if (!user) return <div>Loading...</div>;

  if (loading) {
    return (
      <StudentLayout user={user}>
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <p style={{ fontSize: '1.125rem' }}>Loading results...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout user={user}>
        <div className="dashboard-content">
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Unable to Load Results
            </p>
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <button
              onClick={handleViewQuizzes}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!results) {
    return (
      <StudentLayout user={user}>
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <p>Results not found</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const { attempt, quiz, results: scoreResults, detailedResults } = results;
  const percentage = scoreResults.percentage || 0;
  const grade = getGrade(percentage);

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="results-container">
          {/* Results Header */}
          <div className="results-header">
            {isAutoSubmitted && (
              <div className="auto-submit-notice">
                ⏰ Quiz was automatically submitted due to time expiry
              </div>
            )}
            
            {isSubmitted && (
              <div className="submit-notice">
                ✅ Quiz submitted successfully
              </div>
            )}

            <div className="quiz-info">
              <h1 className="quiz-title">{quiz.title}</h1>
              <div className="quiz-meta">
                <span>Attempt #{attempt.attemptNumber}</span>
                <span>•</span>
                <span>{quiz.subject}</span>
                <span>•</span>
                <span>Completed on {new Date(attempt.endTime).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="score-summary">
            <div className="score-circle">
              <div 
                className="score-value" 
                style={{ color: getScoreColor(percentage) }}
              >
                {Math.round(percentage)}%
              </div>
              <div className="score-grade">{grade}</div>
            </div>
            
            <div className="score-details">
              <div className="score-item">
                <span className="score-label">Your Score:</span>
                <span className="score-number">
                  {scoreResults.score} / {quiz.totalMarks}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Time Taken:</span>
                <span className="score-number">
                  {formatTime(attempt.timeSpent)}
                </span>
              </div>
              <div className="score-item">
                <span className="score-label">Status:</span>
                <span className={`score-status ${attempt.status}`}>
                  {attempt.status === 'completed' ? 'Completed' : 
                   attempt.status === 'time-expired' ? 'Time Expired' : 
                   attempt.status}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="statistics-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{scoreResults.totalQuestions}</div>
              <div className="stat-label">Total Questions</div>
            </div>
            <div className="stat-card correct">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{scoreResults.correctAnswers}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-card incorrect">
              <div className="stat-icon">❌</div>
              <div className="stat-value">{scoreResults.incorrectAnswers}</div>
              <div className="stat-label">Incorrect</div>
            </div>
            <div className="stat-card unanswered">
              <div className="stat-icon">⏭️</div>
              <div className="stat-value">{scoreResults.unanswered}</div>
              <div className="stat-label">Unanswered</div>
            </div>
          </div>

          {/* Detailed Results */}
          {detailedResults && (
            <div className="detailed-results">
              <div className="detailed-header">
                <h3>Question Review</h3>
                <button 
                  className="toggle-details-btn"
                  onClick={() => setShowDetailedResults(!showDetailedResults)}
                >
                  {showDetailedResults ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetailedResults && (
                <div className="questions-review">
                  {detailedResults.map((question, index) => (
                    <div key={question.questionId} className="question-review">
                      <div className="question-review-header">
                        <div className="question-info">
                          <span className="question-num">Question {index + 1}</span>
                          <span className={`question-result ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                            {question.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                          </span>
                        </div>
                        <div className="question-score">
                          {question.earnedPoints} / {question.points} marks
                        </div>
                      </div>

                      <div className="question-text">
                        {question.questionText}
                      </div>

                      <div className="options-review">
                        {question.options.map((option, optionIndex) => (
                          <div 
                            key={optionIndex}
                            className={`option-review ${
                              optionIndex === question.correctOptionIndex ? 'correct-answer' : ''
                            } ${
                              optionIndex === question.userSelectedIndex ? 'user-answer' : ''
                            }`}
                          >
                            <span className="option-indicator">
                              {optionIndex === question.correctOptionIndex && '✅'}
                              {optionIndex === question.userSelectedIndex && 
                               optionIndex !== question.correctOptionIndex && '❌'}
                              {optionIndex !== question.correctOptionIndex && 
                               optionIndex !== question.userSelectedIndex && '⚪'}
                            </span>
                            <span className="option-text">{option}</span>
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="question-explanation">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="results-actions">
            <button className="action-btn secondary" onClick={handleViewQuizzes}>
              View All Quizzes
            </button>
            <button className="action-btn secondary" onClick={handleViewMyAttempts}>
              My Attempts
            </button>
            <button className="action-btn primary" onClick={handleRetakeQuiz}>
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default QuizResultsPage;