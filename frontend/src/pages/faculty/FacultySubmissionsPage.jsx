import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const FacultySubmissionsPage = () => {
  const user = apiService.getCurrentUser();
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, submitted, graded, pending

  useEffect(() => {
    loadSubmissions();
  }, [assignmentId]);

  const loadSubmissions = () => {
    // Sample assignment and submissions data
    const assignmentData = {
      '1': {
        title: 'Data Structures Assignment 1',
        course: 'CS201',
        totalMarks: 100,
        dueDate: '2026-02-20T23:59:00'
      },
      '2': {
        title: 'Database Project',
        course: 'CS301',
        totalMarks: 100,
        dueDate: '2026-02-25T23:59:00'
      }
    };

    const submissionsData = {
      '1': [
        {
          id: '1',
          studentName: 'Kannaya',
          studentId: 'ST001',
          submittedAt: '2026-02-14T10:30:00',
          status: 'submitted',
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
    let current = this.root;
    while (true) {
      if (value === current.value) return undefined;
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }

  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }
}
          `,
          fileName: 'bst_implementation.js',
          marks: null
        },
        {
          id: '2',
          studentName: 'Rahul Kumar',
          studentId: 'ST002',
          submittedAt: '2026-02-13T15:45:00',
          status: 'graded',
          submissionText: `
// BST Implementation
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}
// ... implementation continues
          `,
          fileName: 'assignment1.zip',
          marks: 85,
          feedback: 'Good implementation. Consider adding more edge cases.'
        },
        {
          id: '3',
          studentName: 'Priya Singh',
          studentId: 'ST003',
          submittedAt: '2026-02-12T09:20:00',
          status: 'graded',
          submissionText: 'See attached file for complete implementation.',
          fileName: 'data_structures_assignment.zip',
          marks: 92,
          feedback: 'Excellent work! Well-documented code with comprehensive test cases.'
        }
      ],
      '2': [
        {
          id: '4',
          studentName: 'Kannaya',
          studentId: 'ST001',
          submittedAt: '2026-02-15T11:00:00',
          status: 'submitted',
          submissionText: `
Database Schema for Library Management System:

Tables:
1. Books (book_id, title, author, isbn, category, available_copies)
2. Members (member_id, name, email, phone, join_date)
3. Transactions (transaction_id, book_id, member_id, issue_date, return_date, status)

ER Diagram and SQL queries are in the attached file.
          `,
          fileName: 'library_db_project.zip',
          marks: null
        }
      ]
    };

    setAssignment(assignmentData[assignmentId] || assignmentData['1']);
    setSubmissions(submissionsData[assignmentId] || submissionsData['1']);
  };

  const handleViewSubmission = (submissionId) => {
    navigate(`/faculty/assignments/${assignmentId}/submissions/${submissionId}`);
  };

  const handleGradeSubmission = (submissionId) => {
    navigate(`/faculty/assignments/${assignmentId}/submissions/${submissionId}/grade`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd' },
      graded: { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
      pending: { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }
    };
    return styles[status] || styles.pending;
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  if (!assignment) return <div>Loading...</div>;

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <button
            onClick={() => navigate('/faculty/assignments')}
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
          <h1 className="dashboard-title">{assignment.title} - Submissions</h1>
          <p className="dashboard-subtitle">{assignment.course} | Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['all', 'submitted', 'graded'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                background: filter === filterType ? '#2563eb' : 'white',
                color: filter === filterType ? 'white' : '#374151',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {filterType} ({submissions.filter(s => filterType === 'all' || s.status === filterType).length})
            </button>
          ))}
        </div>

        {/* Submissions List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredSubmissions.length === 0 ? (
            <div className="widget-card">
              <div className="widget-content" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                No submissions found
              </div>
            </div>
          ) : (
            filteredSubmissions.map(submission => (
              <div key={submission.id} className="widget-card">
                <div className="widget-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          {submission.studentName}
                        </h3>
                        <span style={{
                          ...getStatusBadge(submission.status),
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                        {submission.marks !== null && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            backgroundColor: '#f0f9ff',
                            color: '#0369a1'
                          }}>
                            {submission.marks}/{assignment.totalMarks}
                          </span>
                        )}
                      </div>
                      
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        Student ID: {submission.studentId}
                      </p>
                      
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </p>

                      {submission.fileName && (
                        <p style={{ fontSize: '0.875rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
                          📎 {submission.fileName}
                        </p>
                      )}

                      {submission.submissionText && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '0.5rem',
                          border: '1px solid #e2e8f0'
                        }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                            Preview:
                          </p>
                          <pre style={{
                            fontSize: '0.75rem',
                            lineHeight: '1.5',
                            color: '#374151',
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            maxHeight: '150px',
                            overflow: 'auto'
                          }}>
                            {submission.submissionText.substring(0, 300)}
                            {submission.submissionText.length > 300 && '...'}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                      <button
                        onClick={() => handleViewSubmission(submission.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        View Full
                      </button>
                      
                      {submission.status === 'submitted' && (
                        <button
                          onClick={() => handleGradeSubmission(submission.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Grade
                        </button>
                      )}

                      {submission.status === 'graded' && (
                        <button
                          onClick={() => handleGradeSubmission(submission.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Edit Grade
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultySubmissionsPage;
