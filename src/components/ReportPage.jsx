
import React from 'react';
import './ReportPage.css';

export default function ReportPage({ records, onEdit }) {
  return (
    <div className="report-container">
      <h2>Records Report</h2>
      
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.name}</td>
                  <td>{record.email}</td>
                  <td>{record.department}</td>
                  <td>
                    <button 
                      className="edit-btn"
                      onClick={() => onEdit(record)}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="report-summary">
            <h3>Summary</h3>
            <p>Total Records: {records.length}</p>
            <div className="department-breakdown">
              <h4>Department Breakdown:</h4>
              {Object.entries(
                records.reduce((acc, record) => {
                  acc[record.department] = (acc[record.department] || 0) + 1;
                  return acc;
                }, {})
              ).map(([dept, count]) => (
                <p key={dept}>{dept}: {count}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
