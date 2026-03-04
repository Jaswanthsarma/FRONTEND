import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const FacultyStudentRequestsPage = () => {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [processingRequest, setProcessingRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadRequests();
      loadStats();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadRequests = async (status = null) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching course requests...');
      
      const response = await apiService.getFacultyCourseRequests(status);
      
      if (response.success) {
        const allRequests = response.data || [];
        console.log(`✅ Loaded ${allRequests.length} requests`);
        setRequests(allRequests);
        setFilteredRequests(allRequests);
      } else {
        setError('Failed to load requests');
      }
    } catch (error) {
      console.error('❌ Error loading requests:', error);
      setError('Unable to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getCourseRequestStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(req => req.status === filter));
    }
  };

  const handleApprove = async (requestId, studentName, courseName) => {
    if (!window.confirm(`Approve ${studentName}'s request to join ${courseName}?`)) {
      return;
    }

    try {
      setProcessingRequest(requestId);
      setError('');
      setSuccessMessage('');
      
      const response = await apiService.approveCourseRequest(
        requestId,
        'Your request has been approved. Welcome to the course!'
      );
      
      if (response.success) {
        setSuccessMessage(`Approved ${studentName}'s request successfully!`);
        
        // Reload requests and stats
        await loadRequests();
        await loadStats();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('❌ Error approving request:', error);
      setError('Failed to approve request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (requestId, studentName, courseName) => {
    const reason = window.prompt(`Reject ${studentName}'s request to join ${courseName}?\n\nOptional: Provide a reason:`);
    
    if (reason === null) {
      return; // User cancelled
    }

    try {
      setProcessingRequest(requestId);
      setError('');
      setSuccessMessage('');
      
      const response = await apiService.rejectCourseRequest(
        requestId,
        reason || 'Your request has been rejected.'
      );
      
      if (response.success) {
        setSuccessMessage(`Rejected ${studentName}'s request.`);
        
        // Reload requests and stats
        await loadRequests();
        await loadStats();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      setError('Failed to reject request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fcd34d',
        text: '⏳ Pending'
      },
      approved: {
        backgroundColor: '#dcfce7',
        color: '#166534',
        border: '1px solid #86efac',
        text: '✓ Approved'
      },
      rejected: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fca5a5',
        text: '✗ Rejected'
      }
    };
    return styles[status] || styles.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return <div>Loading...</div>;

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">📋 Student Course Requests</h1>
          <p className="dashboard-subtitle">Manage student enrollment requests</p>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="widget-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
              Total Requests
            </div>
          </div>
          
          <div className="widget-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              {stats.pending}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
              Pending
            </div>
          </div>
          
          <div className="widget-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
              {stats.approved}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
              Approved
            </div>
          </div>
          
          <div className="widget-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
              {stats.rejected}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
              Rejected
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected'].map(filter => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: activeFilter === filter ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: activeFilter === filter ? '#eff6ff' : 'white',
                color: activeFilter === filter ? '#3b82f6' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
              }}
            >
              {filter}
            </button>
          ))}
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

        {successMessage && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '0.5rem',
            backgroundColor: '#dcfce7',
            color: '#166534',
            border: '1px solid #86efac'
          }}>
            {successMessage}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            border: '2px dashed #cbd5e0'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No Requests Found</h3>
            <p style={{ color: '#64748b' }}>
              {activeFilter === 'all' 
                ? 'No course join requests yet.'
                : `No ${activeFilter} requests.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredRequests.map(request => {
              const statusStyle = getStatusBadge(request.status);
              const isProcessing = processingRequest === request._id;
              
              return (
                <div key={request._id} className="widget-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                        {request.studentId?.name || 'Unknown Student'}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        📧 {request.studentId?.email || 'N/A'}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        🏛️ {request.studentId?.department || 'N/A'} • Semester {request.studentId?.semester || 'N/A'}
                      </p>
                    </div>
                    
                    <span style={{
                      ...statusStyle,
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {statusStyle.text}
                    </span>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
                      <strong>Course:</strong> {request.courseId?.title || 'N/A'} ({request.courseId?.code || 'N/A'})
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
                      <strong>Requested:</strong> {formatDate(request.createdAt)}
                    </p>
                    {request.requestMessage && (
                      <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        "{request.requestMessage}"
                      </p>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleApprove(request._id, request.studentId?.name, request.courseId?.title)}
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          backgroundColor: isProcessing ? '#94a3b8' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: isProcessing ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isProcessing ? 'Processing...' : '✓ Approve'}
                      </button>
                      
                      <button
                        onClick={() => handleReject(request._id, request.studentId?.name, request.courseId?.title)}
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          backgroundColor: isProcessing ? '#94a3b8' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: isProcessing ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isProcessing ? 'Processing...' : '✗ Reject'}
                      </button>
                    </div>
                  )}

                  {request.status !== 'pending' && request.responseMessage && (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: request.status === 'approved' ? '#dcfce7' : '#fee2e2',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: request.status === 'approved' ? '#166534' : '#991b1b'
                    }}>
                      <strong>Response:</strong> {request.responseMessage}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FacultyLayout>
  );
};

export default FacultyStudentRequestsPage;
