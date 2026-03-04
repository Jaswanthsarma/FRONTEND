import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleCard.css';

const RoleCard = ({ icon, title, description, buttonText, route }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <div className="role-card" onClick={handleClick}>
      <div className="role-card-content">
        <div className="role-icon">{icon}</div>
        <h3 className="role-title">{title}</h3>
        <p className="role-description">{description}</p>
        <button className="role-button btn-primary">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default RoleCard;