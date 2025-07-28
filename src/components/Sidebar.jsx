
import React from 'react';
import './cssStyles/Sidebar.css';

export default function Sidebar({ currentView, onViewChange, user, onLogout }) {
  const menuItems = [
    { id: 'add', label: 'ADD', icon: '➕' },
    { id: 'edit', label: 'EDIT', icon: '✏️' },
    { id: 'delete', label: 'DELETE', icon: '🗑️' },
    { id: 'report', label: 'REPORT', icon: '📊' },
    { id: 'logs', label: 'LOGS', icon: '📜' },
    { id: 'settings', label: 'SETTINGS', icon: '⚙️'}
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Dashboard</h3>
        <p>Welcome, {user}!</p>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
