import React, { useState } from 'react';
import { apiService } from '../constants';

const SocialMediaFeed = ({ disasters }) => {
  const [selectedDisaster, setSelectedDisaster] = useState('');
  const [socialData, setSocialData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSocialMedia = async (disasterId) => {
    if (!disasterId) {
      setSocialData([]);
      return;
    }
    try {
      setLoading(true);
      const data = await apiService.getSocialMedia(disasterId);
      setSocialData(data.posts || []);
    } catch (error) {
      console.error('Failed to load social media:', error);
      setSocialData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card__body">
        <h3>Social Media Monitoring</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: '16px' }}>
          Real-time social media monitoring using Twitter API / Bluesky for disaster-related posts
        </p>
        <div className="form-group">
          <label className="form-label">Select Disaster</label>
          <select
            value={selectedDisaster}
            onChange={(e) => {
              setSelectedDisaster(e.target.value);
              loadSocialMedia(e.target.value);
            }}
            className="form-control"
          >
            <option value="">Choose a disaster to monitor...</option>
            {disasters.map(disaster => (
              <option key={disaster.id} value={disaster.id}>
                {disaster.title} - {disaster.location_name}
              </option>
            ))}
          </select>
        </div>
        {loading && <div className="loading">Loading social media data...</div>}
        {socialData.length > 0 && (
          <div className="social-feed">
            {socialData.map(post => (
              <div key={post.id} className="card social-item">
                <div className="social-item__user">{post.user}</div>
                <div className="social-item__content">{post.content}</div>
                <div className="social-item__time">
                  {new Date(post.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaFeed; 