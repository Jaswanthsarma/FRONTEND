import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const FacultyAssignmentsPage = () => {
  const user = apiService.getCurrentUser();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, closed, draft
  const [viewModal, setViewModal] = useState(null); // For viewing assignment details

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📚 Loading faculty assignments...');
      
      // Fetch assignments from API
      const response = await apiService.getAssignments('faculty');
      
      console.log('✅ Assignments loaded:', response);
      
      if (response.success) {
        setAssignments(response.data.assignments || []);
        console.log(`✅ Loaded ${response.data.assignments?.length || 0} assignments`);
      } else {
        setError('Failed to load assignments');
      }
    } catch (err) {
      console.error('❌ Error loading assignments:', err);
      setError(err.message || 'Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    navigate('/faculty/assignments/create');
  };

  const handleViewAssignment = (assignmentId) => {
    const assignment = assignments.find(a => a._id === assignmentId);
    setViewModal(assignment);
  };

  const handleEditAssignment = (assignmentId) => {
    navigate(`/faculty/assignments/${assignmentId}/edit`);
  };

  const handleViewSubmissions = (assignmentId) => {
    navigate(`/faculty/assignments/${assignmentId}/submissions`);
  };

  const handlePublishAssignment = async (assignmentId) => {
    try {
      const response = await apiService.publishAssignment(assignmentId);
      if (response.success) {
        loadAssignments(); // Reload to get updated status
      } else {
        setError('Failed to publish assignment');
      }
    } catch (err) {
      setError(err.message || 'Failed to publish assignment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#6b7280';
      case 'published': return '#3b82f6';
      case 'active': return '#10b981';
      case 'closed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (assignment) => {
    if (!assignment.isPublished) return 'Draft';
    return assignment.currentStatus === 'published' ? 'Published' : 
           assignment.currentStatus === 'active' ? 'Active' : 'Closed';
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'draft') return !assignment.isPublished;
    if (filter === 'active') return assignment.currentStatus === 'active';
    if (filter === 'closed') return assignment.currentStatus === 'closed';
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <FacultyLayout user={user}>
        <div className="dashboard-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading assignments...</div>
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Assignments</h1>
          <p className="dashboard-subtitle">Create and manage assignments for your courses</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {/* Filter and Create Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'draft', 'active', 'closed'].map(filterType => (
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
                {filterType} ({assignments.filter(a => {
                  if (filterType === 'all') return true;
                  if (filterType === 'draft') return !a.isPublished;
                  if (filterType === 'active') return a.currentStatus === 'active';
                  if (filterType === 'closed') return a.currentStatus === 'closed';
                  return true;
                }).length})
              </button>
            ))}
          </div>

          <button
            onClick={handleCreateAssignment}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Create New Assignment
          </button>
        </div>

        {/* Assignments List */}
        <div className="widget-card">
          <div className="widget-content">
            {filteredAssignments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                {filter === 'all' ? 'No assignments found. Create your first assignment!' : 
                 `No ${filter} assignments found.`}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredAssignments.map(assignment => (
                  <div
                    key={assignment._id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      background: 'white'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
                            {assignment.title}
                          </h3>
                          <span
                            style={{
                              background: getStatusColor(assignment.currentStatus),
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}
                          >
                            {getStatusText(assignment)}
                          </span>
                        </div>
                        
                        <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
                          {assignment.description.length > 100 
                            ? `${assignment.description.substring(0, 100)}...` 
                            : assignment.description}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                          <span>📚 {assignment.courseCode || assignment.course?.code || assignment.course || 'N/A'}</span>
                          <span>📊 {assignment.totalMarks} marks</span>
                          <span>📝 {assignment.submissions || 0} submissions</span>
                          <span>⏳ {assignment.pending || 0} pending</span>
                          <span>📅 Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewAssignment(assignment._id)}
                          style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.375rem',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          View
                        </button>

                        {assignment.currentStatus !== 'closed' && !assignment.isPublished && (
                          <button
                            onClick={() => handleEditAssignment(assignment._id)}
                            style={{
                              padding: '0.5rem 1rem',
                              border: '1px solid #e2e8f0',
                              borderRadius: '0.375rem',
                              background: 'white',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Edit
                          </button>
                        )}

                        {!assignment.isPublished && assignment.questions?.length > 0 && (
                          <button
                            onClick={() => handlePublishAssignment(assignment._id)}
                            style={{
                              padding: '0.5rem 1rem',
                              border: 'none',
                              borderRadius: '0.375rem',
                              background: '#10b981',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Publish
                          </button>
                        )}

                        {assignment.isPublished && (
                          <button
                            onClick={() => handleViewSubmissions(assignment._id)}
                            style={{
                              padding: '0.5rem 1rem',
                              border: 'none',
                              borderRadius: '0.375rem',
                              background: '#2563eb',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Submissions
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Assignment Modal */}
      {viewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 10
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {viewModal.title}
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {viewModal.course} | {viewModal.totalMarks} marks
                </p>
              </div>
              <button
                onClick={() => setViewModal(null)}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: '#64748b',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Assignment Info */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Course</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{viewModal.course}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Marks</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{viewModal.totalMarks}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Due Date</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                      {formatDate(viewModal.dueDate)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Status</p>
                    <span style={{
                      background: getStatusColor(viewModal.currentStatus),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {getStatusText(viewModal)}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Submissions</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                      {viewModal.submissions || 0} submitted
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Pending</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                      {viewModal.pending || 0} pending
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Description
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6' }}>
                  {viewModal.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                {viewModal.isPublished && (
                  <button
                    onClick={() => {
                      setViewModal(null);
                      handleViewSubmissions(viewModal._id);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    View Submissions ({viewModal.submissions || 0})
                  </button>
                )}
                <button
                  onClick={() => setViewModal(null)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#f1f5f9',
                    color: '#374151',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FacultyLayout>
  );
};

export default FacultyAssignmentsPage;