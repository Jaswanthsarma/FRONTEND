import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';

const StudentNotificationsPage = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadNotifications();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadNotifications = () => {
    // Sample notifications data - assignments and quizzes from faculty
    setNotifications([
      { id: 1, title: 'New Assignment: Data Structures Assignment 1', message: 'Due date: Feb 20, 2026', time: '2 hours ago', type: 'assignment', read: false, link: '/student/assignments' },
      { id: 2, title: 'New Quiz: Database Management Quiz', message: 'Available until: Feb 22, 2026', time: '3 hours ago', type: 'quiz', read: false, link: '/student/quizzes' },
      { id: 3, title: 'Assignment Graded: Web Development Lab', message: 'Your grade: 85/100', time: '5 hours ago', type: 'grade', read: false, link: '/student/assignments' },
      { id: 4, title: 'New Assignment: Database Project', message: 'Due date: Feb 25, 2026', time: '1 day ago', type: 'assignment', read: true, link: '/student/assignments' },
      { id: 5, title: 'Quiz Available: Operating Systems Quiz', message: 'Attempt before Feb 18, 2026', time: '1 day ago', type: 'quiz', read: true, link: '/student/quizzes' },
      { id: 6, title: 'Faculty Request Approved', message: 'Your request to join B Jaswanth\'s class has been approved', time: '2 days ago', type: 'request', read: true, link: '/student/select-faculty' }
    ]);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      assignment: '📝',
      grade: '📊',
      request: '✅',
      quiz: '🎯',
      alert: '⚠️'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type) => {
    const colors = {
      assignment: '#3b82f6',
      grade: '#22c55e',
      request: '#8b5cf6',
      quiz: '#f59e0b',
      alert: '#ef4444'
    };
    return colors[type] || '#64748b';
  };

  if (!user) return <div>Loading...</div>;

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Notifications</h1>
          <p className="dashboard-subtitle">Stay updated with your academic activities</p>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className="widget-card"
              onClick={() => navigate(notification.link)}
              style={{ 
                backgroundColor: notification.read ? 'white' : '#f0f9ff',
                border: notification.read ? '1px solid #e2e8f0' : '1px solid #bae6fd',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  fontSize: '2rem',
                  flexShrink: 0
                }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: getNotificationColor(notification.type),
                        borderRadius: '50%',
                        flexShrink: 0
                      }}></span>
                    )}
                  </div>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#64748b',
                    marginBottom: '0.5rem'
                  }}>
                    {notification.message}
                  </p>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#94a3b8'
                  }}>
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentNotificationsPage;
