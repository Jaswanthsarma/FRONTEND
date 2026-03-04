import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './AdminSignupPage.css';

const AdminSignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phoneNumber: '',
    role: 'faculty',
    department: '',
    semester: ''
  });
  const [systemData, setSystemData] = useState({
    departments: [],
    semesters: [],
    academicYear: ''
  });
  const [step, setStep] = useState(1); // 1 = basic info, 2 = academic info, 3 = credentials
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
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
      if (data.success && data.data) {
        console.log('✅ System settings loaded from API:', data.data);
        setSystemData({
          departments: data.data.departments || ['CSE', 'ECE', 'MECH', 'IT', 'EEE', 'CIVIL'],
          semesters: data.data.semesters || [1, 2, 3, 4, 5, 6, 7, 8],
          academicYear: data.data.academicYear || '2026-27'
        });
      } else {
        console.warn('⚠️ API returned no data, using defaults');
        setSystemData({
          departments: ['CSE', 'ECE', 'MECH', 'IT', 'EEE', 'CIVIL'],
          semesters: [1, 2, 3, 4, 5, 6, 7, 8],
          academicYear: '2026-27'
        });
      }
    } catch (error) {
      console.error('❌ Error fetching system data:', error);
      // Always use default values if API fails
      console.log('📋 Using default system settings');
      setSystemData({
        departments: ['CSE', 'ECE', 'MECH', 'IT', 'EEE', 'CIVIL'],
        semesters: [1, 2, 3, 4, 5, 6, 7, 8],
        academicYear: '2026-27'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // Auto-generate username and password based on role and input
      if (name === 'email' && newData.role === 'faculty') {
        // For faculty: username = part before @ in email
        const emailPart = value.split('@')[0];
        newData.username = emailPart;
        newData.password = 'welcometolms';
      } else if (name === 'phoneNumber' && newData.role === 'student') {
        // For student: username = phone number
        newData.username = value;
        newData.password = 'welcometolms';
      } else if (name === 'role') {
        // When role changes, regenerate username and password
        if (value === 'faculty' && newData.email) {
          const emailPart = newData.email.split('@')[0];
          newData.username = emailPart;
          newData.password = 'welcometolms';
        } else if (value === 'student' && newData.phoneNumber) {
          newData.username = newData.phoneNumber;
          newData.password = 'welcometolms';
        } else {
          // Clear credentials if switching roles without required data
          newData.username = '';
          newData.password = 'welcometolms';
        }
      }

      return newData;
    });
    
    setError('');
    setSuccess('');
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate basic info
      if (!formData.name || !formData.email || !formData.phoneNumber || !formData.role) {
        setError('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate academic info
      if (!formData.department) {
        setError('Please select a department');
        return;
      }
      if (formData.role === 'student' && !formData.semester) {
        setError('Please select a semester for student');
        return;
      }
      
      // Auto-generate credentials before moving to step 3
      let updatedFormData = { ...formData };
      if (formData.role === 'faculty' && formData.email) {
        const emailPart = formData.email.split('@')[0];
        updatedFormData.username = emailPart;
        updatedFormData.password = 'welcometolms';
      } else if (formData.role === 'student' && formData.phoneNumber) {
        updatedFormData.username = formData.phoneNumber;
        updatedFormData.password = 'welcometolms';
      }
      
      setFormData(updatedFormData);
      setStep(3);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (step < 3) {
      handleNextStep();
      return;
    }

    // Step 3: Create user with credentials
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login as admin first');
        navigate('/admin/auth');
        return;
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        academicYear: systemData.academicYear
      };

      // Add semester only for students
      if (formData.role === 'student') {
        userData.semester = parseInt(formData.semester);
      }

      console.log('🚀 Sending user data:', JSON.stringify(userData, null, 2));
      console.log('📊 System data:', JSON.stringify(systemData, null, 2));

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} account created successfully!`);
        setFormData({
          username: '',
          password: '',
          name: '',
          email: '',
          phoneNumber: '',
          role: 'faculty',
          department: '',
          semester: ''
        });
        setStep(1); // Reset to step 1
      } else {
        setError(data.message || 'User creation failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Step 1: Basic Information';
      case 2: return 'Step 2: Academic Assignment';
      case 3: return 'Step 3: Login Credentials';
      default: return 'Create User Account';
    }
  };

  return (
    <div className="admin-signup-page">
      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <div className="admin-logo-section" onClick={handleBackToDashboard}>
            <div className="admin-logo">🎓</div>
            <span className="admin-logo-text">Learning Management System</span>
          </div>
        </div>
      </div>

      <div className="admin-signup-container">
        <div className="admin-signup-header">
          <h1>Create User Account</h1>
        </div>

        <form onSubmit={handleCreateUser} className="admin-form">
          <h2>{getStepTitle()}</h2>

          {step === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="role">User Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="faculty">Faculty</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="user-info-summary">
                <h4>Academic Assignment for {formData.role}:</h4>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Role:</strong> {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</p>
                <p><strong>Academic Year:</strong> {systemData.academicYear}</p>
              </div>

              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  {systemData.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <small className="field-note">
                  {formData.role === 'faculty' 
                    ? 'Faculty can create courses only within their assigned department'
                    : 'Student will see courses only from their assigned department'
                  }
                </small>
              </div>

              {formData.role === 'student' && (
                <div className="form-group">
                  <label htmlFor="semester">Semester *</label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Semester</option>
                    {systemData.semesters.map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                  <small className="field-note">
                    Student will see courses only for their assigned semester
                  </small>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="user-info-summary">
                <h4>Creating {formData.role} account for:</h4>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                <p><strong>Department:</strong> {formData.department}</p>
                {formData.role === 'student' && (
                  <p><strong>Semester:</strong> {formData.semester}</p>
                )}
                <p><strong>Academic Year:</strong> {systemData.academicYear}</p>
              </div>

              <div className="form-group">
                <label htmlFor="username">Username (Auto-generated)</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  readOnly
                  className="readonly-field"
                  placeholder="Will be generated automatically"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password (Auto-generated)</label>
                <input
                  type="text"
                  id="password"
                  name="password"
                  value={formData.password}
                  readOnly
                  className="readonly-field"
                  placeholder="welcometolms"
                />
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-buttons">
            {step > 1 && (
              <button 
                type="button" 
                className="back-button-form" 
                onClick={handleBackStep}
                disabled={loading}
              >
                ← Back
              </button>
            )}
            
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Processing...' : (
                step < 3 ? 'Next →' : `Create ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminSignupPage;