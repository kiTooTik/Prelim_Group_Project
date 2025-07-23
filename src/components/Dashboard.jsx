import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AddRecord from './AddRecord';
import EditRecord from './EditRecord';
import DeleteRecord from './DeleteRecord';
import ReportPage from './ReportPage';
import './Dashboard.css';

export default function Dashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('report');
  const [records, setRecords] = useState([]); // Start with empty array
  const [editingRecord, setEditingRecord] = useState(null);

  const addRecord = (record) => {
    const newRecord = {
      ...record,
      id: records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1
    };
    setRecords([...records, newRecord]);
    setCurrentView('report');
  };

  const updateRecord = (updatedRecord) => {
    setRecords(records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
    setEditingRecord(null);
    setCurrentView('report');
  };

  const deleteRecord = (id) => {
    setRecords(records.filter(record => record.id !== id));
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