import React, { useState } from 'react';
import './cssStyles/CrudForms.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

export default function EditRecord({ record, onRecordUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    name: record?.name || '',
    email: record?.email || '',
    department: record?.department || ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!record) {
    return <div className="crud-form-container">No record selected.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in.');
      return;
    }

    try {
      setSubmitting(true);

      // Update main record
      const res = await fetch(`${API_BASE}/api/records/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const updated = await res.json();
      if (!res.ok) {
        alert(updated.error || 'Failed to update record');
        return;
      }

      // Log EDIT
      try {
        await fetch(`${API_BASE}/api/edit-record/${record.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            department: formData.department
          })
        });
      } catch (err) {
        console.warn('Failed to log EDIT action', err);
      }

      // Notify dashboard
      if (typeof onRecordUpdated === 'function') {
        await onRecordUpdated(updated);
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="crud-form-container">
      <h2>Edit Record #{record.id}</h2>
      <form onSubmit={handleSubmit} className="crud-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
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
            id="email"
            name="email"
            type="email"
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

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
          </button>
          {onCancel && (
            <button type="button" className="submit-btn" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
