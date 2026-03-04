import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import apiService from '../services/api';
import './MyAttemptsPage.css';

const MyAttemptsPage = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        setLoading(true);
        
        // Check authentication
        if (!apiService.isAuthenticated()) {
          navigate('/');
          return;
        }

        const currentUser = apiService.getCurrentUser();
        if (currentUser.role !== 'student') {
          navigate(`/dashboard/${currentUser.role}`);
          return;
        }

        setUser(currentUser);

        const response = await apiService.getMyAttempts();
        
        if (response.success) {
          setAttempts(response.data.attempts);
        }
      } catch (err) {
        setError(err.message || 'Failed to load attempts');
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, [navigate]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', class: 'completed' },
      'time-expired': { label: 'Time Expired', class: 'expired' },
      'in-progress': { label: 'In Progress', class: 'progress' },
      abandoned: { label: 'Abandoned', class: 'abandoned' }
    };

    const config = statusConfig[status] || { label: status, class: 'default' };
    
    return (
      <span className={`status-badge ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#16a34a'; // Green
    if (percentage >= 60) return '#d97706'; // Orange
    return '#dc2626'; // Red
  };

  const handleViewResults = (quizId, attemptId) => {
    navigate(`/quiz/${quizId}/results/${attemptId}`);
  };

  const handleRetakeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}/start`);
  };

  const handleBackToDashboard = () => {
    navigate(`/dashboard/${user?.role}`);
  };

  const handleViewQuizzes = () => {
    navigate('/quizzes');
  };

  if (loading) {
    return (
      <div className="my-attempts-page">
        <Header />
        <main className="my-attempts-main">
          <div className="my-attempts-container">
            <div className="loading-message">Loading your attempts...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="my-attempts-page">
      <Header />
      <main className="my-attempts-main">
        <div className="my-attempts-container">
          <div className="page-header">
            <div className="header-content">
              <h1 className="page-title">My Quiz Attempts</h1>
              <p className="page-description">
                View your quiz history and results
              </p>
            </div>
            <div className="header-actions">
              <button className="action-btn secondary" onClick={handleViewQuizzes}>
                Browse Quizzes
              </button>
              <button className="action-btn primary" onClick={handleBackToDashboard}>
                Back to Dashboard
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="attempts-content">
            {attempts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3 className="empty-title">No quiz attempts yet</h3>
                <p className="empty-description">
                  You haven't taken any quizzes yet. Start by browsing available quizzes.
                </p>
                <button className="action-btn primary" onClick={handleViewQuizzes}>
                  Browse Available Quizzes
                </button>
              </div>
            ) : (
              <div className="attempts-list">
                {attempts.map(attempt => (
                  <div key={attempt.id} className="attempt-card">
                    <div className="attempt-header">
                      <div className="quiz-info">
                        <h3 className="quiz-title">{attempt.quiz.title}</h3>
                        <div className="quiz-meta">
                          <span className="quiz-subject">{attempt.quiz.subject}</span>
                          <span>•</span>
                          <span>Attempt #{attempt.attemptNumber}</span>
                          <span>•</span>
                          <span>{new Date(attempt.startTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="attempt-status">
                        {getStatusBadge(attempt.status)}
                      </div>
                    </div>

                    <div className="attempt-details">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Score:</span>
                          <span className="detail-value">
                            {attempt.score} / {attempt.quiz.totalMarks}
                          </span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Percentage:</span>
                          <span 
                            className="detail-value percentage"
                            style={{ color: getScoreColor(attempt.percentage) }}
                          >
                            {Math.round(attempt.percentage)}%
                          </span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Time Taken:</span>
                          <span className="detail-value">
                            {formatTime(attempt.timeSpent)}
                          </span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Duration:</span>
                          <span className="detail-value">
                            {attempt.quiz.duration} minutes
                          </span>
                        </div>
                      </div>

                      {attempt.status === 'completed' || attempt.status === 'time-expired' ? (
                        <div className="attempt-actions">
                          <button 
                            className="action-btn secondary"
                            onClick={() => handleViewResults(attempt.quiz.id, attempt.id)}
                          >
                            View Results
                          </button>
                          <button 
                            className="action-btn primary"
                            onClick={() => handleRetakeQuiz(attempt.quiz.id)}
                          >
                            Retake Quiz
                          </button>
                        </div>
                      ) : (
                        <div className="attempt-actions">
                          <button 
                            className="action-btn primary"
                            onClick={() => handleRetakeQuiz(attempt.quiz.id)}
                          >
                            Continue Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyAttemptsPage;