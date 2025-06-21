import React, { useState, useEffect } from 'react';
import { apiService } from '../constants';
import { io } from 'socket.io-client';
const socket = io('https://disaster-response-platform-backend.onrender.com/', { transports: ['websocket', 'polling'] });

const DisasterForm = ({ disaster, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: disaster?.title || '',
    location_name: disaster?.location_name || '',
    description: disaster?.description || '',
    tags: Array.isArray(disaster?.tags) ? disaster.tags : [],
    severity: disaster?.severity || 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractingLocation, setExtractingLocation] = useState(false);
  const [success, setSuccess] = useState('');
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [severityLevels, setSeverityLevels] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetchTypes() {
      try {
        const types = await apiService.getDisasterTypes();
        if (mounted) setDisasterTypes(Array.isArray(types) ? types : []);
      } catch (err) {
        if (mounted) setError('Failed to load disaster types');
      }
    }
    fetchTypes();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    apiService.getSeverityLevels().then(levels => {
      if (mounted) setSeverityLevels(Array.isArray(levels) ? levels : []);
    });
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const tagValue = e.target.dataset.tag;
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.includes(tagValue)
          ? prev.tags.filter(t => t !== tagValue)
          : [...prev.tags, tagValue]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const extractLocation = async () => {
    if (!formData.description) {
      setError('Please enter a description first');
      return;
    }
    try {
      setExtractingLocation(true);
      setError('');
      const result = await apiService.extractLocation(formData.description);
      if (result.location_name) {
        setFormData(prev => ({ ...prev, location_name: result.location_name }));
        setSuccess('Location extracted successfully using AI!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Location extraction failed');
    } finally {
      setExtractingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave(formData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card__body">
        <h3>{disaster ? 'Edit Disaster' : 'Create New Disaster'}</h3>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter disaster title"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="form-control"
              >
                {severityLevels.length === 0 && <option>Loading...</option>}
                {severityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="4"
              placeholder="Describe the disaster situation in detail..."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Location
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={extractLocation}
                disabled={extractingLocation || !formData.description}
                style={{ marginLeft: '8px' }}
              >
                {extractingLocation ? 'Extracting...' : 'AI Extract Location'}
              </button>
            </label>
            <input
              type="text"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter location or use AI extraction"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Disaster Type Tags</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              {disasterTypes.length === 0 && <span>Loading...</span>}
              {disasterTypes.map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    data-tag={type}
                    checked={formData.tags.includes(type)}
                    onChange={handleChange}
                  />
                  <span className="tag" style={{ fontSize: '12px' }}>{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Saving...' : (disaster ? 'Update Disaster' : 'Create Disaster')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisasterForm;