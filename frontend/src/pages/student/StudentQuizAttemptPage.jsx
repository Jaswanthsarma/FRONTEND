import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import apiService from '../../services/api';

const StudentQuizAttemptPage = () => {
  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { quizId } = useParams();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadQuiz();
    } else {
      navigate('/login');
    }
  }, [navigate, quizId]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quiz && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, submitted]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 QUIZ ATTEMPT - LOADING QUIZ');
      console.log('🔍 Quiz ID:', quizId);
      
      if (!quizId) {
        console.error('❌ Quiz ID is missing!');
        setError('Quiz ID is missing from the URL');
        setLoading(false);
        return;
      }
      
      console.log('📡 Calling API: getQuizById');
      const response = await apiService.getQuizById(quizId);
      console.log('📡 API Response:', response);
      
      if (response.success && response.data && response.data.quiz) {
        const quizData = response.data.quiz;
        console.log('✅ Quiz loaded:', quizData.title);
        console.log('📝 Questions:', quizData.questions?.length || 0);
        
        if (!quizData.questions || quizData.questions.length === 0) {
          console.error('❌ Quiz has no questions!');
          setError('This quiz has no questions. Please contact your instructor.');
          setLoading(false);
          return;
        }
        
        if (quizData.canAttempt === false) {
          console.warn('⚠️ Student cannot attempt - used all attempts');
          setError(`You have used all your attempts for this quiz (${quizData.attemptCount}/${quizData.allowedAttempts})`);
          setLoading(false);
          return;
        }
        
        setQuiz(quizData);
        setTimeLeft(quizData.duration * 60);
        console.log('✅ Quiz state set successfully');
      } else {
        console.error('❌ API returned error');
        console.error('❌ Message:', response.message);
        setError(response.message || 'Failed to load quiz');
      }
    } catch (err) {
      console.error('❌ ERROR LOADING QUIZ:', err);
      setError(err.message || 'Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleSubmit = async () => {
    if (submitted) {
      console.log('⚠️ Already submitting, please wait...');
      return;
    }
    
    setSubmitted(true);
    
    try {
      console.log('📤 ========================================');
      console.log('📤 STARTING QUIZ SUBMISSION');
      console.log('📤 Quiz ID:', quizId);
      console.log('📤 Answers:', answers);
      console.log('📤 ========================================');
      
      // First, create a quiz attempt
      console.log('📤 Step 1: Creating quiz attempt...');
      const startResponse = await apiService.startQuizAttempt(quizId);
      console.log('📤 Start response:', startResponse);
      
      if (!startResponse.success) {
        console.error('❌ Failed to start quiz attempt:', startResponse.message);
        setError(startResponse.message || 'Failed to start quiz attempt');
        setSubmitted(false);
        return;
      }
      
      const attemptId = startResponse.data.attempt.id;
      console.log('✅ Quiz attempt created with ID:', attemptId);
      
      // Submit answers for each question
      console.log('📤 Step 2: Submitting answers for', quiz.questions.length, 'questions...');
      for (const question of quiz.questions) {
        if (answers[question.id] !== undefined) {
          console.log('  - Submitting answer for question:', question.id, 'Answer:', answers[question.id]);
          try {
            await apiService.submitAnswer(attemptId, {
              questionId: question.id,
              selectedOptionIndex: answers[question.id],
              timeSpent: 0
            });
            console.log('  ✅ Answer submitted for question:', question.id);
          } catch (answerError) {
            console.error('  ❌ Error submitting answer for question:', question.id, answerError);
          }
        } else {
          console.log('  ⚠️ No answer for question:', question.id);
        }
      }
      
      // Finally, submit the quiz attempt
      console.log('📤 Step 3: Submitting quiz attempt...');
      const submitResponse = await apiService.submitQuizAttempt(attemptId);
      console.log('📤 Submit response:', submitResponse);
      
      if (submitResponse.success) {
        console.log('✅ Quiz submitted successfully!');
        const resultAttemptId = submitResponse.data.attempt.id || submitResponse.data.attempt._id || attemptId;
        console.log('📊 Result attempt ID:', resultAttemptId);
        
        navigate(`/student/quizzes/${quizId}/results/${resultAttemptId}`, { 
          state: { 
            score: submitResponse.data.results?.score || submitResponse.data.score,
            totalMarks: quiz.totalMarks,
            submitted: true
          }
        });
      } else {
        console.error('❌ Submit failed:', submitResponse.message);
        setError(submitResponse.message || 'Failed to submit quiz');
        setSubmitted(false);
      }
    } catch (err) {
      console.error('❌ ========================================');
      console.error('❌ ERROR SUBMITTING QUIZ');
      console.error('❌ Error:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      console.error('❌ ========================================');
      setError(err.message || 'Failed to submit quiz');
      setSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) return <div>Loading user...</div>;
  
  if (loading) {
    return (
      <StudentLayout user={user}>
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <p style={{ fontSize: '1.125rem' }}>Loading quiz...</p>
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
              Unable to Load Quiz
            </p>
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <button
              onClick={() => navigate('/student/quizzes')}
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
  
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <StudentLayout user={user}>
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <p>Quiz data not available</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const currentQ = quiz.questions[currentQuestion];

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              {quiz.title}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              {quiz.course && `${quiz.course.code} - ${quiz.course.title} | `}
              Faculty: {quiz.createdBy?.name || 'Unknown'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: timeLeft < 300 ? '#ef4444' : '#3b82f6',
              marginBottom: '0.25rem'
            }}>
              {formatTime(timeLeft)}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Time Remaining</p>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              transition: 'width 0.3s'
            }}></div>
          </div>
        </div>

        <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
          <div className="widget-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>
                {currentQ.points} {currentQ.points === 1 ? 'mark' : 'marks'}
              </span>
            </div>

            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              {currentQ.questionText}
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQ.id, index)}
                  style={{
                    padding: '1rem',
                    border: `2px solid ${answers[currentQ.id] === index ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '0.5rem',
                    backgroundColor: answers[currentQ.id] === index ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '1rem',
                    color: '#374151',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (answers[currentQ.id] !== index) {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (answers[currentQ.id] !== index) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  <span style={{ fontWeight: '600', marginRight: '0.75rem' }}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: currentQuestion === 0 ? '#f1f5f9' : 'white',
              color: currentQuestion === 0 ? '#94a3b8' : '#374151',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            ← Previous
          </button>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {currentQuestion < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitted}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: submitted ? '#9ca3af' : '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: submitted ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {submitted ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>

        <div className="widget-card" style={{ marginTop: '1.5rem' }}>
          <div className="widget-header">
            <h3 className="widget-title">Question Navigator</h3>
          </div>
          <div className="widget-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '0.5rem' }}>
              {quiz.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  style={{
                    padding: '0.75rem',
                    border: `2px solid ${currentQuestion === index ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '0.5rem',
                    backgroundColor: answers[q.id] !== undefined ? '#dcfce7' : currentQuestion === index ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '0.25rem' }}></div>
                <span>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }}></div>
                <span>Not Answered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentQuizAttemptPage;
