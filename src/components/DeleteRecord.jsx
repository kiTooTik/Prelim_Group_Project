import React from 'react';
import './cssStyles/CrudForms.css';

export default function DeleteRecord({ records = [], onDelete }) {
  const handleDelete = async (id, name) => {
    if (!onDelete) return;
    if (window.confirm(`Are you sure you want to delete the record for ${name}?`)) {
      try {
        await onDelete(id); // supports async delete (API call)
      } catch (e) {
        alert('Failed to delete record.');
        console.error(e);
      }
    }
  };

  return (
    <div className="crud-form-container">
      <h2>Delete Records</h2>
      
      {records.length === 0 ? (
        <p>No records available to delete.</p>
      ) : (
        <div className="records-list">
          {records.map(record => (
          <div key={record.id} className="record-item">
            <div className="record-info">
              <h4>{record.name}</h4>
              <p>Email: {record.email}</p>
              <p>Department: {record.department}</p>
            </div>
            <button
              className="delete-btn"
              onClick={() => handleDelete(record.id, record.name)}
            >
              🗑️ Delete
            </button>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
