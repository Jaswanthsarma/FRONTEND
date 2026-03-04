import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';

const StudentProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return <div>Loading...</div>;

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">My Profile</h1>
          <p className="dashboard-subtitle">View and manage your profile information</p>
        </div>

        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">Personal Information</h3>
          </div>
          <div className="widget-content">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#3b82f6'
              }}>
                {user.name?.charAt(0).toUpperCase() || 'S'}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                  Full Name
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1f2937' }}>
                  {user.name || 'Student'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                  Username
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1f2937' }}>
                  {user.username || 'N/A'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1f2937' }}>
                  {user.email || 'N/A'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                  Phone Number
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1f2937' }}>
                  {user.phoneNumber || 'N/A'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                  Role
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1f2937' }}>
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'Student'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                  Department
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1f2937' }}>
                  {user.department || 'CSE'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                  Academic Year
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1f2937' }}>
                  {user.academicYear || '2026-27'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                  Last Login
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1f2937' }}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                  Account Created
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#1f2937' }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Change Password Button */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/student/change-password')}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span>🔒</span>
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfilePage;
