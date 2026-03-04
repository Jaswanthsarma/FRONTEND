import React from 'react';
import FacultyLayout from '../../components/FacultyLayout';
import apiService from '../../services/api';

const FacultyProgressPage = () => {
  const user = apiService.getCurrentUser();

  return (
    <FacultyLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Student Progress</h1>
          <p className="dashboard-subtitle">Monitor and analyze student performance</p>
        </div>
        
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Progress Analytics</h3>
          </div>
          <div className="widget-content">
            <p>Student progress tracking functionality will be implemented here.</p>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default FacultyProgressPage;