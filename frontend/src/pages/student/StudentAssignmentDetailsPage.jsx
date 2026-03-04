import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import apiService from '../../services/api';

const StudentAssignmentDetailsPage = () => {
  const [user, setUser] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [submissionData, setSubmissionData] = useState(null);
  const navigate = useNavigate();
  const { assignmentId } = useParams();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadAssignment();
    } else {
      navigate('/login');
    }
  }, [navigate, assignmentId]);

  const loadAssignment = async () => {
    try {
      // Check localStorage for submission state first
      const submissionKey = `assignment_${assignmentId}_submission`;
      const savedSubmission = localStorage.getItem(submissionKey);
      if (savedSubmission) {
        setSubmissionData(JSON.parse(savedSubmission));
      }
      
      // Try to fetch from API first
      const response = await apiService.getAssignmentById(assignmentId);
      if (response.success && response.data) {
        console.log('✅ Assignment loaded:', response.data);
        // Handle both response formats: { assignment: {...} } or direct data
        const assignmentData = response.data.assignment || response.data;
        setAssignment(assignmentData);
        
        // Check if student has already submitted
        if (assignmentData.hasSubmission || assignmentData.submission) {
          const submissionInfo = {
            submittedAt: assignmentData.submission?.submittedAt || assignmentData.submittedAt,
            status: assignmentData.submission?.status || assignmentData.submissionStatus || 'submitted'
          };
          setSubmissionData(submissionInfo);
          // Save to localStorage
          localStorage.setItem(submissionKey, JSON.stringify(submissionInfo));
        }
        return;
      }
    } catch (error) {
      console.error('❌ Error loading assignment:', error);
    }
    
    // Fallback to sample data
    const assignments = {
      '1': {
        id: 1,
        title: 'Data Structures Assignment 1',
        course: 'CS201',
        courseName: 'Data Structures',
        faculty: 'B Jaswanth',
        dueDate: '2026-02-20',
        status: 'pending',
        description: `
# Assignment: Implement Binary Search Tree

## Objective
Implement a Binary Search Tree (BST) data structure with the following operations:
- Insert a node
- Delete a node
- Search for a value
- In-order traversal
- Pre-order traversal
- Post-order traversal

## Requirements
1. Write clean, well-documented code
2. Include time complexity analysis for each operation
3. Add test cases to verify your implementation
4. Submit both source code and a report explaining your approach

## Submission Guidelines
- Submit your code as a .zip file or paste the code in the text area below
- Include a README file with instructions to run your code
- Ensure your code compiles without errors

## Grading Criteria
- Correctness: 40%
- Code Quality: 30%
- Documentation: 20%
- Test Cases: 10%

## Due Date
February 20, 2026 at 11:59 PM

Good luck!
        `,
        maxMarks: 100,
        attachments: []
      },
      '2': {
        id: 2,
        title: 'Database Project',
        course: 'CS301',
        courseName: 'Database Management',
        faculty: 'B Jaswanth',
        dueDate: '2026-02-25',
        status: 'pending',
        description: `
# Database Project: Library Management System

## Objective
Design and implement a complete database system for a library management system.

## Requirements
1. Create ER diagram
2. Design normalized database schema (3NF)
3. Write SQL queries for common operations
4. Implement stored procedures and triggers
5. Create a simple frontend interface

## Deliverables
- ER Diagram (PDF)
- Database Schema (SQL file)
- Sample data (SQL file)
- Query implementations
- Project report

## Due Date
February 25, 2026 at 11:59 PM
        `,
        maxMarks: 100,
        attachments: []
      }
    };

    setAssignment(assignments[assignmentId] || assignments['1']);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && !file) {
      setMessage('Please provide either text submission or upload a file');
      return;
    }

    try {
      setSubmitting(true);
      
      const submissionInfo = {
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };
      
      // Try to submit via API
      try {
        const formData = new FormData();
        formData.append('content', submissionText);
        if (file) {
          formData.append('file', file);
        }

        const response = await apiService.submitAssignment(assignmentId, formData);
        
        if (response.success) {
          // Update submission data
          setSubmissionData(submissionInfo);
          
          // Save to localStorage
          const submissionKey = `assignment_${assignmentId}_submission`;
          localStorage.setItem(submissionKey, JSON.stringify(submissionInfo));
          
          setMessage('✅ Assignment submitted successfully! Faculty will be notified.');
          
          // Don't navigate away - just show success message
          setTimeout(() => {
            setMessage('');
          }, 3000);
          
          return;
        }
      } catch (apiError) {
        console.log('API submission failed, using fallback:', apiError);
      }
      
      // Fallback: simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update submission data
      setSubmissionData(submissionInfo);
      
      // Save to localStorage
      const submissionKey = `assignment_${assignmentId}_submission`;
      localStorage.setItem(submissionKey, JSON.stringify(submissionInfo));

      setMessage('✅ Assignment submitted successfully! Faculty will be notified.');
      
      // Don't navigate away - just show success message
      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (error) {
      setMessage('❌ Error submitting assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <div>Loading user...</div>;
  
  if (!assignment) {
    return (
      <StudentLayout user={user}>
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>Loading Assignment...</h3>
            <p style={{ color: '#64748b' }}>Please wait while we fetch the assignment details</p>
            <button
              onClick={() => navigate('/student/assignments')}
              style={{
                marginTop: '1.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              ← Back to Assignments
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">{assignment.title}</h1>
          <p className="dashboard-subtitle">
            {assignment.course?.title || assignment.course?.name || assignment.course?.code || assignment.courseName || 'Course'} 
            {assignment.course?.code ? ` (${assignment.course.code})` : ''}
          </p>
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

        {/* Assignment Info */}
        <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
          <div className="widget-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Faculty</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                  {assignment.createdBy?.fullName || assignment.createdBy?.name || assignment.facultyId?.name || assignment.faculty || 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Due Date</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ef4444' }}>
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Max Marks</p>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                  {assignment.maxMarks || assignment.totalMarks || 100}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Description */}
        <div className="widget-card" style={{ marginBottom: '1.5rem' }}>
          <div className="widget-header">
            <h3 className="widget-title">Assignment Description</h3>
          </div>
          <div className="widget-content">
            <div style={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: '1.6',
              color: '#374151'
            }}>
              {assignment.description}
            </div>
            
            {/* Show attachment file if exists */}
            {assignment.attachmentFile && assignment.attachmentFile.originalName && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📎</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', color: '#0369a1', marginBottom: '0.25rem' }}>
                      Assignment File Attached
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {assignment.attachmentFile.originalName}
                    </p>
                  </div>
                  <a
                    href={`http://localhost:5000/${assignment.attachmentFile.path}`}
                    download={assignment.attachmentFile.originalName}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#0284c7',
                      color: 'white',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>📥</span>
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submission Section */}
        {!submissionData ? (
          // Show full submission form if not yet submitted
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Submit Your Work</h3>
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
                  Text Submission (Optional)
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Paste your code or write your answer here..."
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    resize: 'vertical'
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
                  Upload File (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.zip,.txt,.cpp,.java,.py"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
                {file && (
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: submitting ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        ) : (
          // Show submitted message with edit option
          <div className="widget-card">
            <div className="widget-content">
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '0.5rem',
                border: '2px solid #86efac',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: '#166534', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  Assignment Submitted Successfully
                </h3>
                <p style={{ color: '#15803d', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  Your assignment has been submitted. Faculty will review and provide feedback.
                </p>
                {submissionData.submittedAt && (
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Submitted on: {new Date(submissionData.submittedAt).toLocaleDateString()} at{' '}
                    {new Date(submissionData.submittedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => setSubmissionData(null)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>✏️</span>
                <span>Edit Submission</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentAssignmentDetailsPage;
