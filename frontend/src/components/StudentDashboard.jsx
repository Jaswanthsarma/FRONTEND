import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from './StudentLayout';
import apiService from '../services/api';
import '../pages/DashboardPage.css';

const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    enrolledCourses: 0,
    pendingAssignments: 0,
    completedQuizzes: 0
  });
  
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showQuizzesModal, setShowQuizzesModal] = useState(false);
  
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load enrolled courses only
      const coursesResponse = await apiService.getEnrolledCourses();
      const coursesData = coursesResponse.success ? coursesResponse.data || [] : [];
      setCourses(coursesData);
      
      // Load assignments
      const assignmentsResponse = await apiService.getStudentAssignments();
      const assignmentsData = assignmentsResponse.success ? assignmentsResponse.data || [] : [];
      // Filter for pending assignments (not submitted)
      const pendingAssignments = assignmentsData.filter(a => !a.hasSubmission);
      setAssignments(pendingAssignments);
      
      // Load PDF quiz history
      const pdfHistoryResponse = await apiService.getPdfHistory();
      const pdfHistory = pdfHistoryResponse.success ? pdfHistoryResponse.data || [] : [];
      setQuizHistory(pdfHistory);
      
      setDashboardData({
        enrolledCourses: coursesData.length,
        pendingAssignments: pendingAssignments.length,
        completedQuizzes: pdfHistory.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values on error
      setDashboardData({
        enrolledCourses: 0,
        pendingAssignments: 0,
        completedQuizzes: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCoursesClick = () => {
    setShowCoursesModal(true);
  };

  const handleAssignmentsClick = () => {
    setShowAssignmentsModal(true);
  };

  const handleQuizzesClick = () => {
    setShowQuizzesModal(true);
  };

  const handleViewQuizDetails = (historyId) => {
    navigate('/student/upload-pdf', { state: { historyId } });
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayDate = today.getDate();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      const isSunday = dayOfWeek === 0;
      
      // Only highlight today if it's the current day, month, and year
      const isToday = (
        day === todayDate && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear()
      );
      
      const isWeekend = isSunday;
      
      days.push({ day, isToday, isWeekend });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[new Date().getMonth()];

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Student Dashboard</h1>
          <p className="dashboard-subtitle">Track your academic progress</p>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div 
            className="summary-card"
            onClick={() => navigate('/student/courses')}
            style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
          >
            <div className="summary-card-header">
              <span className="summary-card-title">Enrolled Courses</span>
              <span className="summary-card-icon">📚</span>
            </div>
            <div className="summary-card-value">{dashboardData.enrolledCourses}</div>
          </div>

          <div 
            className="summary-card"
            onClick={() => navigate('/student/assignments')}
            style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
          >
            <div className="summary-card-header">
              <span className="summary-card-title">Pending Assignments</span>
              <span className="summary-card-icon">📝</span>
            </div>
            <div className="summary-card-value">{dashboardData.pendingAssignments}</div>
          </div>

          <div 
            className="summary-card"
            onClick={() => navigate('/student/quizzes')}
            style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
          >
            <div className="summary-card-header">
              <span className="summary-card-title">Completed Quizzes</span>
              <span className="summary-card-icon">🎯</span>
            </div>
            <div className="summary-card-value">{dashboardData.completedQuizzes}</div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Calendar Widget */}
          <div className="widget-card calendar-widget">
            <div className="widget-header">
              <h3 className="widget-title">Academic Calendar</h3>
            </div>
            <div className="widget-content">
              <div className="calendar-header">
                <div className="calendar-month">{currentMonth} 2026</div>
              </div>
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-day-header" style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#64748b',
                    textAlign: 'center',
                    padding: '0.5rem 0'
                  }}>
                    {day}
                  </div>
                ))}
                {calendarDays.map((dayData, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: dayData?.isToday ? '700' : '400',
                      backgroundColor: dayData?.isToday 
                        ? '#3b82f6' 
                        : dayData?.isWeekend 
                        ? '#fef3c7' 
                        : 'transparent',
                      color: dayData?.isToday 
                        ? 'white' 
                        : dayData?.isWeekend 
                        ? '#d97706' 
                        : '#374151',
                      border: dayData?.isToday 
                        ? '2px solid #1d4ed8' 
                        : '1px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {dayData?.day || ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">Quick Actions</h3>
            </div>
            <div className="widget-content">
              <div style={{ display: 'grid', gap: '1rem' }}>
                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/student/select-course')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: '#dbeafe',
                    border: '1px solid #3b82f6',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    color: '#1d4ed8',
                    fontWeight: '600'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🎓</span>
                  <span>Select Course</span>
                </button>
                
                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/student/assignments')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>📄</span>
                  <span style={{ fontWeight: '500' }}>View Assignments</span>
                </button>
                
                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/student/upload-pdf')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>📤</span>
                  <span style={{ fontWeight: '500' }}>Upload PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Modal */}
        {showCoursesModal && (
          <div className="modal-overlay" onClick={() => setShowCoursesModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📚 Enrolled Courses</h2>
                <button className="modal-close" onClick={() => setShowCoursesModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                ) : courses.length > 0 ? (
                  <div className="courses-grid">
                    {courses.map((course) => (
                      <div key={course._id} className="course-detail-card">
                        <div className="course-icon">📖</div>
                        <h3>{course.name}</h3>
                        <p className="course-code">Code: {course.code}</p>
                        <p className="course-faculty">Instructor: {course.faculty?.name || 'N/A'}</p>
                        <p className="course-semester">Semester: {course.semester || 'Current'}</p>
                        <div className="course-status">
                          <span className="status-badge active">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No courses enrolled yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assignments Modal */}
        {showAssignmentsModal && (
          <div className="modal-overlay" onClick={() => setShowAssignmentsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📝 Pending Assignments</h2>
                <button className="modal-close" onClick={() => setShowAssignmentsModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                ) : assignments.length > 0 ? (
                  <div className="assignments-list">
                    {assignments.map((assignment) => (
                      <div key={assignment._id} className="assignment-detail-card">
                        <div className="assignment-header">
                          <h3>{assignment.title}</h3>
                          <span className="priority-badge">
                            {new Date(assignment.dueDate) < new Date() ? '🔴 Overdue' : '🟡 Pending'}
                          </span>
                        </div>
                        <p className="assignment-course">Course: {assignment.course?.name || 'N/A'}</p>
                        <p className="assignment-due">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()} at{' '}
                          {new Date(assignment.dueDate).toLocaleTimeString()}
                        </p>
                        <p className="assignment-description">{assignment.description}</p>
                        <button 
                          className="btn-view-assignment"
                          onClick={() => {
                            setShowAssignmentsModal(false);
                            navigate('/student/assignments');
                          }}
                        >
                          View Details →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>🎉 No pending assignments!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quizzes Modal */}
        {showQuizzesModal && (
          <div className="modal-overlay" onClick={() => setShowQuizzesModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🎯 Completed Quizzes</h2>
                <button className="modal-close" onClick={() => setShowQuizzesModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                ) : quizHistory.length > 0 ? (
                  <div className="quizzes-list">
                    {quizHistory.map((quiz) => (
                      <div key={quiz._id} className="quiz-detail-card">
                        <div className="quiz-icon">📄</div>
                        <div className="quiz-info">
                          <h3>{quiz.filename}</h3>
                          <p className="quiz-date">
                            {new Date(quiz.uploadDate).toLocaleDateString()} at{' '}
                            {new Date(quiz.uploadDate).toLocaleTimeString()}
                          </p>
                          <div className="quiz-stats">
                            <span className="stat-item">
                              📝 {quiz.quiz?.totalQuestions || 0} Questions
                            </span>
                            <span className="stat-item">
                              📚 {quiz.summary?.topics?.length || 0} Topics
                            </span>
                          </div>
                        </div>
                        <button 
                          className="btn-view-quiz"
                          onClick={() => {
                            setShowQuizzesModal(false);
                            handleViewQuizDetails(quiz._id);
                          }}
                        >
                          View Results →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No quizzes completed yet</p>
                    <button 
                      className="btn-upload-pdf"
                      onClick={() => {
                        setShowQuizzesModal(false);
                        navigate('/student/upload-pdf');
                      }}
                    >
                      Upload PDF to Start →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
