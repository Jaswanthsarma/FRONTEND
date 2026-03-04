import React from 'react';
import Header from '../components/Header';
import RoleCard from '../components/RoleCard';
import './LandingPage.css';

const LandingPage = () => {
  const roles = [
    {
      icon: '👨‍💼',
      title: 'Admin',
      description: 'System owner - Manage users and system settings',
      buttonText: 'Admin Access',
      route: '/admin/auth'
    },
    {
      icon: '👨‍🏫',
      title: 'Faculty',
      description: 'Create courses, manage quizzes, and track student progress',
      buttonText: 'Faculty Login',
      route: '/login/faculty'
    },
    {
      icon: '👨‍🎓',
      title: 'Student',
      description: 'Access courses, take quizzes, and view your progress',
      buttonText: 'Student Login',
      route: '/login/student'
    }
  ];

  return (
    <div className="landing-page">
      <Header />
      <main className="landing-main">
        <div className="landing-content">
          <div className="landing-hero">
            <h1 className="landing-title">Learning Management System</h1>
            <p className="landing-subtitle">
              A role-based platform for learning, course management, and progress tracking
            </p>

          </div>
          
          <div className="roles-grid">
            {roles.map((role, index) => (
              <RoleCard
                key={index}
                icon={role.icon}
                title={role.title}
                description={role.description}
                buttonText={role.buttonText}
                route={role.route}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;