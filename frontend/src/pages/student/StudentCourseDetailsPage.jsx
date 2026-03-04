import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import apiService from '../../services/api';

const StudentCourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadCourseData();
    } else {
      navigate('/login');
    }
  }, [courseId, navigate]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load assignments
      const assignmentsResponse = await apiService.getCourseAssignments(courseId);
      if (assignmentsResponse.success) {
        setAssignments(assignmentsResponse.data || []);
      }
      
      // Load materials
      const materialsResponse = await apiService.getCourseMaterials(courseId);
      if (materialsResponse.success) {
        setMaterials(materialsResponse.data || []);
      }
      
      // Get course info from available courses
      const coursesResponse = await apiService.getAvailableCourses();
      if (coursesResponse.success) {
        const foundCourse = coursesResponse.data.find(c => c._id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading course data:', error);
      setError('Failed to load course data. You may not have access to this course.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownloadMaterial = async (material) => {
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/courses/${courseId}/materials/${material._id}/download`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to download material');
        return;
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create a temporary URL and download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = material.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      console.log('✅ Material downloaded:', material.fileName);
    } catch (error) {
      console.error('❌ Error downloading material:', error);
      setError('Failed to download material. Please try again.');
    }
  };

  const handleViewMaterial = async (material) => {
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/courses/${courseId}/materials/${material._id}/download`;
      
      // Open in new tab with authentication
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to view material');
        return;
      }

      // Get the blob and create object URL
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(blobUrl, '_blank');
      
      console.log('✅ Material opened:', material.fileName);
    } catch (error) {
      console.error('❌ Error viewing material:', error);
      setError('Failed to view material. Please try again.');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
          <div>
            <button
              onClick={() => navigate('/student/courses')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}
            >
              ← Back to My Courses
            </button>
            <h1 className="dashboard-title">{course?.title || 'Course Details'}</h1>
            <p className="dashboard-subtitle">
              {course?.code} • {course?.department} • Semester {course?.semester}
            </p>
          </div>
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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb'
        }}>
          {['overview', 'assignments', 'materials'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #3b82f6' : '3px solid transparent',
                color: activeTab === tab ? '#3b82f6' : '#64748b',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading course data...
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="widget-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Course Overview
                </h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <strong>Course Code:</strong> {course?.code}
                  </div>
                  <div>
                    <strong>Faculty:</strong> {course?.facultyId?.name || 'N/A'}
                  </div>
                  <div>
                    <strong>Department:</strong> {course?.department}
                  </div>
                  <div>
                    <strong>Semester:</strong> {course?.semester}
                  </div>
                  <div>
                    <strong>Credits:</strong> {course?.credits}
                  </div>
                  {course?.description && (
                    <div>
                      <strong>Description:</strong>
                      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
                        {course.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                  Course Assignments ({assignments.length})
                </h2>

                {assignments.length === 0 ? (
                  <div className="widget-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                    <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No Assignments Yet</h3>
                    <p style={{ color: '#64748b' }}>
                      Your instructor hasn't posted any assignments yet
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {assignments.map(assignment => (
                      <div key={assignment._id} className="widget-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                              {assignment.title}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                              {assignment.description}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                              <span>📅 Due: {formatDate(assignment.dueDate)}</span>
                              <span>📊 {assignment.totalMarks} marks</span>
                              <span>📝 {assignment.assignmentType}</span>
                            </div>
                          </div>
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
                              fontWeight: '600'
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                  Course Materials ({materials.length})
                </h2>

                {materials.length === 0 ? (
                  <div className="widget-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                    <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No Materials Yet</h3>
                    <p style={{ color: '#64748b' }}>
                      Your instructor hasn't uploaded any materials yet
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {materials.map(material => (
                      <div key={material._id} className="widget-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                              📄 {material.title}
                            </h3>
                            {material.description && (
                              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                                {material.description}
                              </p>
                            )}
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                              <span>📅 {formatDate(material.createdAt)}</span>
                              <span>📦 {formatFileSize(material.fileSize)}</span>
                              <span>👤 {material.facultyId?.name}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleViewMaterial(material)}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                              }}
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => handleDownloadMaterial(material)}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                              }}
                            >
                              📥 Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentCourseDetailsPage;
