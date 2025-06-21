import React from 'react';
import DisasterItem from './DisasterItem';

const Dashboard = ({ disasters, stats }) => {
  return (
    <div>
      <div className="dashboard-grid">
        <div className="card">
          <div className="card__body stat-card">
            <span className="stat-card__number">{stats.total}</span>
            <p className="stat-card__label">Total Disasters</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stat-card">
            <span className="stat-card__number">{stats.active}</span>
            <p className="stat-card__label">Active Disasters</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stat-card">
            <span className="stat-card__number">{stats.reports}</span>
            <p className="stat-card__label">Total Reports</p>
          </div>
        </div>
        <div className="card">
          <div className="card__body stat-card">
            <span className="stat-card__number">{stats.resources}</span>
            <p className="stat-card__label">Resources Mapped</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card__body">
          <h3>Recent Disasters</h3>
          <div className="disaster-list">
            {disasters.slice(0, 5).map(disaster => (
              <DisasterItem key={disaster.id} disaster={disaster} showActions={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 