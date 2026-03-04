import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import Footer from './Footer';
import './FacultyLayout.css'; // Reuse faculty layout styles

const StudentLayout = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount] = useState(3);

  const menuItems = [
    { id: 'courses', label: 'My Courses', icon: '📚', path: '/student/courses' },
    { id: 'select-course', label: 'Select Course', icon: '🎓', path: '/student/select-course' },
    { id: 'assignments', label: 'Assignments', icon: '📄', path: '/student/assignments' },
    { id: 'quizzes', label: 'Quizzes', icon: '📝', path: '/student/quizzes' },
    { id: 'profile', label: 'My Profile', icon: '👤', path: '/student/profile' },
    { id: 'upload-pdf', label: 'Upload PDF', icon: '📤', path: '/student/upload-pdf' }
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
          <div className="logo" onClick={() => navigate('/student/dashboard')}>
            <span className="logo-icon">📚</span>
            <span className="logo-text">Learning Management System</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="notification-icon" onClick={() => navigate('/student/notifications')}>
            <span className="icon">🔔</span>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>
          
          <div 
            className="user-profile"
            onClick={() => navigate('/student/profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className="avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <span className="user-name">{user?.name || 'Student'}</span>
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            <span className="icon">🚪</span>
            Logout
          </button>
        </div>
      </header>

      <div className="faculty-body">
        {/* Left Sidebar */}
        <aside className="faculty-sidebar">
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${isActiveMenu(item.path) ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="faculty-main">
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentLayout;
