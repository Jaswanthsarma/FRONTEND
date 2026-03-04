import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalFaculties: 0,
    activeFaculties: 0,
    totalStudents: 0,
    activeStudents: 0,
    totalAdmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Admin Dashboard - Token check:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.log('❌ No token found, redirecting to admin auth');
        navigate('/admin/auth');
        return;
      }

      console.log('📡 Fetching admin stats...');
      const response = await fetch('/api/auth/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📊 Stats API response:', data);

      if (data.success) {
        console.log('✅ Stats fetched successfully:', data.data);
        setStats(data.data);
      } else {
        // If API fails, show default stats instead of error
        console.warn('⚠️ Failed to fetch stats from API, using default values:', data.message);
        setStats({
          totalFaculties: 0,
          activeFaculties: 0,
          totalStudents: 0,
          activeStudents: 0,
          totalAdmins: 1
        });
      }
    } catch (error) {
      // If network error, show default stats instead of error
      console.warn('❌ Network error while fetching stats, using default values:', error.message);
      setStats({
        totalFaculties: 0,
        activeFaculties: 0,
        totalStudents: 0,
        activeStudents: 0,
        totalAdmins: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCreateUser = () => {
    navigate('/admin/signup');
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <div className="admin-logo-section">
            <div className="admin-logo">🎓</div>
            <span className="admin-logo-text">Learning Management System</span>
          </div>
        </div>
      </div>

      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <h1>Admin Dashboard</h1>
            <p>System Overview & User Management</p>
          </div>
          <div className="admin-actions">
            <button onClick={handleCreateUser} className="create-user-btn">
              + Create User
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="stats-grid">
          <div className="stat-card faculty-card">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-content">
              <h3>Faculty Members</h3>
              <div className="stat-numbers">
                <span className="stat-main">{stats.totalFaculties}</span>
                <span className="stat-sub">Total</span>
              </div>
              <div className="stat-detail">
                <span className="active-count">{stats.activeFaculties} Active</span>
                <span className="inactive-count">
                  {stats.totalFaculties - stats.activeFaculties} Inactive
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card student-card">
            <div className="stat-icon">👨‍🎓</div>
            <div className="stat-content">
              <h3>Students</h3>
              <div className="stat-numbers">
                <span className="stat-main">{stats.totalStudents}</span>
                <span className="stat-sub">Total</span>
              </div>
              <div className="stat-detail">
                <span className="active-count">{stats.activeStudents} Active</span>
                <span className="inactive-count">
                  {stats.totalStudents - stats.activeStudents} Inactive
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card admin-card">
            <div className="stat-icon">👨‍💼</div>
            <div className="stat-content">
              <h3>Administrators</h3>
              <div className="stat-numbers">
                <span className="stat-main">{stats.totalAdmins}</span>
                <span className="stat-sub">Total</span>
              </div>
              <div className="stat-detail">
                <span className="system-info">System Owners</span>
              </div>
            </div>
          </div>

          <div className="stat-card total-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <div className="stat-numbers">
                <span className="stat-main">
                  {stats.totalFaculties + stats.totalStudents + stats.totalAdmins}
                </span>
                <span className="stat-sub">All Roles</span>
              </div>
              <div className="stat-detail">
                <span className="active-count">
                  {stats.activeFaculties + stats.activeStudents + stats.totalAdmins} Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-actions-section">
          <div className="action-card">
            <h3>User Management</h3>
            <p>Create and manage Faculty and Student accounts</p>
            <div className="action-buttons">
              <button onClick={handleCreateUser} className="action-btn primary">
                Create New User
              </button>
              <button onClick={() => navigate('/admin/users')} className="action-btn secondary">
                Manage Users
              </button>
            </div>
          </div>

          <div className="action-card">
            <h3>System Settings</h3>
            <p>Configure system-wide settings and preferences</p>
            <div className="action-buttons">
              <button onClick={() => navigate('/admin/settings')} className="action-btn secondary">
                System Settings
              </button>
              <button onClick={() => navigate('/admin/logs')} className="action-btn secondary">
                View Logs
              </button>
            </div>
          </div>
        </div>

        <div className="system-info-section">
          <div className="info-card">
            <h3>System Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">System Type:</span>
                <span className="info-value">Role-Based LMS</span>
              </div>
              <div className="info-item">
                <span className="info-label">Access Control:</span>
                <span className="info-value">Admin Controlled</span>
              </div>
              <div className="info-item">
                <span className="info-label">User Registration:</span>
                <span className="info-value">Admin Only</span>
              </div>
              <div className="info-item">
                <span className="info-label">Roles:</span>
                <span className="info-value">Admin, Faculty, Student</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminDashboardPage;