import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const FacultyQuizzesPage = () => {
  const user = apiService.getCurrentUser();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📚 Loading faculty quizzes...');
      
      // Fetch quizzes created by this faculty
      const response = await apiService.getQuizzes();
      
      if (response.success) {
        console.log('✅ Loaded', response.data.quizzes.length, 'quizzes');
        console.log('📋 First quiz data:', response.data.quizzes[0]);
        setQuizzes(response.data.quizzes || []);
      } else {
        setError('Failed to load quizzes');
      }
    } catch (err) {
      console.error('❌ Error loading quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuiz = (quiz) => {
    const quizId = quiz._id || quiz.id;
    console.log('📖 Viewing quiz:', quizId, 'Quiz object:', quiz);
    if (!quizId) {
      alert('Error: Quiz ID is missing');
      return;
    }
    navigate(`/faculty/quizzes/${quizId}`);
  };

  const handleDeleteQuiz = async (quiz, quizTitle) => {
    const quizId = quiz._id || quiz.id;
    if (!quizId) {
      alert('Error: Quiz ID is missing');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${quizTitle}"?`)) {
      return;
    }

    try {
      const response = await apiService.deleteQuiz(quizId);
      
      if (response.success) {
        alert('Quiz deleted successfully');
        loadQuizzes(); // Reload list
      } else {
        alert(response.message || 'Failed to delete quiz');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete quiz');
    }
  };

  const handleToggleActive = async (quizId, currentStatus) => {
    try {
      const response = await apiService.updateQuiz(quizId, {
        isActive: !currentStatus
      });
      
      if (response.success) {
        loadQuizzes(); // Reload list
      } else {
        alert(response.message || 'Failed to update quiz');
      }
    } catch (err) {
      alert(err.message || 'Failed to update quiz status');
    }
  };

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">My Quizzes</h1>
          <p className="dashboard-subtitle">Manage quizzes for your courses</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}
        
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Quiz List</h3>
            <button 
              className="widget-action"
              onClick={() => navigate('/quiz/create')}
              style={{
                background: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              + Create New Quiz
            </button>
          </div>
          <div className="widget-content">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                Loading quizzes...
              </div>
            ) : quizzes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No quizzes created yet</p>
                <p style={{ fontSize: '0.875rem' }}>Click "Create New Quiz" to get started</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id || quiz.id}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                          {quiz.title}
                        </h4>
                        {quiz.description && (
                          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            {quiz.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b', marginTop: '0.75rem' }}>
                          <span>
                            📚 {quiz.course ? `${quiz.course.code} - ${quiz.course.title}` : 'No course'}
                          </span>
                          <span>📝 {quiz.questionsCount} questions</span>
                          <span>⏱️ {quiz.duration} min</span>
                          <span>📊 {quiz.totalMarks} marks</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: quiz.isActive ? '#dcfce7' : '#fee2e2',
                          color: quiz.isActive ? '#166534' : '#991b1b',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        onClick={() => handleViewQuiz(quiz)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        View Quiz
                      </button>
                      <button
                        onClick={() => navigate(`/quiz/edit/${quiz._id || quiz.id}`)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#64748b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz, quiz.title)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultyQuizzesPage;
