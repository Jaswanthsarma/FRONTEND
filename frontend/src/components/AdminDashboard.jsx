import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [systemStats, setSystemStats] = useState({});

  useEffect(() => {
    // Load admin data (placeholder for now)
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Placeholder data - will be replaced with real API calls
      setUsers([
        { id: 1, name: 'Dr. Smith', email: 'smith@gmail.com', role: 'faculty', status: 'active' },
        { id: 2, name: 'Prof. Johnson', email: 'johnson@gmail.com', role: 'faculty', status: 'active' },
        { id: 3, name: 'John Doe', email: 'john@gmail.com', role: 'student', status: 'active' },
        { id: 4, name: 'Jane Smith', email: 'jane@gmail.com', role: 'student', status: 'active' }
      ]);

      setCourses([
        { id: 1, name: 'Mathematics 101', faculty: 'Dr. Smith', students: 25, status: 'active' },
        { id: 2, name: 'Physics 201', faculty: 'Prof. Johnson', students: 18, status: 'active' },
        { id: 3, name: 'Chemistry 101', faculty: 'Dr. Brown', students: 22, status: 'active' }
      ]);

      setSystemStats({
        totalUsers: 45,
        totalFaculty: 8,
        totalStudents: 36,
        totalCourses: 12,
        activeQuizzes: 24,
        totalQuizAttempts: 156
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleCreateUser = () => {
    navigate('/admin-signup');
  };

  const handleCreateCourse = () => {
    navigate('/course/create');
  };

  const handleManageUser = (userId) => {
    navigate(`/user/${userId}/manage`);
  };

  const handleAssignCourse = (courseId) => {
    navigate(`/course/${courseId}/assign`);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user.name}!</p>
      </div>

      <div className="dashboard-grid">
        {/* System Statistics */}
        <div className="dashboard-section">
          <h2>📊 System Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <div className="stat-value">{systemStats.totalUsers}</div>
            </div>
            <div className="stat-card">
              <h3>Faculty</h3>
              <div className="stat-value">{systemStats.totalFaculty}</div>
            </div>
            <div className="stat-card">
              <h3>Students</h3>
              <div className="stat-value">{systemStats.totalStudents}</div>
            </div>
            <div className="stat-card">
              <h3>Courses</h3>
              <div className="stat-value">{systemStats.totalCourses}</div>
            </div>
            <div className="stat-card">
              <h3>Active Quizzes</h3>
              <div className="stat-value">{systemStats.activeQuizzes}</div>
            </div>
            <div className="stat-card">
              <h3>Quiz Attempts</h3>
              <div className="stat-value">{systemStats.totalQuizAttempts}</div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>👥 User Management</h2>
            <button className="btn-primary" onClick={handleCreateUser}>
              Create User Account
            </button>
          </div>
          <div className="users-table">
            <div className="table-header">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {users.map(user => (
              <div key={user.id} className="table-row">
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
                <span className={`status-badge ${user.status}`}>{user.status}</span>
                <span>
                  <button 
                    className="btn-small"
                    onClick={() => handleManageUser(user.id)}
                  >
                    Manage
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Course Management */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📚 Course Management</h2>
            <button className="btn-primary" onClick={handleCreateCourse}>
              Create Course
            </button>
          </div>
          <div className="courses-list">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-info">
                  <h3>{course.name}</h3>
                  <p>Faculty: {course.faculty}</p>
                  <p>Students: {course.students}</p>
                  <span className={`status-badge ${course.status}`}>{course.status}</span>
                </div>
                <div className="course-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => handleAssignCourse(course.id)}
                  >
                    Assign Users
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate(`/course/${course.id}/manage`)}
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Assignment */}
        <div className="dashboard-section">
          <h2>👨‍🏫 Faculty Assignment</h2>
          <div className="assignment-actions">
            <div className="action-card">
              <h3>Assign Faculty to Courses</h3>
              <p>Manage faculty course assignments</p>
              <button className="btn-secondary">Manage Assignments</button>
            </div>
            <div className="action-card">
              <h3>Course Permissions</h3>
              <p>Set faculty permissions and access levels</p>
              <button className="btn-secondary">Manage Permissions</button>
            </div>
          </div>
        </div>

        {/* Student Assignment */}
        <div className="dashboard-section">
          <h2>👨‍🎓 Student Assignment</h2>
          <div className="assignment-actions">
            <div className="action-card">
              <h3>Assign Students to Courses</h3>
              <p>Enroll students in courses</p>
              <button className="btn-secondary">Manage Enrollment</button>
            </div>
            <div className="action-card">
              <h3>Bulk Operations</h3>
              <p>Import/export student data and assignments</p>
              <button className="btn-secondary">Bulk Actions</button>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="dashboard-section">
          <h2>⚙️ System Settings</h2>
          <div className="settings-actions">
            <div className="action-card">
              <h3>System Configuration</h3>
              <p>Manage system-wide settings and preferences</p>
              <button className="btn-secondary">Configure</button>
            </div>
            <div className="action-card">
              <h3>Backup & Restore</h3>
              <p>System backup and data management</p>
              <button className="btn-secondary">Manage Backups</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;