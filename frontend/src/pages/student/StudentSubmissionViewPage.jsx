import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';

const StudentSubmissionViewPage = () => {
  const [user, setUser] = useState(null);
  const [submission, setSubmission] = useState(null);
  const navigate = useNavigate();
  const { assignmentId } = useParams();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadSubmission();
    } else {
      navigate('/login');
    }
  }, [navigate, assignmentId]);

  const loadSubmission = () => {
    // Sample submission data
    setSubmission({
      assignmentTitle: 'Web Development Lab',
      course: 'CS401',
      submittedAt: '2026-02-14T10:30:00',
      submissionText: `
// Binary Search Tree Implementation
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const newNode = new Node(value);
    if (!this.root) {
      this.root = newNode;
      return this;
    }
    // Implementation continues...
  }
}
      `,
      fileName: 'assignment.zip',
      status: 'submitted'
    });
  };

  if (!user || !submission) return <div>Loading...</div>;

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
          <h1 className="dashboard-title">Submission Details</h1>
          <p className="dashboard-subtitle">{submission.assignmentTitle}</p>
        </div>

        <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
          <div className="widget-header">
            <h3 className="widget-title">Submission Information</h3>
          </div>
          <div className="widget-content">
            <p style={{ marginBottom: '0.5rem', color: '#64748b' }}>
              <strong>Course:</strong> {submission.course}
            </p>
            <p style={{ marginBottom: '0.5rem', color: '#64748b' }}>
              <strong>Submitted At:</strong> {new Date(submission.submittedAt).toLocaleString()}
            </p>
            <p style={{ marginBottom: '0.5rem', color: '#64748b' }}>
              <strong>Status:</strong> <span style={{ color: '#1e40af', fontWeight: '600' }}>Submitted - Awaiting Review</span>
            </p>
          </div>
        </div>

        {submission.submissionText && (
          <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
            <div className="widget-header">
              <h3 className="widget-title">Your Submission</h3>
            </div>
            <div className="widget-content">
              <pre style={{
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '0.5rem',
                overflow: 'auto',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                fontFamily: 'monospace'
              }}>
                {submission.submissionText}
              </pre>
            </div>
          </div>
        )}

        {submission.fileName && (
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Attached File</h3>
            </div>
            <div className="widget-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📎</span>
                <span style={{ color: '#3b82f6', fontWeight: '500' }}>{submission.fileName}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentSubmissionViewPage;
