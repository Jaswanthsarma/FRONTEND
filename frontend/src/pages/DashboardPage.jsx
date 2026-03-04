import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import StudentDashboard from '../components/StudentDashboard';
import FacultyDashboard from '../components/FacultyDashboard';
import AdminDashboard from '../components/AdminDashboard';
import apiService from '../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication and load user data
    const loadUserData = async () => {
      try {
        if (!apiService.isAuthenticated()) {
          navigate('/');
          return;
        }

        const currentUser = apiService.getCurrentUser();
        
        // Check if user role matches the dashboard role
        if (currentUser.role !== role) {
          navigate(`/dashboard/${currentUser.role}`);
          return;
        }

        // For faculty users, redirect to the new faculty dashboard
        if (currentUser.role === 'faculty') {
          navigate('/faculty/dashboard');
          return;
        }

        // For student users, redirect to the new student dashboard
        if (currentUser.role === 'student') {
          navigate('/student/dashboard');
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [role, navigate]);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local storage and redirect
      apiService.removeAuthToken();
      navigate('/');
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password', { 
      state: { 
        user: user,
        isFirstLogin: false 
      }
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="loading-message">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Render role-based dashboard component
  const renderDashboardContent = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard user={user} />;
      case 'faculty':
        return <FacultyDashboard user={user} />; // This won't be reached due to redirect above
      case 'admin':
        return <AdminDashboard user={user} />;
      default:
        return <StudentDashboard user={user} />;
    }
  };

  return (
    <div className="dashboard-page">
      <Header />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-actions">
            <button 
              className="change-password-button"
              onClick={handleChangePassword}
            >
              Change Password
            </button>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
          
          {renderDashboardContent()}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;