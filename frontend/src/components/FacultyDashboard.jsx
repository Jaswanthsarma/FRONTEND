import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from './FacultyLayout';
import CourseModal from './CourseModal';
import Toast from './Toast';

const FacultyDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    courses: 0,
    students: 0,
    pendingTasks: 0,
    completedQuizzes: 0
  });
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(true);

  const [recentNotifications] = useState([
    {
      id: 1,
      title: 'New Assignment Submission',
      text: 'John Doe submitted Assignment 1 for Mathematics 101',
      time: '2 hours ago',
      icon: '📄'
    },
    {
      id: 2,
      title: 'Quiz Results Available',
      text: 'Midterm Quiz results are ready for review',
      time: '4 hours ago',
      icon: '📊'
    },
    {
      id: 3,
      title: 'Course Update Required',
      text: 'Please update course materials for Advanced Calculus',
      time: '1 day ago',
      icon: '📚'
    }
  ]);

  const [upcomingEvents] = useState([]);

  const [holidays] = useState([
    { date: 14, title: 'Valentine\'s Day', type: 'holiday' },
    { date: 20, title: 'Presidents Day', type: 'holiday' },
    { date: 26, title: 'Republic Day', type: 'holiday' }
  ]);

  useEffect(() => {
    // Load dashboard data
    loadDashboardData();
    loadCourses();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Load real data from APIs
      let coursesCount = 0;
      let quizzesCount = 0;
      let assignmentsCount = 0;
      let studentRequestsCount = 0;
      
      // Get courses count
      try {
        const coursesResponse = await fetch('http://localhost:5000/api/courses/my-courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          coursesCount = coursesData.data?.length || 0;
        }
      } catch (err) {
        console.error('Error loading courses:', err);
      }
      
      // Get quizzes count
      try {
        const quizzesResponse = await fetch('http://localhost:5000/api/quizzes/faculty', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json();
          quizzesCount = quizzesData.data?.quizzes?.length || 0;
        }
      } catch (err) {
        console.error('Error loading quizzes:', err);
      }
      
      // Get assignments count
      try {
        const assignmentsResponse = await fetch('http://localhost:5000/api/assignments/faculty', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          assignmentsCount = assignmentsData.data?.length || 0;
        }
      } catch (err) {
        console.error('Error loading assignments:', err);
      }
      
      // Get student requests count
      try {
        const requestsResponse = await fetch('http://localhost:5000/api/faculty-requests/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          studentRequestsCount = requestsData.data?.length || 0;
        }
      } catch (err) {
        console.error('Error loading student requests:', err);
      }
      
      setDashboardData({
        courses: coursesCount,
        students: studentRequestsCount,
        pendingTasks: assignmentsCount,
        completedQuizzes: quizzesCount
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/courses/my-courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data);
        setDashboardData(prev => ({
          ...prev,
          courses: data.data.length
        }));
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleCourseCreated = (message) => {
    setToast({ show: true, message, type: 'success' });
    loadCourses(); // Refresh course list
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Find 4th Saturday of the month
    let saturdayCount = 0;
    let fourthSaturday = null;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      if (date.getDay() === 6) { // Saturday
        saturdayCount++;
        if (saturdayCount === 4) {
          fourthSaturday = day;
          break;
        }
      }
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();
      const isSunday = dayOfWeek === 0;
      const isFourthSaturday = day === fourthSaturday;
      const isHoliday = holidays.some(holiday => holiday.date === day);
      const isToday = day === today.getDate();
      const isWeekend = isSunday || isFourthSaturday;
      
      days.push({ day, isHoliday, isToday, isWeekend, isSunday, isFourthSaturday });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonth = monthNames[new Date().getMonth()];

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Faculty Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.name}!</p>
        </div>

        {/* Navigation Cards - Redesigned */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* My Courses Card */}
          <div 
            onClick={() => navigate('/faculty/courses')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: '1.75rem' }}>📚</span>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  Active
                </div>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                MY COURSES
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                {dashboardData.courses}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>View and manage courses</span>
                <span style={{ fontSize: '1rem' }}>→</span>
              </div>
            </div>
          </div>

          {/* Quizzes Card */}
          <div 
            onClick={() => navigate('/faculty/quizzes')}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(240, 147, 251, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: '1.75rem' }}>📋</span>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  Live
                </div>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                QUIZZES
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                {dashboardData.completedQuizzes}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>Create and manage quizzes</span>
                <span style={{ fontSize: '1rem' }}>→</span>
              </div>
            </div>
          </div>

          {/* Assignments Card */}
          <div 
            onClick={() => navigate('/faculty/assignments')}
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(79, 172, 254, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: '1.75rem' }}>📄</span>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  Pending
                </div>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                ASSIGNMENTS
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                {dashboardData.pendingTasks}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>Manage assignments</span>
                <span style={{ fontSize: '1rem' }}>→</span>
              </div>
            </div>
          </div>

          {/* Student Requests Card */}
          <div 
            onClick={() => navigate('/faculty/student-requests')}
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(250, 112, 154, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: '1.75rem' }}>👥</span>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  New
                </div>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                STUDENT REQUESTS
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                {dashboardData.students}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>Review student requests</span>
                <span style={{ fontSize: '1rem' }}>→</span>
              </div>
            </div>
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
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: dayData?.isToday ? '700' : '400',
                      backgroundColor: dayData?.isToday 
                        ? '#3b82f6' 
                        : dayData?.isWeekend 
                        ? '#f1f5f9' 
                        : 'transparent',
                      color: dayData?.isToday 
                        ? 'white' 
                        : dayData?.isWeekend 
                        ? '#94a3b8' 
                        : '#374151',
                      border: dayData?.isToday 
                        ? '2px solid #2563eb' 
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

          {/* My Courses */}
          <div className="widget-card">
            <div className="widget-header">
              <h3 className="widget-title">My Courses</h3>
              <span 
                className="widget-action"
                onClick={() => navigate('/faculty/courses')}
              >
                View All
              </span>
            </div>
            <div className="widget-content">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Loading courses...
                </div>
              ) : courses.length > 0 ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {courses.slice(0, 3).map(course => (
                    <div 
                      key={course._id} 
                      style={{
                        padding: '1rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => navigate(`/faculty/courses/${course._id}`)}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1f2937' }}>
                            {course.title}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            {course.code} • {course.credits} Credits
                          </div>
                        </div>
                        <div style={{
                          background: '#dbeafe',
                          color: '#1d4ed8',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          Sem {course.semester}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {course.enrolledStudents?.length || 0} students enrolled
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2rem', 
                      color: '#64748b',
                      background: '#f8fafc',
                      borderRadius: '0.5rem',
                      border: '1px dashed #cbd5e1'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                      <div>No courses yet</div>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{
                          marginTop: '0.5rem',
                          color: '#3b82f6',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Create your first course
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: '#64748b',
                  background: '#f8fafc',
                  borderRadius: '0.5rem',
                  border: '1px dashed #cbd5e1'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                  <div>No courses yet</div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      marginTop: '0.5rem',
                      color: '#3b82f6',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Create your first course
                  </button>
                </div>
              )}
            </div>
          </div>
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
      </div>
    </FacultyLayout>
  );
};

export default FacultyDashboard;