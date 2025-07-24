import React, { useState } from 'react';
import './cssStyles/CrudForms.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

export default function DeleteRecord({ records = [], onRecordDeleted }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (record) => {
    const { id, name, department } = record;

    if (!window.confirm(`Are you sure you want to delete the record for ${name}?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in.');
      return;
    }

    try {
      setDeletingId(id);

      // 1) Delete from records
      const res = await fetch(`${API_BASE}/api/records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status !== 204) {
        const err = await res.json();
        alert(err.error || 'Failed to delete');
        setDeletingId(null);
        return;
      }

      // 2) Log DELETE
      try {
        await fetch(`${API_BASE}/api/delete-record/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name, department })
        });
      } catch (e) {
        console.warn('Failed to log DELETE action', e);
      }

      // 3) Notify dashboard
      if (typeof onRecordDeleted === 'function') {
        await onRecordDeleted(id);
      }
    } catch (e) {
      alert('Network error while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="crud-form-container">
      <h2>Delete Records</h2>

      {records.length === 0 ? (
        <p>No records available to delete.</p>
      ) : (
        <div className="records-list">
          {records.map((record) => (
            <div key={record.id} className="record-item">
              <div className="record-info">
                <h4>{record.name}</h4>
                <p>Email: {record.email}</p>
                <p>Department: {record.department}</p>
              </div>
              <button
                className="delete-btn"
                disabled={deletingId === record.id}
                onClick={() => handleDelete(record)}
              >
                {deletingId === record.id ? 'Deleting…' : '🗑️ Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
