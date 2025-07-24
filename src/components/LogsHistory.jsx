// LogsHistory.jsx
import React, { useEffect, useState } from 'react';
import './LogsHistory.css'; 

export default function LogsHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/logs', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch logs:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="logs-history-container">
      <h2>History Logs</h2>

      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <table className="logs-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Action</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user_id}</td>
                <td>{log.name}</td>
                <td>{log.department}</td>
                <td>{log.action}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
