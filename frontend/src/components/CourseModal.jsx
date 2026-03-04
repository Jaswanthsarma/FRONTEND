import React, { useState, useEffect } from 'react';

const CourseModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [userDepartment, setUserDepartment] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Get user data to set department
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userDepartment = user.department || 'CSE'; // Default to CSE
      setUserDepartment(userDepartment);
      
      console.log('CourseModal - User data:', user);
      console.log('CourseModal - User department:', userDepartment);
      
      // Fetch system settings for departments
      fetchDepartments();
      
      // Reset form when modal opens
      setFormData({
        title: '',
        code: '',
        description: '',
        department: userDepartment
      });
      setError('');
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/system/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data.departments || ['CSE', 'ECE', 'MECH', 'IT', 'CIVIL']);
      } else {
        setDepartments(['CSE', 'ECE', 'MECH', 'IT', 'CIVIL']);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments(['CSE', 'ECE', 'MECH', 'IT', 'CIVIL']);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.code || !formData.department) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate department matches user's department (if user has department set)
    if (userDepartment && formData.department !== userDepartment) {
      setError(`You can only create courses for your department: ${userDepartment}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      console.log('Creating course with token:', token ? 'Token exists' : 'No token');
      console.log('Course data:', {
        title: formData.title.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        department: formData.department,
        semester: 1,
        credits: 3
      });

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim(),
          department: formData.department,
          semester: 1,
          credits: 3
        })
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success) {
        onSuccess('Course created successfully!');
        onClose();
      } else {
        setError(data.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add New Course</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Course Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Data Structures and Algorithms"
            />
          </div>

          {/* Course Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Course Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
              placeholder="e.g., CSE301"
            />
            <p className="text-xs text-gray-500 mt-1">Must be unique across all courses</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the course..."
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;