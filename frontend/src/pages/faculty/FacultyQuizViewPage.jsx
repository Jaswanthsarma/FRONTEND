import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const FacultyQuizViewPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const user = apiService.getCurrentUser();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQuizById(quizId);
      
      if (response.success) {
        setQuiz(response.data.quiz);
      } else {
        setError('Failed to load quiz');
      }
    } catch (err) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      return;
    }

    try {
      const response = await apiService.deleteQuiz(quizId);
      
      if (response.success) {
        alert('Quiz deleted successfully');
        navigate('/faculty/quizzes');
      } else {
        alert(response.message || 'Failed to delete quiz');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete quiz');
    }
  };

  if (loading) {
    return (
      <FacultyLayout user={user}>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading quiz...
        </div>
      </FacultyLayout>
    );
  }

  if (error || !quiz) {
    return (
      <FacultyLayout user={user}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error || 'Quiz not found'}</p>
          <button
            onClick={() => navigate('/faculty/quizzes')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Back to Quizzes
          </button>
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
            {quiz.title}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Quiz Details and Questions</p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate(`/quiz/edit/${quizId}`)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Edit Quiz
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Delete Quiz
          </button>
        </div>

        {/* Quiz Information */}
        <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
          <div className="widget-header">
            <h3 className="widget-title">Quiz Information</h3>
          </div>
          <div className="widget-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Course</p>
                <p style={{ fontWeight: '600' }}>
                  {quiz.course ? `${quiz.course.code} - ${quiz.course.title}` : 'No course assigned'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Subject</p>
                <p style={{ fontWeight: '600' }}>{quiz.subject}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Duration</p>
                <p style={{ fontWeight: '600' }}>{quiz.duration} minutes</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Marks</p>
                <p style={{ fontWeight: '600' }}>{quiz.totalMarks}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Questions</p>
                <p style={{ fontWeight: '600' }}>{quiz.questionsCount}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Status</p>
                <p style={{ fontWeight: '600', color: quiz.isActive ? '#22c55e' : '#ef4444' }}>
                  {quiz.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            {quiz.description && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Description</p>
                <p>{quiz.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Questions ({quiz.questions?.length || 0})</h3>
          </div>
          <div className="widget-content">
            {quiz.questions && quiz.questions.length > 0 ? (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {quiz.questions.map((question, index) => (
                  <div
                    key={question._id || index}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                        Question {index + 1}
                      </h4>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {question.points} {question.points === 1 ? 'mark' : 'marks'}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '1rem', lineHeight: '1.6' }}>
                      {question.questionText}
                    </p>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: option.isCorrect ? '#dcfce7' : 'white',
                            border: `2px solid ${option.isCorrect ? '#22c55e' : '#e2e8f0'}`,
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}
                        >
                          <span style={{ fontWeight: '600', color: '#64748b' }}>
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span style={{ flex: 1 }}>{option.text}</span>
                          {option.isCorrect && (
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#22c55e',
                              color: 'white',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: '#fef3c7',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}>
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                No questions found in this quiz
              </p>
            )}
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultyQuizViewPage;
