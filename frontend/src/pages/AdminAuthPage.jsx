import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAuthPage.css';

const AdminAuthPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simple password check - use "admin123" as the password
      if (formData.password === 'admin123') {
        // Create secure token and user data
        const secureToken = 'admin-secure-token-2024';
        const adminUser = {
          id: 'admin-id',
          username: 'admin',
          name: 'System Administrator',
          role: 'admin'
        };
        
        localStorage.setItem('token', secureToken);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('lms_token', secureToken);
        localStorage.setItem('lms_user', JSON.stringify(adminUser));
        navigate('/admin/dashboard');
      } else {
        setError('Invalid password. Use: admin123');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-container">
        <div className="admin-auth-header">
          <h1>Admin Panel</h1>
          <p>System Owner Access</p>
        </div>

        <form onSubmit={handleAdminLogin} className="admin-form" autoComplete="off">
          <h2>Admin Login</h2>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder=""
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder=""
              autoComplete="current-password"
              data-form-type="other"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div className="back-link">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;