import React from 'react';

const RealTimeUpdates = ({ updates, connected, onClose }) => {
  return (
    <div className="realtime-updates">
      <div className="realtime-updates__header">
        <h4 className="realtime-updates__title">Live Updates</h4>
        <button className="realtime-updates__close" onClick={onClose}>×</button>
      </div>
      <div className="realtime-updates__content">
        <div className={`connection-status connection-status--${connected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {connected ? 'WebSocket Connected' : 'Connecting.....'}
        </div>
        {updates.map((update, index) => (
          <div key={index} className="update-item">
            <div className="update-item__type">{update.type}</div>
            <p className="update-item__content">{update.content}</p>
            <div className="update-item__time">
              {new Date(update.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeUpdates; 