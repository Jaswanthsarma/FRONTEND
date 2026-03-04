import React from 'react';
import './QuizCard.css';

const QuizCard = ({ quiz, userRole, onStartQuiz, onViewQuiz, onEditQuiz, onDeleteQuiz }) => {
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No end date';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = () => {
    if (!quiz.isActive) {
      return <span className="status-badge inactive">Inactive</span>;
    }

    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;

    if (startDate > now) {
      return <span className="status-badge upcoming">Upcoming</span>;
    }

    if (endDate && endDate < now) {
      return <span className="status-badge ended">Ended</span>;
    }

    return <span className="status-badge active">Active</span>;
  };

  const canTakeQuiz = () => {
    if (userRole !== 'student') return false;
    if (!quiz.isActive) return false;
    
    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;
    
    if (startDate > now || (endDate && endDate < now)) return false;
    
    return quiz.canAttempt;
  };

  return (
    <div className="quiz-card">
      <div className="quiz-card-header">
        <div className="quiz-title-section">
          <h3 className="quiz-title">{quiz.title}</h3>
          {getStatusBadge()}
        </div>
        <div className="quiz-subject">{quiz.subject}</div>
      </div>

      <div className="quiz-card-body">
        {quiz.description && (
          <p className="quiz-description">{quiz.description}</p>
        )}

        <div className="quiz-details">
          <div className="quiz-detail">
            <span className="detail-icon">⏱️</span>
            <span className="detail-text">{formatDuration(quiz.duration)}</span>
          </div>
          <div className="quiz-detail">
            <span className="detail-icon">📝</span>
            <span className="detail-text">{quiz.questionsCount} questions</span>
          </div>
          <div className="quiz-detail">
            <span className="detail-icon">🎯</span>
            <span className="detail-text">{quiz.totalMarks} marks</span>
          </div>
          <div className="quiz-detail">
            <span className="detail-icon">🔄</span>
            <span className="detail-text">{quiz.allowedAttempts} attempts</span>
          </div>
        </div>

        {quiz.endDate && (
          <div className="quiz-dates">
            <div className="quiz-date">
              <span className="date-label">Ends:</span>
              <span className="date-value">{formatDate(quiz.endDate)}</span>
            </div>
          </div>
        )}

        {userRole === 'student' && (
          <div className="student-progress">
            <div className="progress-item">
              <span className="progress-label">Attempts used:</span>
              <span className="progress-value">
                {quiz.attemptCount || 0} / {quiz.allowedAttempts}
              </span>
            </div>
            {quiz.bestScore !== null && (
              <div className="progress-item">
                <span className="progress-label">Best score:</span>
                <span className="progress-value">
                  {quiz.bestScore} / {quiz.totalMarks} ({quiz.bestPercentage}%)
                </span>
              </div>
            )}
          </div>
        )}

        {(userRole === 'faculty' || userRole === 'admin') && quiz.createdBy && (
          <div className="quiz-creator">
            <span className="creator-label">Created by:</span>
            <span className="creator-name">
              {quiz.createdBy.firstName} {quiz.createdBy.lastName}
            </span>
          </div>
        )}
      </div>

      <div className="quiz-card-actions">
        {userRole === 'student' && (
          <>
            {canTakeQuiz() ? (
              <button 
                className="quiz-action-btn primary"
                onClick={() => onStartQuiz(quiz.id)}
              >
                {quiz.attemptCount > 0 ? 'Retake Quiz' : 'Start Quiz'}
              </button>
            ) : (
              <button className="quiz-action-btn disabled" disabled>
                {!quiz.canAttempt ? 'No attempts left' : 'Not available'}
              </button>
            )}
            <button 
              className="quiz-action-btn secondary"
              onClick={() => onViewQuiz(quiz.id)}
            >
              View Details
            </button>
          </>
        )}

        {userRole === 'faculty' && (
          <>
            <button 
              className="quiz-action-btn primary"
              onClick={() => onViewQuiz(quiz.id)}
            >
              View Quiz
            </button>
            <button 
              className="quiz-action-btn secondary"
              onClick={() => onEditQuiz(quiz.id)}
            >
              Edit
            </button>
            <button 
              className="quiz-action-btn danger"
              onClick={() => onDeleteQuiz(quiz.id)}
            >
              Delete
            </button>
          </>
        )}

        {userRole === 'admin' && (
          <button 
            className="quiz-action-btn primary"
            onClick={() => onViewQuiz(quiz.id)}
          >
            View Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizCard;