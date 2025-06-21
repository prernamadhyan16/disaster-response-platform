import React, { useState } from 'react';
import { apiService } from '../constants';

const ReportForm = ({ disasters, onSubmit }) => {
  const [formData, setFormData] = useState({
    disaster_id: '',
    content: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const verifyImage = async () => {
    if (!formData.image_url || !formData.disaster_id) {
      alert('Please select a disaster and enter an image URL first');
      return;
    }
    try {
      setVerifying(true);
      const result = await apiService.verifyImage(formData.disaster_id, formData.image_url);
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({ verified: false, message: 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reportData = {
        ...formData,
        verification_status: verificationResult?.verified ? 'verified' : 'unverified',
        verification_details: verificationResult || {}
      };
      await onSubmit(reportData);
      setFormData({ disaster_id: '', content: '', image_url: '' });
      setVerificationResult(null);
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card__body">
        <h3>Submit Disaster Report</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Disaster</label>
            <select
              name="disaster_id"
              value={formData.disaster_id}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Choose a disaster...</option>
              {disasters.map(disaster => (
                <option key={disaster.id} value={disaster.id}>
                  {disaster.title} - {disaster.location_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Report Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="form-control"
              rows="4"
              placeholder="Describe what you witnessed, need help with, or resources available..."
              required
            />
          </div>
          <div className="form-group report-form__image-upload">
            <label className="form-label">
              Image URL (optional)
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={verifyImage}
                disabled={verifying || !formData.image_url || !formData.disaster_id}
                style={{ marginLeft: '8px' }}
              >
                {verifying ? 'Verifying...' : 'AI Verify Image'}
              </button>
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="form-control"
              placeholder="https://example.com/disaster-image.jpg"
            />
            {verificationResult && (
              <div className={`verification-result verification-result--${verificationResult.verified ? 'verified' : 'failed'}`}>
                {verificationResult.verified ? '✓ Image verified' : '✗ Image verification failed'}
                {verificationResult.message && `: ${verificationResult.message}`}
                {verificationResult.confidence && ` (Confidence: ${verificationResult.confidence}%)`}
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm; 