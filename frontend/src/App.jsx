import React, { useState, useEffect } from 'react';
import { apiService } from './constants';
import { useSocket } from './hooks/useSocket';
import Dashboard from './components/Dashboard';
import DisasterItem from './components/DisasterItem';
import DisasterForm from './components/DisasterForm';
import ReportForm from './components/ReportForm';
import SocialMediaFeed from './components/SocialMediaFeed';
import RealTimeUpdates from './components/RealTimeUpdates';
import './App.css';

const App = () => {
  const [currentUser] = useState(null); // Set to null or fetch as needed
  const [activeTab, setActiveTab] = useState('dashboard');
  const [disasters, setDisasters] = useState([]); // Start with empty array
  const [loading, setLoading] = useState(false);
  const [editingDisaster, setEditingDisaster] = useState(null);
  const [showUpdates, setShowUpdates] = useState(true);
  const [notification, setNotification] = useState(null);
  const { connected, updates } = useSocket();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiService.getDisasters();
        setDisasters(data.disasters || []);
      } catch (error) {
        console.error('Failed to load disasters:', error);
      }
    };
    loadData();
  }, []);

  const handleSaveDisaster = async (data) => {
    try {
      let result;
      if (editingDisaster) {
        result = await apiService.updateDisaster(editingDisaster.id, data);
        setDisasters(prev => prev.map(d => d.id === editingDisaster.id ? { ...result, id: editingDisaster.id } : d));
        showNotification('Disaster updated successfully', 'success');
      } else {
        result = await apiService.createDisaster(data);
        setDisasters(prev => [...prev, result]);
        showNotification('Disaster created successfully', 'success');
      }
      setEditingDisaster(null);
      setActiveTab('disasters');
    } catch (error) {
      throw new Error('Failed to save disaster');
    }
  };

  const handleDeleteDisaster = async (id) => {
    if (!window.confirm('Are you sure you want to delete this disaster?')) return;
    try {
      await apiService.deleteDisaster(id);
      setDisasters(prev => prev.filter(d => d.id !== id));
      showNotification('Disaster deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete disaster', 'error');
    }
  };

  const handleReportSubmit = async (data) => {
    try {
      await apiService.createReport(data);
      showNotification('Report submitted successfully!', 'success');
    } catch (error) {
      console.error('Failed to submit report:', error);
      showNotification('Failed to submit report. Please try again.', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 6000);
  };

  const stats = {
    total: disasters.length,
    active: disasters.filter(d => d.status === 'Active').length,
    reports: 27,
    resources: 156
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading disaster data...</div>;
    }
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard disasters={disasters} stats={stats} />;
      case 'disasters':
        return (
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
              <h2>Disaster Management</h2>
              <button className="btn btn--primary" onClick={() => setActiveTab('create-disaster')}>
                Create New Disaster
              </button>
            </div>
            <div className="disaster-list">
              {disasters.map(disaster => (
                <DisasterItem
                  key={disaster.id}
                  disaster={disaster}
                  onEdit={(disaster) => {
                    setEditingDisaster(disaster);
                    setActiveTab('create-disaster');
                  }}
                  onDelete={handleDeleteDisaster}
                />
              ))}
            </div>
          </div>
        );
      case 'create-disaster':
        return (
          <DisasterForm
            disaster={editingDisaster}
            onSave={handleSaveDisaster}
            onCancel={() => {
              setEditingDisaster(null);
              setActiveTab('disasters');
            }}
          />
        );
      case 'reports':
        return <ReportForm disasters={disasters} onSubmit={handleReportSubmit} />;
      case 'social':
        return <SocialMediaFeed disasters={disasters} />;
      case 'resources':
        return (
          <div className="card">
            <div className="card__body">
              <h3>Resource Mapping & Geospatial Queries</h3>
              <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                This section demonstrates geospatial resource mapping using Supabase queries with PostGIS extensions.
              </p>
              <div className="map-placeholder">
                Interactive Resource Map
                <br />
                <small>Geospatial visualization of shelters, food distribution, medical facilities</small>
                <br />
                <small>Uses ST_DWithin for proximity-based resource discovery</small>
              </div>
              <div style={{ marginTop: '16px' }}>
                <h4>Sample Geospatial Resources</h4>
                <div className="disaster-list">
                  <div className="card">
                    <div className="card__body">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 style={{ margin: '0 0 4px 0' }}>Downtown Emergency Shelter</h5>
                          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            Type: Shelter • Distance: 0.5 km • Capacity: 200
                          </p>
                        </div>
                        <span className="status status--success">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card__body">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 style={{ margin: '0 0 4px 0' }}>Red Cross Food Distribution</h5>
                          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            Type: Food • Distance: 1.2 km • Available: Hot meals
                          </p>
                        </div>
                        <span className="status status--warning">Limited</span>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card__body">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 style={{ margin: '0 0 4px 0' }}>Mobile Medical Unit</h5>
                          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            Type: Medical • Distance: 2.1 km • Services: Emergency care
                          </p>
                        </div>
                        <span className="status status--success">Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard disasters={disasters} stats={stats} />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header__content">
            <h1 className="logo">Disaster Response Platform</h1>
            <div className="user-info">
              <span>Logged in as: <strong>{currentUser?.username}</strong> ({currentUser?.role})</span>
              <div className={`connection-status connection-status--${connected ? 'connected' : 'disconnected'}`}>
                <span className="status-dot"></span>
                {connected ? 'WebSocket Connected' : 'Demo Mode'}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container">
        <nav className="nav-tabs">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'disasters', label: 'Disasters' },
            { key: 'reports', label: 'Submit Report' },
            { key: 'social', label: 'Social Media' },
            { key: 'resources', label: 'Resources' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`nav-tab ${activeTab === tab.key ? 'nav-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        {renderContent()}
      </main>
      {showUpdates && (
        <RealTimeUpdates
          updates={updates}
          connected={connected}
          onClose={() => setShowUpdates(false)}
        />
      )}
      {notification && (
        <div className={`notification notification--${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default App;
