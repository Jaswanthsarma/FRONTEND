import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import apiService from '../services/api';
import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: stateUser, isFirstLogin } = location.state || {};
  
  // Get user from localStorage if not in state
  const currentUser = stateUser || JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = currentUser?.role || 'student';
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const passwordData = {
        newPassword: formData.newPassword,
        ...((!isFirstLogin) && { currentPassword: formData.currentPassword })
      };

      const response = await apiService.changePassword(passwordData);
      
      if (response.success) {
        setSuccess('Password changed successfully! Redirecting...');
        
        // Redirect to role-specific dashboard
        setTimeout(() => {
          if (userRole === 'faculty') {
            navigate('/faculty/dashboard');
          } else if (userRole === 'student') {
            navigate('/student/dashboard');
          } else {
            navigate('/');
          }
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isFirstLogin) {
      // If first login, logout and go back to home
      apiService.logout();
      navigate('/');
    } else {
      // Otherwise go back to role-specific profile
      if (userRole === 'faculty') {
        navigate('/faculty/profile');
      } else if (userRole === 'student') {
        navigate('/student/profile');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="change-password-page">
      <Header />
      <main className="change-password-main">
        <div className="change-password-container">
          <div className="change-password-card">
            <div className="change-password-header">
              <div className="change-password-icon">🔒</div>
              <h1 className="change-password-title">
                {isFirstLogin 
                  ? 'Set New Password' 
                  : userRole === 'faculty' 
                    ? 'Faculty Password Update' 
                    : 'Student Password Update'}
              </h1>
              <p className="change-password-description">
                {isFirstLogin 
                  ? 'Please set a new password for your account'
                  : userRole === 'faculty'
                    ? 'Update your faculty account security credentials'
                    : 'Update your student account password securely'
                }
              </p>
            </div>

            <form className="change-password-form" onSubmit={handleSubmit}>
              {!isFirstLogin && (
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="form-input"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your current password"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="form-input"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your new password"
                  minLength="6"
                />
                <small className="form-hint">
                  Password must be at least 6 characters long
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your new password"
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  {success}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className="change-password-button btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
                
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  {isFirstLogin ? 'Logout' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangePasswordPage;