import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyDashboard from '../../components/FacultyDashboard';
import apiService from '../../services/api';

const FacultyDashboardPage = () => {
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
        
        // Check if user is faculty
        if (currentUser.role !== 'faculty') {
          navigate(`/dashboard/${currentUser.role}`);
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
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.125rem',
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <FacultyDashboard user={user} />;
};

export default FacultyDashboardPage;