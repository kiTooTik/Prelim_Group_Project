
import React from 'react';
import './cssStyles/Sidebar.css';

export default function Sidebar({ currentView, onViewChange, user, onLogout }) {
  const menuItems = [
    { id: 'add', label: 'ADD', icon: '➕' },
    { id: 'edit', label: 'EDIT', icon: '✏️' },
    { id: 'delete', label: 'DELETE', icon: '🗑️' },
    { id: 'report', label: 'REPORT', icon: '📊' },
    { id: 'logs', label: 'LOGS', icon: '📜' },
    { id: 'settings', label: 'SETTINGS', icon: '⚙️' }
  ];

  // Get user avatar from localStorage
  const getUserAvatar = () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        const avatarOptions = [
          { id: 'male', emoji: '👨' }, { id: 'female', emoji: '👩' }, { id: 'child', emoji: '🧒' }, { id: 'elder', emoji: '👴' },
          { id: 'dog', emoji: '🐕' }, { id: 'cat', emoji: '🐱' }, { id: 'lion', emoji: '🦁' }, { id: 'tiger', emoji: '🐅' },
          { id: 'bear', emoji: '🐻' }, { id: 'panda', emoji: '🐼' }, { id: 'fox', emoji: '🦊' }, { id: 'rabbit', emoji: '🐰' },
          { id: 'horse', emoji: '🐴' }, { id: 'elephant', emoji: '🐘' }, { id: 'robot', emoji: '🤖' }, { id: 'alien', emoji: '👽' },
          { id: 'wizard', emoji: '🧙' }, { id: 'ninja', emoji: '🥷' }, { id: 'superhero', emoji: '🦸' }, { id: 'ghost', emoji: '👻' },
          { id: 'unicorn', emoji: '🦄' }, { id: 'dragon', emoji: '🐉' }
        ];
        const selectedAvatar = avatarOptions.find(avatar => avatar.id === userData.avatar);
        return selectedAvatar ? selectedAvatar.emoji : '👤';
      }
    } catch (error) {
      console.error('Error getting user avatar:', error);
    }
    return '👤';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-avatar">{getUserAvatar()}</div>
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
