import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          © 2026 Learning Management System | 
          <a href="/privacy-policy" className="footer-link"> Privacy Policy</a> | 
          <a href="/terms-of-service" className="footer-link"> Terms of Service</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
