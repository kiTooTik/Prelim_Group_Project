import React, { useEffect, useState } from 'react';
import './cssStyles/LogsHistory.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

export default function LogsHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to fetch logs');
        return;
      }
      setLogs(data);
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <p>Loading logs...</p>;

  return (
    <div className="logs-container">
      <h2>Activity Logs</h2>
      {logs.length === 0 ? (
        <p>No logs available.</p>
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
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user_id}</td>
                <td>{log.name}</td>
                <td>{log.department}</td>
                <td>{log.action}</td>
                <td>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="refresh-btn" onClick={fetchLogs}>↻ Refresh</button>
    </div>
  );
}
