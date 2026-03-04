import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import apiService from '../../services/api';

const StudentAssignmentsPage = () => {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadAssignments();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch assignments from API
      const response = await apiService.getStudentAssignments();
      
      if (response.success) {
        setAssignments(response.data || []);
      } else {
        setError('Failed to load assignments');
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      setError('Unable to load assignments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Assignments</h1>
          <p className="dashboard-subtitle">View and submit your assignments</p>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '0.5rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fca5a5'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            border: '2px dashed #cbd5e0'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No Assignments Yet</h3>
            <p style={{ color: '#64748b' }}>
              Your faculty hasn't assigned any work yet. Check back later!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {assignments.map(assignment => (
              <div key={assignment._id} className="widget-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                      {assignment.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      Course: {assignment.course?.name || assignment.course?.code || 'N/A'}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Due Date: {new Date(assignment.dueDate).toLocaleDateString()} at{' '}
                      {new Date(assignment.dueDate).toLocaleTimeString()}
                    </p>
                    {assignment.marks !== null && assignment.marks !== undefined && (
                      <p style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: '600', marginTop: '0.5rem' }}>
                        Marks: {assignment.marks}/{assignment.maxMarks || 100}
                      </p>
                    )}
                    {assignment.hasSubmission && (
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#16a34a', 
                        fontWeight: '500', 
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        ✓ Submitted on {new Date(assignment.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <button 
                      onClick={() => navigate(`/student/assignments/${assignment._id}`)}
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
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentAssignmentsPage;
