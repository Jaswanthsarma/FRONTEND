import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const FacultyNotificationsPage = () => {
  const user = apiService.getCurrentUser();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Sample notifications including student submissions
    setNotifications([
      { 
        id: 1, 
        title: 'New Assignment Submission', 
        message: 'Kannaya submitted Data Structures Assignment 1', 
        time: '10 minutes ago', 
        type: 'submission', 
        read: false,
        link: '/faculty/assignments'
      },
      { 
        id: 2, 
        title: 'Student Request', 
        message: 'New student request to join your class', 
        time: '1 hour ago', 
        type: 'request', 
        read: false,
        link: '/faculty/student-requests'
      },
      { 
        id: 3, 
        title: 'Assignment Submission', 
        message: 'Rahul Kumar submitted Database Project', 
        time: '2 hours ago', 
        type: 'submission', 
        read: true,
        link: '/faculty/assignments'
      },
      { 
        id: 4, 
        title: 'Course Created', 
        message: 'Successfully created new course: Web Development', 
        time: '1 day ago', 
        type: 'course', 
        read: true,
        link: '/faculty/courses'
      },
      { 
        id: 5, 
        title: 'Assignment Submission', 
        message: 'Priya Singh submitted OS Assignment 2', 
        time: '2 days ago', 
        type: 'submission', 
        read: true,
        link: '/faculty/assignments'
      }
    ]);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      submission: '📝',
      request: '👤',
      course: '📚',
      quiz: '🎯',
      alert: '⚠️'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type) => {
    const colors = {
      submission: '#3b82f6',
      request: '#8b5cf6',
      course: '#22c55e',
      quiz: '#f59e0b',
      alert: '#ef4444'
    };
    return colors[type] || '#64748b';
  };

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Notifications</h1>
          <p className="dashboard-subtitle">View all your notifications and updates</p>
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
    </FacultyLayout>
  );
};

export default FacultyNotificationsPage;