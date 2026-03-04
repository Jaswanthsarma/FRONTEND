import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';

const StudentSelectFacultyPage = () => {
  const [user, setUser] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchFacultyList();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchFacultyList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/faculty-requests/available-faculty', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFacultyList(data.data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestToJoin = async (facultyId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/faculty-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          facultyId,
          requestMessage: 'I would like to join your class.'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Request sent successfully!');
        fetchFacultyList();
      } else {
        setMessage(data.message || 'Failed to send request');
      }
    } catch (error) {
      setMessage('Error sending request');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
      pending: { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
      rejected: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }
    };
    return styles[status] || { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' };
  };

  if (!user) return <div>Loading...</div>;

  return (
    <StudentLayout user={user}>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Select Faculty</h1>
          <p className="dashboard-subtitle">Request to join a faculty member's class</p>
        </div>

        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '0.5rem',
            backgroundColor: message.includes('success') ? '#dcfce7' : '#fee2e2',
            color: message.includes('success') ? '#166534' : '#991b1b',
            border: `1px solid ${message.includes('success') ? '#86efac' : '#fca5a5'}`
          }}>
            {message}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div style={{ width: '2rem', height: '2rem', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {facultyList.map((faculty) => (
              <div key={faculty._id} className="widget-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '3rem', height: '3rem', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#3b82f6', fontWeight: '600', fontSize: '1.25rem' }}>
                      {faculty.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ marginLeft: '0.75rem' }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>{faculty.name}</h4>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{faculty.department}</p>
                  </div>
                </div>

                {faculty.requestStatus ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      ...getStatusBadge(faculty.requestStatus),
                      padding: '0.5rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {faculty.requestStatus.charAt(0).toUpperCase() + faculty.requestStatus.slice(1)}
                    </span>
                    {faculty.requestStatus === 'rejected' && (
                      <button
                        onClick={() => handleRequestToJoin(faculty._id)}
                        disabled={loading}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Request Again
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleRequestToJoin(faculty._id)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Request to Join
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentSelectFacultyPage;
