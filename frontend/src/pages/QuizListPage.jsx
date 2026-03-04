import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import QuizCard from '../components/QuizCard';
import apiService from '../services/api';
import './QuizListPage.css';

const QuizListPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    isActive: ''
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication
    if (!apiService.isAuthenticated()) {
      navigate('/');
      return;
    }

    const currentUser = apiService.getCurrentUser();
    setUser(currentUser);
    loadQuizzes();
  }, [navigate]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQuizzes(filters);
      
      if (response.success) {
        setQuizzes(response.data.quizzes);
      }
    } catch (err) {
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    loadQuizzes();
  };

  const handleClearFilters = () => {
    setFilters({
      subject: '',
      isActive: ''
    });
    setTimeout(() => loadQuizzes(), 100);
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}/start`);
  };

  const handleViewQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/quiz/${quizId}/edit`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiService.deleteQuiz(quizId);
      if (response.success) {
        setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete quiz');
    }
  };

  const handleCreateQuiz = () => {
    navigate('/quiz/create');
  };

  const handleBackToDashboard = () => {
    navigate(`/dashboard/${user?.role}`);
  };

  if (loading) {
    return (
      <div className="quiz-list-page">
        <Header />
        <main className="quiz-list-main">
          <div className="quiz-list-container">
            <div className="loading-message">Loading quizzes...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="quiz-list-page">
      <Header />
      <main className="quiz-list-main">
        <div className="quiz-list-container">
          <div className="quiz-list-header">
            <div className="header-content">
              <h1 className="page-title">
                {user?.role === 'student' ? 'Available Quizzes' : 
                 user?.role === 'faculty' ? 'My Quizzes' : 'All Quizzes'}
              </h1>
              <p className="page-description">
                {user?.role === 'student' ? 'Take quizzes and track your progress' :
                 user?.role === 'faculty' ? 'Manage your quizzes and view student performance' :
                 'System overview of all quizzes'}
              </p>
            </div>
            <div className="header-actions">
              {user?.role === 'faculty' && (
                <button className="create-quiz-btn" onClick={handleCreateQuiz}>
                  Create New Quiz
                </button>
              )}
              <button className="back-btn" onClick={handleBackToDashboard}>
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="quiz-filters">
            <div className="filter-group">
              <label htmlFor="subject" className="filter-label">Subject:</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                placeholder="Filter by subject..."
                className="filter-input"
              />
            </div>
            
            {user?.role !== 'student' && (
              <div className="filter-group">
                <label htmlFor="isActive" className="filter-label">Status:</label>
                <select
                  id="isActive"
                  name="isActive"
                  value={filters.isActive}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}

            <div className="filter-actions">
              <button className="filter-btn apply" onClick={handleApplyFilters}>
                Apply Filters
              </button>
              <button className="filter-btn clear" onClick={handleClearFilters}>
                Clear
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="quiz-list-content">
            {quizzes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3 className="empty-title">No quizzes found</h3>
                <p className="empty-description">
                  {user?.role === 'faculty' 
                    ? 'Create your first quiz to get started!'
                    : 'No quizzes are currently available.'}
                </p>
                {user?.role === 'faculty' && (
                  <button className="create-quiz-btn" onClick={handleCreateQuiz}>
                    Create Your First Quiz
                  </button>
                )}
              </div>
            ) : (
              <div className="quiz-grid">
                {quizzes.map(quiz => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    userRole={user?.role}
                    onStartQuiz={handleStartQuiz}
                    onViewQuiz={handleViewQuiz}
                    onEditQuiz={handleEditQuiz}
                    onDeleteQuiz={handleDeleteQuiz}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizListPage;