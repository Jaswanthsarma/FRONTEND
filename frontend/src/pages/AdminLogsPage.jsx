import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './AdminLogsPage.css';

const AdminLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: 'all',
    action: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin/auth');
        return;
      }

      // Fetch real logs from API
      const response = await fetch('/api/activity-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data);
        console.log('✅ Activity logs loaded:', data.data.length);
      } else {
        console.error('Failed to fetch logs');
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filter by role
    if (filters.role !== 'all') {
      filtered = filtered.filter(log => log.userRole === filters.role);
    }

    // Filter by action
    if (filters.action !== 'all') {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(filters.action.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(filters.dateTo + ' 23:59:59')
      );
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getActionIcon = (action) => {
    if (action.includes('login')) return '🔐';
    if (action.includes('logout')) return '🚪';
    if (action.includes('created')) return '➕';
    if (action.includes('edited')) return '✏️';
    if (action.includes('disabled')) return '🚫';
    if (action.includes('enabled')) return '✅';
    return '📝';
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge ${status.toLowerCase()}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    return (
      <span className={`role-badge ${role}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="admin-logs-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading system logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-logs-page">
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <div className="admin-logo-section" onClick={() => navigate('/admin/dashboard')}>
            <div className="admin-logo">🎓</div>
            <span className="admin-logo-text">Learning Management System</span>
          </div>
        </div>
      </div>

      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title">
            <h1>System Logs</h1>
            <p>Track important system and user activities</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Filter by Role:</label>
            <select 
              value={filters.role} 
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Action:</label>
            <select 
              value={filters.action} 
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="created">Created</option>
              <option value="edited">Edited</option>
              <option value="disabled">Disabled</option>
              <option value="enabled">Enabled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date From:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date To:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No system activity recorded yet</h3>
            <p>System logs will appear here as users interact with the platform.</p>
          </div>
        ) : (
          <div className="logs-table-container">
            <div className="logs-summary">
              <span className="logs-count">
                Showing {filteredLogs.length} of {logs.length} log entries
              </span>
            </div>
            
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User Role</th>
                  <th>Username</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log._id}>
                    <td>
                      <div className="timestamp">
                        <span className="date">{new Date(log.createdAt).toLocaleDateString()}</span>
                        <span className="time">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td>{getRoleBadge(log.userRole)}</td>
                    <td>
                      <span className="username">{log.username}</span>
                    </td>
                    <td>
                      <div className="action">
                        <span className="action-icon">{getActionIcon(log.action)}</span>
                        <span className="action-text">{log.action}</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(log.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminLogsPage;