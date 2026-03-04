import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentDashboard from '../../components/StudentDashboard';

const StudentDashboardPage = () => {
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

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return <StudentDashboard user={user} />;
};

export default StudentDashboardPage;