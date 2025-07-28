import React, { useState } from 'react';
import './cssStyles/LoginPage.css';

export default function LoginPage({ onLogin, onBack, onSwitchToRegister }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:5000/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user.username);
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2>Login to Dashboard</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <label htmlFor="username">
              <i className="fas fa-user icon-left" />
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-row">
            <label htmlFor="password">
              <i className="fas fa-lock icon-left" />
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <button className="secondary-btn" onClick={onSwitchToRegister}>
          Don’t have an account? Register
        </button>
        <button className="secondary-btn" onClick={onBack}>Back to Home</button>
      </div>
    </div>
  );
}
