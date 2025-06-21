import React from 'react';

const SEVERITY_LEVELS = [
  { value: 1, label: 'Minor', color: '#28a745' },
  { value: 2, label: 'Moderate', color: '#ffc107' },
  { value: 3, label: 'Significant', color: '#fd7e14' },
  { value: 4, label: 'Major', color: '#dc3545' },
  { value: 5, label: 'Catastrophic', color: '#6f42c1' }
];

const DisasterItem = ({ disaster, showActions = true, onEdit, onDelete }) => {
  const severity = SEVERITY_LEVELS.find(s => s.value === disaster.severity) || SEVERITY_LEVELS[0];
  return (
    <div className="card disaster-item">
      <div className="disaster-item__header">
        <div>
          <h4 className="disaster-item__title">{disaster.title}</h4>
          <p className="disaster-item__location">{disaster.location_name}</p>
        </div>
        {showActions && (
          <div className="disaster-item__actions">
            <button className="btn btn--sm btn--secondary" onClick={() => onEdit(disaster)}>
              Edit
            </button>
            <button className="btn btn--sm btn--outline" onClick={() => onDelete(disaster.id)}>
              Delete
            </button>
          </div>
        )}
      </div>
      <div className="disaster-item__meta">
        <div className="severity-indicator">
          <span className="severity-dot" style={{ backgroundColor: severity.color }}></span>
          {severity.label}
        </div>
        <span className="status status--info">{disaster.status || 'Active'}</span>
      </div>
      <div className="disaster-item__tags">
        {disaster.tags?.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <p>{disaster.description}</p>
    </div>
  );
};

export default DisasterItem; 