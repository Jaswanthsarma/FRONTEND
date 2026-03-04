import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './AdminUsersPage.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    user: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin/auth');
        return;
      }

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      setError('Network error while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filter by role
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Filter by status
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateUser = () => {
    navigate('/admin/signup');
  };

  const handleEditUser = (user) => {
    setEditModal({
      isOpen: true,
      user: { ...user }
    });
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('Are you sure you want to reset this user\'s password?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${userId}/reset-password`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          alert(`Password reset successfully. New password: ${data.data.newPassword}`);
        } else {
          const data = await response.json();
          alert(`Failed to reset password: ${data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Network error while resetting password. Please try again.');
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          alert(`User "${userName}" has been deleted successfully.`);
          fetchUsers(); // Refresh the list
        } else {
          const data = await response.json();
          alert(`Failed to delete user: ${data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Network error while deleting user. Please try again.');
      }
    }
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      user: null
    });
  };

  const handleSaveUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${editModal.user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editModal.user)
      });

      if (response.ok) {
        fetchUsers();
        closeEditModal();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
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
            <h1>Manage Users</h1>
            <p>View, edit, enable or disable Faculty and Student accounts</p>
          </div>
          <button onClick={handleCreateUser} className="create-user-btn">
            + Create User
          </button>
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
              <option value="all">All</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div className="filter-group search-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by username or name"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No users found</h3>
            <p>Click 'Create User' to add Faculty or Students.</p>
            <button onClick={handleCreateUser} className="empty-action-btn">
              + Create User
            </button>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'disabled'}`}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="action-btn edit-btn"
                          title="Edit User"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          className={`action-btn ${user.isActive ? 'disable-btn' : 'enable-btn'}`}
                          title={user.isActive ? 'Disable User' : 'Enable User'}
                        >
                          {user.isActive ? '🚫' : '✅'}
                        </button>
                        <button 
                          onClick={() => handleResetPassword(user.id)}
                          className="action-btn reset-btn"
                          title="Reset Password"
                        >
                          🔑
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="action-btn delete-btn"
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={closeEditModal} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editModal.user.name}
                  onChange={(e) => setEditModal(prev => ({
                    ...prev,
                    user: { ...prev.user, name: e.target.value }
                  }))}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editModal.user.email}
                  onChange={(e) => setEditModal(prev => ({
                    ...prev,
                    user: { ...prev.user, email: e.target.value }
                  }))}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editModal.user.phoneNumber}
                  onChange={(e) => setEditModal(prev => ({
                    ...prev,
                    user: { ...prev.user, phoneNumber: e.target.value }
                  }))}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editModal.user.isActive ? 'active' : 'disabled'}
                  onChange={(e) => setEditModal(prev => ({
                    ...prev,
                    user: { ...prev.user, isActive: e.target.value === 'active' }
                  }))}
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeEditModal} className="cancel-btn">Cancel</button>
              <button onClick={handleSaveUser} className="save-btn">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminUsersPage;