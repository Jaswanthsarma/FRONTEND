import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';

const StudentFeedbackViewPage = () => {
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();
  const { assignmentId } = useParams();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadFeedback();
    } else {
      navigate('/login');
    }
  }, [navigate, assignmentId]);

  const loadFeedback = () => {
    // Sample feedback data
    setFeedback({
      assignmentTitle: 'OS Assignment 2',
      course: 'CS202',
      submittedAt: '2026-02-10T14:20:00',
      gradedAt: '2026-02-12T09:15:00',
      marks: 92,
      maxMarks: 100,
      feedback: `
Excellent work! Your implementation of the Binary Search Tree is well-structured and efficient.

Strengths:
- Clean and readable code
- Proper error handling
- Good time complexity analysis
- Comprehensive test cases

Areas for Improvement:
- Could add more edge case handling
- Consider adding balance checking methods

Overall: Outstanding submission. Keep up the good work!
      `,
      facultyName: 'B Jaswanth'
    });
  };

  if (!user || !feedback) return <div>Loading...</div>;

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <button
            onClick={() => navigate('/student/assignments')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ← Back to Assignments
          </button>
          <h1 className="dashboard-title">Assignment Feedback</h1>
          <p className="dashboard-subtitle">{feedback.assignmentTitle}</p>
        </div>

        <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
          <div className="widget-header">
            <h3 className="widget-title">Grade Summary</h3>
          </div>
          <div className="widget-content">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '4rem',
                fontWeight: '700',
                color: feedback.marks >= 90 ? '#22c55e' : feedback.marks >= 75 ? '#3b82f6' : '#f59e0b',
                marginBottom: '0.5rem'
              }}>
                {feedback.marks}/{feedback.maxMarks}
              </div>
              <p style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: '600' }}>
                {((feedback.marks / feedback.maxMarks) * 100).toFixed(1)}%
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Course</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{feedback.course}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Submitted</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                  {new Date(feedback.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Graded</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                  {new Date(feedback.gradedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Graded By</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{feedback.facultyName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Faculty Feedback</h3>
          </div>
          <div className="widget-content">
            <div style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              color: '#374151',
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              {feedback.feedback}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentFeedbackViewPage;
