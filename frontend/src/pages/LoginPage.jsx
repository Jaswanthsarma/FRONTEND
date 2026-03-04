import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import apiService from '../services/api';
import './LoginPage.css';

const LoginPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine role from URL path if not in params
  const getCurrentRole = () => {
    if (role) return role;
    
    const path = location.pathname;
    if (path.includes('/login/faculty')) return 'faculty';
    if (path.includes('/login/student')) return 'student';
    return null;
  };

  const currentRoleType = getCurrentRole();

  const roleConfig = {
    admin: {
      title: 'Admin Login',
      icon: '👨‍💼',
      description: 'Access admin dashboard'
    },
    faculty: {
      title: 'Faculty Login',
      icon: '👨‍🏫',
      description: 'Access faculty dashboard'
    },
    student: {
      title: 'Student Login',
      icon: '👨‍🎓',
      description: 'Access student dashboard'
    }
  };

  const currentRole = roleConfig[currentRoleType];

  // If invalid role, redirect to home
  if (!currentRole) {
    navigate('/');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginData = {
        username: formData.username,
        password: formData.password
      };

      const response = await apiService.login(loginData);
      
      if (response.success) {
        // Role-based navigation
        const userRole = response.data.user.role;
        if (userRole === 'faculty') {
          navigate('/faculty/dashboard');
        } else if (userRole === 'student') {
          navigate('/dashboard/student'); // Keep existing student dashboard for now
        } else {
          navigate(`/dashboard/${userRole}`);
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <Header />
      <main className="login-main">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">{currentRole.icon}</div>
              <h1 className="login-title">{currentRole.title}</h1>
              <p className="login-description">{currentRole.description}</p>
              {(currentRoleType === 'faculty' || currentRoleType === 'student') && (
                <p className="account-note">Account created by Admin.</p>
              )}
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-button btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <button
                type="button"
                className="back-button"
                onClick={handleBackToHome}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;