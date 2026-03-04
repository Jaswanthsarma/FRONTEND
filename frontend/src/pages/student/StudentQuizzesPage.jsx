import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import apiService from '../../services/api';

const StudentQuizzesPage = () => {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadQuizzes();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch quizzes from API - students will only see active quizzes
      const response = await apiService.getQuizzes();
      
      if (response.success) {
        console.log('Quizzes loaded:', response.data.quizzes);
        setQuizzes(response.data.quizzes || []);
      } else {
        setError('Failed to load quizzes');
      }
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;
    
    if (!quiz.isActive) return 'inactive';
    if (startDate && now < startDate) return 'upcoming';
    if (endDate && now > endDate) return 'expired';
    if (quiz.attemptCount >= quiz.allowedAttempts) return 'completed';
    return 'available';
  };

  const getStatusBadge = (status) => {
    const styles = {
      available: { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
      completed: { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' },
      expired: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
      upcoming: { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
      inactive: { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }
    };
    return styles[status] || { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' };
  };

  if (!user) return <div>Loading...</div>;

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Quizzes</h1>
          <p className="dashboard-subtitle">View and attempt quizzes created by your faculty</p>
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            Loading quizzes...
          </div>
        ) : quizzes.length === 0 ? (
          <div className="widget-card">
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No quizzes available</p>
              <p style={{ fontSize: '0.875rem' }}>
                {error ? error : 'Your faculty hasn\'t created any quizzes for your enrolled courses yet'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {quizzes.map(quiz => {
              const status = getQuizStatus(quiz);
              const canAttempt = status === 'available' && quiz.canAttempt;
              
              return (
                <div key={quiz.id} className="widget-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          {quiz.description}
                        </p>
                      )}
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        {quiz.course && (
                          <>Course: {quiz.course.code} - {quiz.course.title} | </>
                        )}
                        Subject: {quiz.subject} | Faculty: {quiz.createdBy?.name || quiz.createdBy?.firstName || quiz.createdBy?.username || 'Unknown'}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        Duration: {quiz.duration} minutes | Questions: {quiz.questionsCount} | Total Marks: {quiz.totalMarks}
                      </p>
                      {quiz.endDate && (
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          Available Until: {new Date(quiz.endDate).toLocaleDateString()} {new Date(quiz.endDate).toLocaleTimeString()}
                        </p>
                      )}
                      <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        Attempts: {quiz.attemptCount || 0}/{quiz.allowedAttempts}
                      </p>
                      {quiz.bestScore !== null && quiz.bestScore !== undefined && (
                        <p style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: '600', marginTop: '0.5rem' }}>
                          Best Score: {quiz.bestScore}/{quiz.totalMarks} ({quiz.bestPercentage?.toFixed(1)}%)
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <span style={{
                        ...getStatusBadge(status),
                        padding: '0.5rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      {canAttempt && (
                        <button 
                          onClick={() => navigate(`/student/quizzes/${quiz.id}/attempt`)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          {quiz.attemptCount > 0 ? 'Retry Quiz' : 'Start Quiz'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentQuizzesPage;
