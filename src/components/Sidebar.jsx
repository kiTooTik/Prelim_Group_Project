import React from 'react';
import './cssStyles/Sidebar.css';

export default function Sidebar({
  currentView,
  onViewChange,
  user,
  onLogout,
  avatarId
}) {
  // emoji lookup
  const emojiMap = {
    male: '👨',
    female: '👩',
    dog: '🐕',
    cat: '🐱',
    lion: '🦁',
    tiger: '🐅',
    bear: '🐻',
    panda: '🐼',
    fox: '🦊',
    rabbit: '🐰',
    horse: '🐴',
    elephant: '🐘',
    robot: '🤖',
    alien: '👽',
    wizard: '🧙',
    ninja: '🥷',
    superhero: '🦸',
    ghost: '👻',
    unicorn: '🦄',
    dragon: '🐉'
  };

  const menuItems = [
    { id: 'add', label: 'ADD', icon: '➕' },
    { id: 'edit', label: 'EDIT', icon: '✏️' },
    { id: 'delete', label: 'DELETE', icon: '🗑️' },
    { id: 'report', label: 'REPORT', icon: '📊' },
    { id: 'logs', label: 'LOGS', icon: '📜' },
    { id: 'settings', label: 'SETTINGS', icon: '⚙️' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="avatar-emoji" style={{ fontSize: 48 }}>
          {emojiMap[avatarId] || '👤'}
        </span>
        <h3>Dashboard</h3>
        <p>Welcome, {user}!</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
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