
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser).username);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  const handleNavigateToRegister = () => {
    setCurrentPage('register');
  };

  const handleLogin = (username) => {
    setUser(username);
    setCurrentPage('dashboard');
  };

  const handleRegister = (username) => {
    setUser(username);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('landing');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const handleSwitchToLogin = () => {
    setCurrentPage('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentPage('register');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigateToLogin={handleNavigateToLogin} />;
      case 'login':
        return <LoginPage 
          onLogin={handleLogin} 
          onBack={handleBackToLanding}
          onSwitchToRegister={handleSwitchToRegister}
        />;
      case 'register':
        return <RegisterPage 
          onRegister={handleRegister} 
          onBack={handleBackToLanding}
          onSwitchToLogin={handleSwitchToLogin}
        />;
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} />;
      default:
        return <LandingPage onNavigateToLogin={handleNavigateToLogin} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
}
