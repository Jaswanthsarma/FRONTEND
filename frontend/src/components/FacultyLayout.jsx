import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import Footer from './Footer';
import './FacultyLayout.css';

const FacultyLayout = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount] = useState(3); // Mock notification count

  const menuItems = [
    { id: 'courses', label: 'My Courses', icon: '📚', path: '/faculty/courses' },
    { id: 'quizzes', label: 'Quizzes', icon: '📋', path: '/faculty/quizzes' },
    { id: 'assignments', label: 'Assignments', icon: '📄', path: '/faculty/assignments' },
    { id: 'student-requests', label: 'Student Requests', icon: '👥', path: '/faculty/student-requests' },
    { id: 'profile', label: 'My Profile', icon: '👤', path: '/faculty/profile' }
  ];

  const handleLogout = async () => {
    try {
      await apiService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      apiService.removeAuthToken();
      navigate('/');
    }
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const isActiveMenu = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="faculty-layout">
      {/* Top Header */}
      <header className="faculty-header">
        <div className="header-left">
          <div className="logo" onClick={() => navigate('/faculty/dashboard')}>
            <span className="logo-icon">📚</span>
            <span className="logo-text">Learning Management System</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="notification-icon" onClick={() => navigate('/faculty/notifications')}>
            <span className="icon">🔔</span>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>
          
          <div className="user-profile" onClick={() => navigate('/faculty/profile')} style={{ cursor: 'pointer' }}>
            <div className="avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <span className="user-name">{user?.name || 'B Jaswanth'}</span>
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            <span className="icon">🚪</span>
            Logout
          </button>
        </div>
      </header>

      <div className="faculty-body">
        {/* Main Content Area - Full Width */}
        <main className="faculty-main" style={{ marginLeft: 0, width: '100%' }}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FacultyLayout;