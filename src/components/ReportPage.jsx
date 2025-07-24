import React, { useEffect, useState } from 'react';
import './cssStyles/ReportPage.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

export default function ReportPage({ onEdit }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to fetch records');
        return;
      }
      setRecords(data);
    } catch (e) {
      console.error('Failed to fetch records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const departmentBreakdown = records.reduce((acc, r) => {
    acc[r.department] = (acc[r.department] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="report-container">
        <h2>Records Report</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Records Report</h2>
        <button className="refresh-btn" onClick={fetchRecords}>↻ Refresh</button>
      </div>

      {records.length === 0 ? (
        <p>No records available. Add some records to see them here.</p>
      ) : (
        <div className="table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                {onEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.name}</td>
                  <td>{record.email}</td>
                  <td>{record.department}</td>
                  {onEdit && (
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => onEdit(record)}
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="report-summary">
          <h3>Summary</h3>
          <p>Total Records: {records.length}</p>
          <div className="department-breakdown">
            <h4>Department Breakdown:</h4>
            {Object.entries(departmentBreakdown).map(([dept, count]) => (
              <p key={dept}>{dept}: {count}</p>
            ))}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
