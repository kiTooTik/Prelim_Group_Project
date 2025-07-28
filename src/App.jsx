import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser).username);
      setCurrentPage('dashboard');
    }
    setTimeout(() => setInitialLoad(false), 10); 
  }, []);

  const handleNavigateToLogin = () => setCurrentPage('login');
  const handleNavigateToRegister = () => setCurrentPage('register');
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
  const handleBackToLanding = () => setCurrentPage('landing');
  const handleSwitchToLogin = () => setCurrentPage('login');
  const handleSwitchToRegister = () => setCurrentPage('register');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigateToLogin={handleNavigateToLogin} />;
      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
            onBack={handleBackToLanding}
            onSwitchToRegister={handleSwitchToRegister}
          />
        );
      case 'register':
        return (
          <RegisterPage
            onRegister={handleRegister}
            onBack={handleBackToLanding}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} />;
      default:
        return <LandingPage onNavigateToLogin={handleNavigateToLogin} />;
    }
  };

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={
            initialLoad
              ? false 
              : { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', opacity: 0 }
          }
          animate={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', opacity: 1 }}
          exit={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {renderCurrentPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
