import React, { useState } from 'react';
import { apiService } from '../constants';

const SocialMediaFeed = ({ disasters }) => {
  const [selectedDisaster, setSelectedDisaster] = useState('');
  const [socialData, setSocialData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSocialMedia = async (disasterId, keywords = null) => {
    if (!disasterId) {
      setSocialData([]);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      // If no keywords provided, use default ones
      const searchKeywords = keywords || ['emergency', 'disaster', 'help'];
      console.log('Using keywords for search:', searchKeywords);
      
      const data = await apiService.getSocialMedia(disasterId, searchKeywords);
      setSocialData(data.posts || []);
    } catch (error) {
      console.error('Failed to load social media:', error);
      setError('Failed to load social media data. Please try again.');
      setSocialData([]);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'var(--color-success)';
      case 'negative': return 'var(--color-error)';
      case 'neutral': return 'var(--color-info)';
      default: return 'var(--color-text-secondary)';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'var(--color-error)';
      case 'high': return 'var(--color-warning)';
      case 'medium': return 'var(--color-info)';
      case 'low': return 'var(--color-success)';
      default: return 'var(--color-text-secondary)';
    }
  };

  return (
    <div className="card">
      <div className="card__body">
        <h3>Social Media Monitoring</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: '16px' }}>
          Real-time social media monitoring using Twitter API / Bluesky for disaster-related posts with AI-powered sentiment analysis
        </p>
        
        <div className="form-group">
          <label className="form-label">Select Disaster</label>
          <select
            value={selectedDisaster}
            onChange={(e) => {
              const disasterId = e.target.value;
              setSelectedDisaster(disasterId);
              
              // Define keywords for each disaster type
              let keywords = ['emergency', 'disaster', 'help']; // default
              
              if (disasterId) {
                const disaster = disasters.find(d => d.id == disasterId);
                if (disaster) {
                  // Extract keywords based on disaster title
                  const title = disaster.title.toLowerCase();
                  if (title.includes('earthquake')) {
                    keywords = ['earthquake', 'seismic', 'quake', 'emergency', 'rescue'];
                  } else if (title.includes('flood')) {
                    keywords = ['flood', 'flooding', 'water', 'emergency', 'rescue'];
                  } else if (title.includes('fire')) {
                    keywords = ['fire', 'blaze', 'emergency', 'rescue', 'evacuation'];
                  } else if (title.includes('storm')) {
                    keywords = ['storm', 'weather', 'emergency', 'shelter'];
                  } else if (title.includes('hurricane')) {
                    keywords = ['hurricane', 'storm', 'weather', 'emergency', 'evacuation'];
                  } else {
                    // Use disaster title words as keywords
                    const titleWords = disaster.title.toLowerCase().split(/\s+/);
                    keywords = [...titleWords, 'emergency', 'disaster', 'help'];
                  }
                }
              }
              
              loadSocialMedia(disasterId, keywords);
            }}
            className="form-control"
          >
            <option value="">Choose a disaster to monitor...</option>
            {disasters && disasters.length > 0 ? (
              disasters.map(disaster => (
                <option key={disaster.id} value={disaster.id}>
                  {disaster.title} - {disaster.location_name}
                </option>
              ))
            ) : (
              <option value="" disabled>No disasters available</option>
            )}
          </select>
          {disasters && disasters.length === 0 && (
            <small style={{ color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
              No disasters found. Create a disaster first to monitor social media.
            </small>
          )}
        </div>

        {error && (
          <div className="error" style={{ marginTop: '16px' }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="loading" style={{ marginTop: '16px' }}>
            Loading social media data...
          </div>
        )}

        {socialData.length > 0 && (
          <div className="social-feed" style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '16px' }}>
              Found {socialData.length} relevant posts
            </h4>
            {socialData.map(post => (
              <div key={post.id} className="card social-item">
                <div className="social-item__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div className="social-item__user" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {post.author}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--font-size-xs)' }}>
                    <span style={{ 
                      color: getSentimentColor(post.analysis?.sentiment),
                      fontWeight: 'bold'
                    }}>
                      {post.analysis?.sentiment || 'neutral'}
                    </span>
                    <span style={{ 
                      color: getUrgencyColor(post.analysis?.urgency),
                      fontWeight: 'bold'
                    }}>
                      {post.analysis?.urgency || 'medium'} urgency
                    </span>
                    {post.analysis?.needs_immediate_attention && (
                      <span style={{ 
                        color: 'var(--color-error)',
                        fontWeight: 'bold'
                      }}>
                        ⚠️ Immediate attention needed
                      </span>
                    )}
                  </div>
                </div>
                <div className="social-item__content" style={{ marginBottom: '8px' }}>
                  {post.text}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  <div className="social-item__time">
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span>❤️ {post.likes || 0}</span>
                    <span>🔄 {post.reposts || 0}</span>
                    <span>💬 {post.replies || 0}</span>
                    <span style={{ color: 'var(--color-primary)' }}>
                      {post.platform}
                    </span>
                  </div>
                </div>
                {post.analysis?.keywords && post.analysis.keywords.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      Keywords: {post.analysis.keywords.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaFeed; 