import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        
        // Navigate based on user role
        if (user.role === 'faculty') {
          navigate('/faculty/dashboard');
        } else if (user.role === 'student') {
          navigate('/dashboard/student');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        // If there's an error parsing user data, go to home
        navigate('/');
      }
    } else {
      // If no user data, go to home
      navigate('/');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={handleLogoClick}>
          <div className="logo-icon">📚</div>
          <span className="logo-text">Learning Management System</span>
        </div>
      </div>
    </header>
  );
};

export default Header;