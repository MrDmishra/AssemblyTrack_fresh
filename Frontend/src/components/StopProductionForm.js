import React, { useState } from 'react';
import axios from 'axios';
import './StopProductionForm.css';

const StopProductionForm = ({ production, onClose, onProductionStopped }) => {
  const [formData, setFormData] = useState({
    unitsProduced: '',
    quality: 'PASS',
    logbookNotes: '',
    delayReason: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if delay reason is required
    const actualDuration = Math.floor((new Date() - new Date(production.startTime)) / 60000);
    const isDelayed =
      production.expectedDuration != null &&
      production.expectedDuration > 0 &&
      actualDuration > production.expectedDuration;

    if (isDelayed && !formData.delayReason.trim()) {
      setError('Delay reason is required for delayed production');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const payload = { ...formData };

      if (imageFile) {
        const base64 = await toBase64(imageFile);
        payload.imageBase64 = base64;
        payload.imageFileName = imageFile.name;
      }

      await axios.post(`/api/productions/stop/${production.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onProductionStopped();
    } catch (error) {
      setError('Error stopping production');
      console.error('Error:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Stop Production</h2>
        <p><strong>Product:</strong> {production.productName}</p>
        <p><strong>Started:</strong> {new Date(production.startTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Units Produced:</label>
            <input
              type="number"
              name="unitsProduced"
              value={formData.unitsProduced}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Quality Check:</label>
            <select name="quality" value={formData.quality} onChange={handleChange}>
              <option value="PASS">Pass</option>
              <option value="PARTIAL">Partial</option>
              <option value="FAIL">Fail</option>
            </select>
          </div>

          <div className="form-group">
            <label>Logbook Notes:</label>
            <textarea
              name="logbookNotes"
              value={formData.logbookNotes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Delay Reason (if applicable):</label>
            <textarea
              name="delayReason"
              value={formData.delayReason}
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Upload Image <span className="optional-tag">(Optional)</span></label>
            <div className="image-upload-area">
              <input
                type="file"
                id="productionImage"
                accept="image/*"
                onChange={handleImageChange}
                className="image-file-input"
              />
              <label htmlFor="productionImage" className="image-upload-btn">
                {imageFile ? imageFile.name : 'Choose Image'}
              </label>
              {imageFile && (
                <button
                  type="button"
                  className="image-clear-btn"
                  onClick={() => { setImageFile(null); setImagePreview(null); document.getElementById('productionImage').value = ''; }}
                >
                  ✕ Remove
                </button>
              )}
            </div>
            {imagePreview && (
              <div className="image-preview-wrap">
                <img src={imagePreview} alt="Preview" className="image-preview" />
              </div>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button type="submit">Stop Production</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StopProductionForm;