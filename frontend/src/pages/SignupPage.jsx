import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import apiService from '../services/api';
import './SignupPage.css';

const SignupPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this is admin signup route
  const isAdminSignup = location.pathname === '/admin-signup' || role === 'admin';
  
  const [step, setStep] = useState(1); // 1 = form, 2 = credentials
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'faculty' // Default for admin-created users
  });
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Only allow admin signup through special route
  if (!isAdminSignup) {
    navigate('/');
    return null;
  }

  // Frontend validation
  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Full name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid Gmail address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    // Role validation (for admin creating users)
    if (!formData.role || !['faculty', 'student'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let response;
      
      if (step === 1) {
        // Step 1: Create Faculty/Student account
        response = await apiService.adminSignup({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        });
      } else {
        // This shouldn't happen in this flow
        return;
      }
      
      if (response.success) {
        // Move to step 2 and show generated credentials
        setGeneratedCredentials(response.data.generatedCredentials);
        setStep(2);
      }
    } catch (err) {
      setApiError(err.message || 'Account creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    // Redirect to the appropriate login page based on role
    navigate(`/login/${formData.role}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleBackToForm = () => {
    setStep(1);
    setGeneratedCredentials(null);
  };

  // Generate preview username for admin
  const getPreviewUsername = () => {
    return formData.email ? formData.email.split('@')[0] : 'email-prefix';
  };

  if (step === 2) {
    // Step 2: Show Generated Credentials
    return (
      <div className="signup-page">
        <Header />
        <main className="signup-main">
          <div className="signup-container">
            <div className="signup-card">
              <div className="signup-header">
                <div className="signup-icon">✅</div>
                <h1 className="signup-title">Account Created Successfully!</h1>
                <p className="signup-description">
                  The {formData.role} account has been created. Use these credentials to log in.
                </p>
              </div>

              <div className="credentials-section">
                <div className="credentials-card">
                  <h3 className="credentials-title">Your Login Credentials</h3>
                  
                  <div className="credential-item">
                    <label className="credential-label">Username:</label>
                    <div className="credential-value">
                      {generatedCredentials?.username}
                    </div>
                  </div>

                  <div className="credential-item">
                    <label className="credential-label">Password:</label>
                    <div className="credential-value">
                      {generatedCredentials?.password}
                    </div>
                  </div>

                  <div className="credential-note">
                    <strong>Important:</strong> Please save these credentials. 
                    You can change your password after first login.
                  </div>
                </div>
              </div>

              <div className="signup-footer">
                <button
                  type="button"
                  className="login-redirect-btn btn-primary"
                  onClick={handleGoToLogin}
                >
                  Go to {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} Login
                </button>
                
                <button
                  type="button"
                  className="back-button"
                  onClick={handleBackToForm}
                >
                  ← Back to Form
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Step 1: Admin Signup Form
  return (
    <div className="signup-page">
      <Header />
      <main className="signup-main">
        <div className="signup-container">
          <div className="signup-card">
            <div className="signup-header">
              <div className="signup-icon">👨‍💼</div>
              <h1 className="signup-title">Create User Account</h1>
              <p className="signup-description">Create faculty or student account</p>
            </div>

            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <span className="error-text">{errors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Gmail Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your Gmail address"
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
                {errors.phone && (
                  <span className="error-text">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Create Account For *</label>
                <div className="role-selection">
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="faculty"
                      checked={formData.role === 'faculty'}
                      onChange={handleInputChange}
                    />
                    <span className="role-text">👨‍🏫 Faculty</span>
                  </label>
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formData.role === 'student'}
                      onChange={handleInputChange}
                    />
                    <span className="role-text">👨‍🎓 Student</span>
                  </label>
                </div>
                {errors.role && (
                  <span className="error-text">{errors.role}</span>
                )}
              </div>

              {apiError && (
                <div className="api-error-message">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                className="signup-button btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="signup-footer">
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

export default SignupPage;