import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const CreateAssignmentPage = () => {
  const user = apiService.getCurrentUser();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 0, 0);
    return nextWeek.toISOString().slice(0, 16);
  };

  const getDefaultLateDeadline = () => {
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    twoWeeks.setHours(23, 59, 0, 0);
    return twoWeeks.toISOString().slice(0, 16);
  };

  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    course: '',
    assignmentType: 'file_upload',
    totalMarks: 100,
    startDate: '',
    dueDate: '',
    allowLateSubmission: false,
    lateSubmissionDeadline: ''
  });

  useEffect(() => {
    setAssignmentData(prev => ({
      ...prev,
      startDate: getTomorrowDate(),
      dueDate: getNextWeekDate(),
      lateSubmissionDeadline: getDefaultLateDeadline()
    }));
    
    // Load faculty courses
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await apiService.getMyCourses();
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAssignmentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setAssignmentFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!assignmentData.title.trim()) {
      setError('Assignment title is required');
      return;
    }
    
    if (!assignmentData.description.trim()) {
      setError('Assignment description is required');
      return;
    }
    
    if (!assignmentData.course.trim()) {
      setError('Course name is required');
      return;
    }

    if (!assignmentFile) {
      setError('Please upload an assignment file');
      return;
    }

    // Validate dates
    const startDate = new Date(assignmentData.startDate);
    const dueDate = new Date(assignmentData.dueDate);
    const now = new Date();

    if (startDate <= now) {
      setError('Start date must be in the future');
      return;
    }

    if (dueDate <= startDate) {
      setError('Due date must be after start date');
      return;
    }

    if (assignmentData.allowLateSubmission) {
      if (!assignmentData.lateSubmissionDeadline) {
        setError('Late submission deadline is required when late submissions are allowed');
        return;
      }
      
      const lateDeadline = new Date(assignmentData.lateSubmissionDeadline);
      if (lateDeadline <= dueDate) {
        setError('Late submission deadline must be after due date');
        return;
      }
    }

    try {
      setLoading(true);
      console.log('Creating assignment with file...');
      
      // Create assignment with file
      const response = await apiService.createAssignment(assignmentData, assignmentFile);
      
      if (response.success) {
        console.log('Assignment created successfully:', response.data.assignment._id);
        
        // Show success and navigate
        navigate('/faculty/assignments', { 
          state: { message: 'Assignment created successfully with file attachment!' }
        });
      } else {
        console.error('Assignment creation failed:', response);
        if (response.errors && Array.isArray(response.errors)) {
          const errorMessages = response.errors.map(err => err.msg || err.message).join(', ');
          setError(`Validation failed: ${errorMessages}`);
        } else {
          setError(response.message || 'Failed to create assignment');
        }
      }
    } catch (err) {
      console.error('Assignment creation error:', err);
      setError(err.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Create Assignment</h1>
          <p className="dashboard-subtitle">Create a new assignment with file attachment</p>
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

        <div className="widget-card">
          <div className="widget-content">
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={assignmentData.title}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter assignment title"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={assignmentData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                    placeholder="Enter assignment description and instructions"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Course *
                  </label>
                  {loadingCourses ? (
                    <div style={{ padding: '0.75rem', color: '#64748b' }}>Loading courses...</div>
                  ) : courses.length === 0 ? (
                    <div style={{ padding: '0.75rem', color: '#dc2626' }}>
                      No courses found. Please create a course first.
                    </div>
                  ) : (
                    <select
                      name="course"
                      value={assignmentData.course}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        background: 'white'
                      }}
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course._id} value={course._id}>
                          {course.title} ({course.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={assignmentData.totalMarks}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="1000"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={assignmentData.startDate}
                      onChange={handleInputChange}
                      min={getTomorrowDate()}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                      Due Date *
                    </label>
                    <input
                      type="datetime-local"
                      name="dueDate"
                      value={assignmentData.dueDate}
                      onChange={handleInputChange}
                      min={getNextWeekDate()}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="allowLateSubmission"
                      checked={assignmentData.allowLateSubmission}
                      onChange={handleInputChange}
                    />
                    Allow Late Submission
                  </label>
                </div>

                {assignmentData.allowLateSubmission && (
                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                      Late Submission Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      name="lateSubmissionDeadline"
                      value={assignmentData.lateSubmissionDeadline}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                )}

                <div style={{
                  border: '2px dashed #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  background: '#f9fafb'
                }}>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Assignment File * (PDF, DOCX, or other documents)
                  </label>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                    Upload the assignment document that students will download and complete. Max file size: 10MB
                  </p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.zip"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      background: 'white'
                    }}
                  />
                  {assignmentFile && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: '#dcfce7',
                      border: '1px solid #86efac',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#166534'
                    }}>
                      ✓ File selected: {assignmentFile.name} ({(assignmentFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/faculty/assignments')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      background: loading ? '#9ca3af' : '#10b981',
                      color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    {loading ? 'Creating Assignment...' : '📤 Create Assignment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default CreateAssignmentPage;
