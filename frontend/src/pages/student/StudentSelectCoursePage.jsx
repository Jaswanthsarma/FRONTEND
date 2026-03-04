import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import apiService from '../../services/api';

const StudentSelectCoursePage = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseRequests, setCourseRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestingCourse, setRequestingCourse] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadCourses();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching courses and requests from API...');
      
      // Fetch all available courses
      const coursesResponse = await apiService.getAvailableCourses(null, null);
      
      console.log('📦 Courses API Response:', coursesResponse);
      
      if (coursesResponse.success) {
        const allCourses = coursesResponse.data || [];
        console.log(`✅ Loaded ${allCourses.length} courses`);
        setCourses(allCourses);
        
        // Fetch student's course requests
        const requestsResponse = await apiService.getMyCourseRequests();
        console.log('📦 Requests API Response:', requestsResponse);
        
        if (requestsResponse.success) {
          // Create a map of courseId -> request status
          const requestsMap = {};
          (requestsResponse.data || []).forEach(request => {
            requestsMap[request.courseId._id] = request.status;
          });
          console.log('📋 Requests Map:', requestsMap);
          setCourseRequests(requestsMap);
        }
      } else {
        console.error('❌ API returned success: false');
        setError('Failed to load courses. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      setError('Unable to load courses. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async (courseId, courseTitle) => {
    try {
      setRequestingCourse(courseId);
      setError('');
      setSuccessMessage('');
      
      console.log('📝 Requesting to join course:', courseId);
      
      const response = await apiService.createCourseRequest(
        courseId,
        `I would like to join ${courseTitle}`
      );
      
      if (response.success) {
        // Update local state
        setCourseRequests(prev => ({
          ...prev,
          [courseId]: 'pending'
        }));
        
        setSuccessMessage('Join request sent successfully! Waiting for faculty approval.');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.message || 'Failed to send request');
      }
      
    } catch (error) {
      console.error('❌ Error requesting to join course:', error);
      setError(error.message || 'Failed to send join request. Please try again.');
    } finally {
      setRequestingCourse(null);
    }
  };

  const getCourseStatus = (courseId) => {
    return courseRequests[courseId] || 'none';
  };

  const getStatusBadge = (status) => {
    const styles = {
      'approved': {
        backgroundColor: '#dcfce7',
        color: '#166534',
        border: '1px solid #86efac',
        text: '✓ Approved'
      },
      'pending': {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fcd34d',
        text: '⏳ Pending Approval'
      },
      'rejected': {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fca5a5',
        text: '✗ Rejected'
      },
      'none': {
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: '1px solid #d1d5db',
        text: 'Not Requested'
      }
    };
    return styles[status] || styles['none'];
  };

  const getCourseInitials = (courseName) => {
    return courseName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">🎓 Select Course</h1>
          <p className="dashboard-subtitle">Browse and enroll in available courses</p>
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
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
            border: '2px dashed #cbd5e0'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No Courses Available</h3>
            <p style={{ color: '#64748b' }}>
              No courses are currently available. Check back later!
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {courses.map(course => {
              const status = getCourseStatus(course._id);
              const statusStyle = getStatusBadge(status);
              const isRequesting = requestingCourse === course._id;
              
              return (
                <div 
                  key={course._id} 
                  className="widget-card" 
                  style={{ 
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    {/* Course Icon */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      {getCourseInitials(course.title || course.name || 'NA')}
                    </div>
                    
                    {/* Course Info */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        marginBottom: '0.25rem'
                      }}>
                        {course.title || course.name}
                      </h3>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#64748b',
                        marginBottom: '0.5rem'
                      }}>
                        {course.code}
                      </p>
                      <span style={{
                        ...statusStyle,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}>
                        {statusStyle.text}
                      </span>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1rem' }}>👨‍🏫</span>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#475569',
                        margin: 0
                      }}>
                        <strong>Faculty:</strong> {course.facultyId?.name || 'N/A'}
                      </p>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1rem' }}>🏛️</span>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#475569',
                        margin: 0
                      }}>
                        <strong>Department:</strong> {course.department}
                      </p>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1rem' }}>📅</span>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#475569',
                        margin: 0
                      }}>
                        <strong>Semester:</strong> {course.semester}
                      </p>
                    </div>
                  </div>

                  {/* Course Description */}
                  {course.description && (
                    <p style={{ 
                      fontSize: '0.875rem',
                      color: '#64748b',
                      lineHeight: '1.5',
                      marginBottom: '1rem',
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: '1rem'
                    }}>
                      {course.description.length > 120 
                        ? `${course.description.substring(0, 120)}...` 
                        : course.description}
                    </p>
                  )}

                  {/* Action Button */}
                  {status === 'none' ? (
                    <button
                      onClick={() => handleRequestJoin(course._id, course.title || course.name)}
                      disabled={isRequesting}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: isRequesting ? '#94a3b8' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: isRequesting ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isRequesting ? 'Sending Request...' : '📝 Request to Join'}
                    </button>
                  ) : status === 'pending' ? (
                    <div style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fcd34d',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      ⏳ Waiting for Faculty Approval
                    </div>
                  ) : status === 'approved' ? (
                    <button
                      onClick={() => navigate('/student/courses')}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ✓ View Course →
                    </button>
                  ) : (
                    <div style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      border: '1px solid #fca5a5',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      ✗ Request Rejected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentSelectCoursePage;
