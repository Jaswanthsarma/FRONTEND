import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import CourseModal from '../../components/CourseModal';
import Toast from '../../components/Toast';

const FacultyCoursesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    // Simple user check without aggressive redirects
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('FacultyCoursesPage - Checking auth:', { 
      hasUserData: !!userData, 
      hasToken: !!token,
      currentPath: window.location.pathname 
    });
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Setting user:', parsedUser);
        setUser(parsedUser);
        loadCourses();
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser({ name: 'B Jaswanth', role: 'faculty' }); // Fallback
        setLoading(false);
      }
    } else {
      console.log('No user data, setting fallback user');
      setUser({ name: 'B Jaswanth', role: 'faculty' }); // Fallback for testing
      setLoading(false);
    }
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found for API call');
        showToast('Authentication required', 'error');
        navigate('/');
        return;
      }
      
      const response = await fetch('/api/courses/my-courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data);
        console.log('Courses loaded successfully:', data.data.length);
      } else {
        const errorData = await response.json();
        console.error('Failed to load courses:', errorData);
        showToast(errorData.message || 'Failed to load courses', 'error');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      showToast('Error loading courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = (message) => {
    setToast({ show: true, message, type: 'success' });
    loadCourses(); // Refresh course list
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        showToast('Course deleted successfully', 'success');
        loadCourses();
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to delete course', 'error');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast('Error deleting course', 'error');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <FacultyLayout user={user}>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600">Manage your courses and course materials</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Course
          </button>
        </div>

        {/* Course Management Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Management</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : courses.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem'
              }}>
                {courses.map((course) => (
                  <div 
                    key={course._id} 
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      transition: 'box-shadow 0.2s',
                      backgroundColor: 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                          {course.title}
                        </h3>
                        <span style={{
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {course.department}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0' }}>
                        {course.code}
                      </p>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid #f3f4f6'
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        👥 {course.enrolledStudents?.length || 0} students
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => navigate(`/faculty/courses/${course._id}`)}
                          style={{
                            color: '#2563eb',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem 0.5rem'
                          }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id, course.title)}
                          style={{
                            color: '#dc2626',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem 0.5rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-6">Create your first course to get started</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Your First Course
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Course Statistics */}
        {courses.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.reduce((total, course) => total + (course.enrolledStudents?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Credits</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.reduce((total, course) => total + course.credits, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Modal */}
      <CourseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCourseCreated}
      />

      {/* Toast Notification */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </FacultyLayout>
  );
};

export default FacultyCoursesPage;