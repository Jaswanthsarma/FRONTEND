import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import apiService from '../../services/api';

const StudentCoursesPage = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      
      console.log('🔍 Fetching enrolled courses from API...');
      
      // Fetch enrolled courses using dedicated endpoint
      const response = await apiService.getEnrolledCourses();
      
      console.log('📦 API Response:', response);
      
      if (response.success) {
        const enrolledCourses = response.data || [];
        console.log(`✅ Loaded ${enrolledCourses.length} enrolled courses`);
        setCourses(enrolledCourses);
      } else {
        console.error('❌ API returned success: false');
        setError('Failed to load courses');
      }
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      setError('Unable to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">My Courses</h1>
          <p className="dashboard-subtitle">View your enrolled courses</p>
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
            <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No Enrolled Courses</h3>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              You haven't been approved for any courses yet.
            </p>
            <button
              onClick={() => navigate('/student/select-course')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {courses.map(course => (
              <div key={course._id} className="widget-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 className="widget-title">{course.title || course.name}</h3>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{course.code}</span>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    border: '1px solid #86efac'
                  }}>
                    ✓ Enrolled
                  </span>
                </div>
                <div className="widget-content">
                  <p style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                    <strong>Faculty:</strong> {course.facultyId?.name || 'N/A'}
                  </p>
                  <p style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                    <strong>Department:</strong> {course.department}
                  </p>
                  <p style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                    <strong>Semester:</strong> {course.semester}
                  </p>
                  {course.description && (
                    <p style={{ 
                      marginTop: '1rem', 
                      color: '#475569', 
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      marginBottom: '1rem'
                    }}>
                      {course.description.length > 100 
                        ? `${course.description.substring(0, 100)}...` 
                        : course.description}
                    </p>
                  )}
                  <button
                    onClick={() => navigate(`/student/courses/${course._id}`)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginTop: '1rem'
                    }}
                  >
                    View Course →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentCoursesPage;
