import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AddRecord from './AddRecord';
import EditRecord from './EditRecord';
import DeleteRecord from './DeleteRecord';
import ReportPage from './ReportPage';
import './cssStyles/Dashboard.css';

export default function Dashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('report');
  const [records, setRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const fetchedOnce = React.useRef(false);
  const [loading, setLoading] = useState(true);

  // Fetch records from backend
  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${window.location.protocol}//${window.location.hostname}:5000/api/records`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  };

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    fetchRecords();
  }, []);

  const addRecord = async (record) => {
    // No POST here. AddRecord already does the POST.
    await fetchRecords(); // Refresh list
    setCurrentView('report');
  };

  const updateRecord = (updatedRecord) => {
    setRecords(records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
    setEditingRecord(null);
    setCurrentView('report');
  };

  const deleteRecord = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${window.location.protocol}//${window.location.hostname}:5000/api/records/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        setRecords(records.filter(record => record.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setCurrentView('edit');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'add':
        return <AddRecord onAdd={addRecord} />;
      case 'edit':
        return <EditRecord record={editingRecord} onUpdate={updateRecord} />;
      case 'delete':
        return <DeleteRecord records={records} onDelete={deleteRecord} />;
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
