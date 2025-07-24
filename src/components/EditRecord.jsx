
import React, { useState, useEffect } from 'react';
import './cssStyles/CrudForms.css';

export default function EditRecord({ record, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: ''
  });

  useEffect(() => {
    if (record) {
      setFormData({
        name: record.name,
        email: record.email,
        department: record.department
      });
    }
  }, [record]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.department) {
      onUpdate({
        ...record,
        ...formData
      });
    } else {
      alert('Please fill in all fields');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!record) {
    return (
      <div className="crud-form-container">
        <h2>Edit Record</h2>
        <p>Please select a record to edit from the Report page.</p>
      </div>
    );
  }

  return (
    <div className="crud-form-container">
      <h2>Edit Record (ID: {record.id})</h2>
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
          >
            <option value="">Select Department</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
        
        <button type="submit" className="submit-btn">Update Record</button>
      </form>
    </div>
  );
}
