import React from 'react';
import './cssStyles/LandingPage.css';

export default function LandingPage({ onNavigateToLogin }) {
  return (
    <div className="landing-container">
      <div className="overlay">
        <div className="landing-content">
          <h1 className="main-heading">Welcome to Our Application</h1>
          <p className="sub-heading">Manage your records efficiently with our CRUD system</p>
          <button className="login-btn" onClick={onNavigateToLogin}>Get Started</button>
        </div>
      </div>
      <div className="abstract-bg">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
    </div>
  );
}
