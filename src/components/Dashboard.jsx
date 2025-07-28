import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ReportPage from './ReportPage';
import AddRecord from './AddRecord';
import EditRecord from './EditRecord';
import DeleteRecord from './DeleteRecord';
import LogsHistory from './LogsHistory';
import SettingsPage from './SettingsPage';
import './cssStyles/Dashboard.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

export default function Dashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('report');
  const [records, setRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);

  // Fetch records
  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleEdit = (record) => {
    setEditingRecord(record);
    setCurrentView('edit');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'add':
        return <AddRecord onRecordAdded={fetchRecords} />;
      case 'edit':
        return <EditRecord record={editingRecord} onRecordUpdated={fetchRecords} onCancel={() => setCurrentView('report')} />;
      case 'delete':
        return <DeleteRecord records={records} onRecordDeleted={fetchRecords} />;
      case 'logs':
        return <LogsHistory />;
      case 'settings':
        return <SettingsPage/>;
      case 'report':
      default:
        return <ReportPage records={records} onEdit={handleEdit} />;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        user={user}
        onLogout={onLogout}
      />
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
}
