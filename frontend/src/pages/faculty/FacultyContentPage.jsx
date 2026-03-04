import React from 'react';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const FacultyContentPage = () => {
  const user = apiService.getCurrentUser();

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Add Course Content</h1>
          <p className="dashboard-subtitle">Upload and manage course materials</p>
        </div>
        
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Content Management</h3>
          </div>
          <div className="widget-content">
            <p>Course content management functionality will be implemented here.</p>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultyContentPage;