import React, { useState, useEffect } from 'react';
import './cssStyles/SettingsPage.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    fullName: '',
    bio: '',
    avatar: 'male'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const avatarOptions = [
    { id: 'male', emoji: '👨', category: 'Default', name: 'Male' },
    { id: 'female', emoji: '👩', category: 'Default', name: 'Female' },
    { id: 'dog', emoji: '🐕', category: 'Animal', name: 'Dog' },
    { id: 'cat', emoji: '🐱', category: 'Animal', name: 'Cat' },
    { id: 'lion', emoji: '🦁', category: 'Animal', name: 'Lion' },
    { id: 'tiger', emoji: '🐅', category: 'Animal', name: 'Tiger' },
    { id: 'bear', emoji: '🐻', category: 'Animal', name: 'Bear' },
    { id: 'panda', emoji: '🐼', category: 'Animal', name: 'Panda' },
    { id: 'fox', emoji: '🦊', category: 'Animal', name: 'Fox' },
    { id: 'rabbit', emoji: '🐰', category: 'Animal', name: 'Rabbit' },
    { id: 'horse', emoji: '🐴', category: 'Animal', name: 'Horse' },
    { id: 'elephant', emoji: '🐘', category: 'Animal', name: 'Elephant' },
    { id: 'robot', emoji: '🤖', category: 'Other', name: 'Robot' },
    { id: 'alien', emoji: '👽', category: 'Other', name: 'Alien' },
    { id: 'wizard', emoji: '🧙', category: 'Other', name: 'Wizard' },
    { id: 'ninja', emoji: '🥷', category: 'Other', name: 'Ninja' },
    { id: 'superhero', emoji: '🦸', category: 'Other', name: 'Superhero' },
    { id: 'ghost', emoji: '👻', category: 'Other', name: 'Ghost' },
    { id: 'unicorn', emoji: '🦄', category: 'Other', name: 'Unicorn' },
    { id: 'dragon', emoji: '🐉', category: 'Othes', name: 'Dragon' }
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUserProfile({
          username: userData.username || '',
          email: userData.email || '',
          fullName: userData.fullName || '',
          bio: userData.bio || '',
          avatar: userData.avatar || 'male'
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarSelect = (avatarId) => {
    setUserProfile(prev => ({
      ...prev,
      avatar: avatarId
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        ...userProfile
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchUserProfile(); 
  };

  const getAvatarsByCategory = (category) => {
    return avatarOptions.filter(avatar => avatar.category === category);
  };

  const getSelectedAvatar = () => {
    return avatarOptions.find(avatar => avatar.id === userProfile.avatar) || avatarOptions[0];
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2>Account Settings</h2>
        
        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="profile-section">
          <h3>Profile Information</h3>
          
          <div className="profile-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={userProfile.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={userProfile.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={userProfile.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={userProfile.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="avatar-section">
          <h3>Choose Your Avatar</h3>
          
          <div className="current-avatar">
            <span className="avatar-display">{getSelectedAvatar().emoji}</span>
            <span className="avatar-name">{getSelectedAvatar().name}</span>
          </div>

          {isEditing && (
            <div className="avatar-selection">
              {['Default', 'Animal', 'Other'].map(category => (
                <div key={category} className="avatar-category">
                  <h4>{category}s</h4>
                  <div className="avatar-grid">
                    {getAvatarsByCategory(category).map(avatar => (
                      <button
                        key={avatar.id}
                        className={`avatar-option ${userProfile.avatar === avatar.id ? 'selected' : ''}`}
                        onClick={() => handleAvatarSelect(avatar.id)}
                        disabled={!isEditing}
                        title={avatar.name}
                      >
                        <span className="avatar-emoji">{avatar.emoji}</span>
                        <span className="avatar-label">{avatar.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="settings-actions">
          {!isEditing ? (
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="save-btn"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? '💾 Saving...' : '💾 Save Changes'}
              </button>
              <button 
                className="cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                ❌ Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
