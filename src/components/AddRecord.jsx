import React, { useState } from 'react';
import './cssStyles/CrudForms.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

export default function AddRecord({ onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.department) {
      alert('Please fill in all fields');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to add record');
        return;
      }

      // Let parent update its list, if provided
      if (typeof onAdd === 'function') {
        onAdd(data);
      }

      setFormData({ name: '', email: '', department: '' });
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="crud-form-container">
      <h2>Add New Record</h2>
      <form onSubmit={handleSubmit} className="crud-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="department">Department:</label>
          <select
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
          disabled={submitting}
          >
            <option value="">Select Department</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Saving...' : 'Add Record'}
        </button>
      </form>
    </div>
  );
}
