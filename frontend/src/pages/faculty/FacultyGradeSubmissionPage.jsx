import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const FacultyGradeSubmissionPage = () => {
  const user = apiService.getCurrentUser();
  const navigate = useNavigate();
  const { assignmentId, submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSubmission();
  }, [assignmentId, submissionId]);

  const loadSubmission = () => {
    // Sample submission data
    const submissionsData = {
      '1': {
        id: '1',
        assignmentTitle: 'Data Structures Assignment 1',
        course: 'CS201',
        totalMarks: 100,
        studentName: 'Kannaya',
        studentId: 'ST001',
        submittedAt: '2026-02-14T10:30:00',
        status: 'submitted',
        submissionText: `// Binary Search Tree Implementation...`,
        fileName: 'bst_implementation.js',
        marks: null,
        feedback: null
      },
      '2': {
        id: '2',
        assignmentTitle: 'Data Structures Assignment 1',
        course: 'CS201',
        totalMarks: 100,
        studentName: 'Rahul Kumar',
        studentId: 'ST002',
        submittedAt: '2026-02-13T15:45:00',
        status: 'graded',
        submissionText: `// BST Implementation...`,
        fileName: 'assignment1.zip',
        marks: 85,
        feedback: 'Good implementation. Code is clean and well-structured.'
      }
    };

    const data = submissionsData[submissionId] || submissionsData['1'];
    setSubmission(data);
    if (data.marks !== null) {
      setMarks(data.marks.toString());
      setFeedback(data.feedback || '');
    }
  };

  const handleSubmitGrade = async () => {
    if (!marks || marks === '') {
      setMessage('Please enter marks');
      return;
    }

    const marksNum = parseInt(marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > submission.totalMarks) {
      setMessage(`Marks must be between 0 and ${submission.totalMarks}`);
      return;
    }

    if (!feedback.trim()) {
      setMessage('Please provide feedback');
      return;
    }

    try {
      setSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage('Grade submitted successfully!');
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate(`/faculty/assignments/${assignmentId}/submissions`);
      }, 2000);
    } catch (error) {
      setMessage('Error submitting grade. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!submission) return <div>Loading...</div>;

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <button
            onClick={() => navigate(`/faculty/assignments/${assignmentId}/submissions/${submissionId}`)}
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
            ← Back to Submission
          </button>
          <h1 className="dashboard-title">Grade Submission</h1>
          <p className="dashboard-subtitle">{submission.assignmentTitle} - {submission.studentName}</p>
        </div>

        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '0.5rem',
            backgroundColor: message.includes('success') ? '#dcfce7' : '#fee2e2',
            color: message.includes('success') ? '#166534' : '#991b1b',
            border: `1px solid ${message.includes('success') ? '#86efac' : '#fca5a5'}`
          }}>
            {message}
          </div>
        )}

        {/* Student Info */}
        <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
          <div className="widget-header">
            <h3 className="widget-title">Student Information</h3>
          </div>
          <div className="widget-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Name: <strong>{submission.studentName}</strong></p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>ID: <strong>{submission.studentId}</strong></p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Submitted: <strong>{new Date(submission.submittedAt).toLocaleDateString()}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Preview */}
        <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
          <div className="widget-header">
            <h3 className="widget-title">Submission Preview</h3>
          </div>
          <div className="widget-content">
            {submission.fileName && (
              <p style={{ fontSize: '0.875rem', color: '#3b82f6', marginBottom: '1rem' }}>
                📎 {submission.fileName}
              </p>
            )}
            <pre style={{
              backgroundColor: '#f8fafc',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
              fontSize: '0.75rem',
              lineHeight: '1.5',
              fontFamily: 'monospace',
              maxHeight: '200px',
              border: '1px solid #e2e8f0'
            }}>
              {submission.submissionText}
            </pre>
            <button
              onClick={() => navigate(`/faculty/assignments/${assignmentId}/submissions/${submissionId}`)}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              View Full Submission
            </button>
          </div>
        </div>

        {/* Grading Form */}
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Enter Grade</h3>
          </div>
          <div className="widget-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Marks (out of {submission.totalMarks})
              </label>
              <input
                type="number"
                min="0"
                max={submission.totalMarks}
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder={`Enter marks (0-${submission.totalMarks})`}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide detailed feedback to the student..."
                rows="8"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleSubmitGrade}
                disabled={submitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: submitting ? '#94a3b8' : '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {submitting ? 'Submitting...' : submission.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
              </button>

              <button
                onClick={() => navigate(`/faculty/assignments/${assignmentId}/submissions`)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f1f5f9',
                  color: '#374151',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultyGradeSubmissionPage;
