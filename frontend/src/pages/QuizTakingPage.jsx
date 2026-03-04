import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import apiService from '../services/api';
import './QuizTakingPage.css';

const QuizTakingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Auto-submit when time expires
  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmitted || submitting) return;
    
    setAutoSubmitted(true);
    setSubmitting(true);
    
    try {
      await apiService.submitQuizAttempt(attempt.id);
      navigate(`/quiz/${quizId}/results/${attempt.id}`, {
        state: { autoSubmitted: true }
      });
    } catch (err) {
      console.error('Auto-submit error:', err);
      setError('Failed to auto-submit quiz. Please try submitting manually.');
      setSubmitting(false);
    }
  }, [attempt?.id, quizId, navigate, autoSubmitted, submitting]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || !attempt) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          handleAutoSubmit();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, attempt, handleAutoSubmit]);

  // Load quiz attempt
  useEffect(() => {
    const loadQuizAttempt = async () => {
      try {
        setLoading(true);
        
        // Check authentication
        if (!apiService.isAuthenticated()) {
          navigate('/');
          return;
        }

        const user = apiService.getCurrentUser();
        if (user.role !== 'student') {
          navigate(`/dashboard/${user.role}`);
          return;
        }

        // Start or resume quiz attempt
        const attemptResponse = await apiService.startQuizAttempt(quizId);
        
        if (attemptResponse.success) {
          const attemptData = attemptResponse.data.attempt;
          const quizData = attemptResponse.data.quiz;
          
          setAttempt(attemptData);
          setQuiz(quizData);
          setTimeRemaining(attemptData.remainingTime);

          // Load questions
          const questionsResponse = await apiService.getQuizQuestions(attemptData.id);
          
          if (questionsResponse.success) {
            setQuestions(questionsResponse.data.questions);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuizAttempt();
  }, [quizId, navigate]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (questionId, optionIndex) => {
    if (submitting || autoSubmitted) return;

    // Update local state
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));

    // Submit answer to backend
    try {
      await apiService.submitAnswer(attempt.id, {
        questionId,
        selectedOptionIndex: optionIndex,
        timeSpent: 0 // Could track time per question
      });
    } catch (err) {
      console.error('Error submitting answer:', err);
      // Don't show error to user for individual answer submissions
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    if (submitting || autoSubmitted) return;

    const confirmSubmit = window.confirm(
      'Are you sure you want to submit your quiz? You cannot change your answers after submission.'
    );

    if (!confirmSubmit) return;

    setSubmitting(true);

    try {
      const response = await apiService.submitQuizAttempt(attempt.id);
      
      if (response.success) {
        navigate(`/quiz/${quizId}/results/${attempt.id}`, {
          state: { submitted: true }
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const handleExitQuiz = () => {
    const confirmExit = window.confirm(
      'Are you sure you want to exit? Your progress will be saved and you can resume later.'
    );

    if (confirmExit) {
      navigate('/quizzes');
    }
  };

  if (loading) {
    return (
      <div className="quiz-taking-page">
        <Header />
        <main className="quiz-taking-main">
          <div className="loading-message">Loading quiz...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-taking-page">
        <Header />
        <main className="quiz-taking-main">
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button className="back-btn" onClick={() => navigate('/quizzes')}>
              Back to Quizzes
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!quiz || !questions.length) {
    return (
      <div className="quiz-taking-page">
        <Header />
        <main className="quiz-taking-main">
          <div className="error-message">Quiz not found or no questions available</div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  return (
    <div className="quiz-taking-page">
      <Header />
      
      {/* Quiz Header */}
      <div className="quiz-header">
        <div className="quiz-header-content">
          <div className="quiz-info">
            <h1 className="quiz-title">{quiz.title}</h1>
            <div className="quiz-meta">
              <span className="quiz-questions">{questions.length} Questions</span>
              <span className="quiz-marks">{quiz.totalMarks} Marks</span>
              <span className="quiz-attempt">Attempt #{attempt.attemptNumber}</span>
            </div>
          </div>
          
          <div className="quiz-timer">
            <div className={`timer ${timeRemaining <= 300 ? 'warning' : ''} ${timeRemaining <= 60 ? 'critical' : ''}`}>
              <span className="timer-icon">⏰</span>
              <span className="timer-text">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>
        
        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {answeredCount} of {questions.length} answered
          </div>
        </div>
      </div>

      <main className="quiz-taking-main">
        <div className="quiz-container">
          {/* Question Navigation */}
          <div className="question-navigation">
            <h3 className="nav-title">Questions</h3>
            <div className="question-grid">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  className={`question-nav-btn ${
                    index === currentQuestionIndex ? 'current' : ''
                  } ${answers[question.id] !== undefined ? 'answered' : ''}`}
                  onClick={() => handleQuestionJump(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="nav-actions">
              <button className="exit-btn" onClick={handleExitQuiz}>
                Exit Quiz
              </button>
              <button 
                className="submit-btn"
                onClick={handleSubmitQuiz}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="question-content">
            <div className="question-header">
              <div className="question-number">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="question-points">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'mark' : 'marks'}
              </div>
            </div>

            <div className="question-text">
              {currentQuestion.questionText}
            </div>

            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`option-label ${
                    answers[currentQuestion.id] === index ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={answers[currentQuestion.id] === index}
                    onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                    className="option-input"
                  />
                  <span className="option-text">{option.text}</span>
                </label>
              ))}
            </div>

            <div className="question-navigation-controls">
              <button
                className="nav-control-btn"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                ← Previous
              </button>
              
              <span className="question-indicator">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
              
              <button
                className="nav-control-btn"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizTakingPage;