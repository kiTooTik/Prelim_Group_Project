
import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onNavigateToLogin }) {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Welcome to Our Application</h1>
        <p>Manage your records efficiently with our CRUD system</p>
        <button className="login-btn" onClick={onNavigateToLogin}>
          Get Started - Login
        </button>
      </header>
    </div>
  );
}
