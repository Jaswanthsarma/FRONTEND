import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';
import './FacultyProfilePage.css';

const FacultyProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      const currentUser = apiService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'faculty') {
        navigate('/');
        return;
      }

      // Fetch full user profile from API
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        // Fallback to localStorage user
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to localStorage user
      const currentUser = apiService.getCurrentUser();
      setUser(currentUser);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setMessage({ text: '', type: '' });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage({ text: '', type: '' });

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Password changed successfully!', type: 'success' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setIsChangingPassword(false);
        }, 2000);
      } else {
        setMessage({ text: data.message || 'Failed to change password', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <FacultyLayout user={user}>
      <div className="profile-page">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>

        <div className="profile-content">
          {/* Profile Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Profile Information</h2>
            </div>
            <div className="card-body">
              <div className="profile-avatar">
                <div className="avatar-large">
                  <span>👤</span>
                </div>
                <div className="profile-name">
                  <h3>{user.name}</h3>
                  <p className="role-badge">Faculty</p>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>Username</label>
                  <div className="info-value">{user.username}</div>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-item">
                  <label>Department</label>
                  <div className="info-value">{user.department}</div>
                </div>
                <div className="info-item">
                  <label>Academic Year</label>
                  <div className="info-value">{user.academicYear}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Security</h2>
            </div>
            <div className="card-body">
              {!isChangingPassword ? (
                <div className="security-info">
                  <div className="security-icon">🔒</div>
                  <p>Keep your account secure by changing your password regularly</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Confirm new password"
                    />
                  </div>

                  {message.text && (
                    <div className={`message ${message.type}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setMessage({ text: '', type: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultyProfilePage;
