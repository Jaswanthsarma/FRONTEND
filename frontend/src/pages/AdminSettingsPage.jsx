import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './AdminSettingsPage.css';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    academicYear: '',
    departments: [],
    semesters: []
  });
  const [newDepartment, setNewDepartment] = useState('');
  const [newSemester, setNewSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin/auth');
        return;
      }

      const response = await fetch('/api/system/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSettings({
          academicYear: data.data.academicYear || '',
          departments: data.data.departments || [],
          semesters: data.data.semesters || []
        });
      } else {
        console.warn('Failed to fetch settings:', data.message);
        // If no settings exist, show default empty state
        setSettings({
          academicYear: '2026-27',
          departments: ['CSE', 'ECE', 'MECH', 'IT', 'CIVIL'],
          semesters: [1, 2, 3, 4, 5, 6, 7, 8]
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load system settings. Using default values.');
      // Show default settings on error
      setSettings({
        academicYear: '2026-27',
        departments: ['CSE', 'ECE', 'MECH', 'IT', 'CIVIL'],
        semesters: [1, 2, 3, 4, 5, 6, 7, 8]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = () => {
    const dept = newDepartment.trim().toUpperCase();
    if (dept && !settings.departments.includes(dept)) {
      setSettings(prev => ({
        ...prev,
        departments: [...prev.departments, dept]
      }));
      setNewDepartment('');
    }
  };

  const handleRemoveDepartment = (department) => {
    setSettings(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== department)
    }));
  };

  const handleAddSemester = () => {
    const semesterNum = parseInt(newSemester);
    if (semesterNum && semesterNum > 0 && semesterNum <= 12 && !settings.semesters.includes(semesterNum)) {
      setSettings(prev => ({
        ...prev,
        semesters: [...prev.semesters, semesterNum].sort((a, b) => a - b)
      }));
      setNewSemester('');
    }
  };

  const handleRemoveSemester = (semester) => {
    setSettings(prev => ({
      ...prev,
      semesters: prev.semesters.filter(s => s !== semester)
    }));
  };

  const handleAcademicYearChange = (e) => {
    setSettings(prev => ({
      ...prev,
      academicYear: e.target.value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Validate academic year format
      if (!/^\d{4}[-–]\d{2,4}$/.test(settings.academicYear)) {
        setError('Academic year must be in format YYYY-YY (e.g., 2026-27)');
        setSaving(false);
        return;
      }

      // Validate departments
      if (settings.departments.length === 0) {
        setError('At least one department is required');
        setSaving(false);
        return;
      }

      // Validate semesters
      if (settings.semesters.length === 0) {
        setError('At least one semester is required');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/system/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('System settings saved successfully!');
        // Refresh the settings to show updated data
        fetchSettings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      setError('Network error while saving settings. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-settings-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
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
            <h1>System Settings</h1>
            <p>Configure system-wide academic and access settings</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Academic Settings Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>📚 Academic Settings</h2>
          </div>
          
          <div className="settings-grid">
            {/* Departments Management */}
            <div className="setting-card">
              <h3>Manage Departments</h3>
              <div className="department-list">
                {settings.departments.map(department => (
                  <div key={department} className="department-item">
                    <span>{department}</span>
                    <button 
                      onClick={() => handleRemoveDepartment(department)}
                      className="remove-btn"
                      title="Remove Department"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-item-form">
                <input
                  type="text"
                  placeholder="Enter new department"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
                />
                <button onClick={handleAddDepartment} className="add-btn">
                  Add
                </button>
              </div>
            </div>

            {/* Semesters Management */}
            <div className="setting-card">
              <h3>Manage Semesters</h3>
              <div className="semester-list">
                {settings.semesters.map(semester => (
                  <div key={semester} className="semester-item">
                    <span>Semester {semester}</span>
                    <button 
                      onClick={() => handleRemoveSemester(semester)}
                      className="remove-btn"
                      title="Remove Semester"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-item-form">
                <input
                  type="number"
                  placeholder="Semester number (1-12)"
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSemester()}
                  min="1"
                  max="12"
                />
                <button onClick={handleAddSemester} className="add-btn">
                  Add
                </button>
              </div>
            </div>

            {/* Academic Year */}
            <div className="setting-card">
              <h3>Academic Year</h3>
              <input
                type="text"
                value={settings.academicYear}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  academicYear: e.target.value
                }))}
                placeholder="e.g., 2024-2025"
                className="year-input"
              />
            </div>
          </div>
        </div>

        {/* User Access Rules Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🔐 User Access Rules</h2>
            <span className="read-only-badge">READ-ONLY</span>
          </div>
          
          <div className="settings-grid">
            <div className="setting-card read-only">
              <h3>User Registration</h3>
              <div className="read-only-value">
                <span className="value-label">Admin Only</span>
                <p className="value-description">Only administrators can create user accounts</p>
              </div>
            </div>

            <div className="setting-card read-only">
              <h3>Available Roles</h3>
              <div className="roles-list">
                <div className="role-item">
                  <span className="role-badge admin">Admin</span>
                  <span className="role-desc">System Owner</span>
                </div>
                <div className="role-item">
                  <span className="role-badge faculty">Faculty</span>
                  <span className="role-desc">Teachers & Instructors</span>
                </div>
                <div className="role-item">
                  <span className="role-badge student">Student</span>
                  <span className="role-desc">Learners</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🛡️ Security Settings</h2>
            <span className="basic-badge">BASIC</span>
          </div>
          
          <div className="settings-grid">
            <div className="setting-card read-only">
              <h3>Password Requirements</h3>
              <div className="security-info">
                <div className="security-item">
                  <span className="security-label">Minimum Length:</span>
                  <span className="security-value">{settings.passwordMinLength} characters</span>
                </div>
                <div className="security-item">
                  <span className="security-label">Requirements:</span>
                  <span className="security-value">Letters and numbers</span>
                </div>
              </div>
            </div>

            <div className="setting-card read-only">
              <h3>Session Management</h3>
              <div className="security-info">
                <div className="security-item">
                  <span className="security-label">Session Timeout:</span>
                  <span className="security-value">{settings.sessionTimeout} minutes</span>
                </div>
                <div className="security-item">
                  <span className="security-label">Auto Logout:</span>
                  <span className="security-value">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="save-section">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <button 
            onClick={handleSaveSettings} 
            className="save-settings-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminSettingsPage;