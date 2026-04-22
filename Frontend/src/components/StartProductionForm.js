import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StartProductionForm.css';

const StartProductionForm = ({ onClose, onProductionStarted }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [workStations, setWorkStations] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    expectedDuration: '',
    workStation: '',
    toolsUsed: []
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('/api/masters/PRODUCT', { headers }),
      axios.get('/api/masters/CATEGORY', { headers }),
      axios.get('/api/masters/WORK_STATION', { headers }),
      axios.get('/api/masters/TOOL', { headers })
    ])
      .then(([prodRes, catRes, wsRes, toolRes]) => {
        setProducts(prodRes.data.filter(i => i.active));
        setCategories(catRes.data.filter(i => i.active));
        setWorkStations(wsRes.data.filter(i => i.active));
        setTools(toolRes.data.filter(i => i.active));
      })
      .catch(() => setError('Failed to load master data'))
      .finally(() => setLoading(false));
  }, []);

  const handleProductChange = (e) => {
    const selectedName = e.target.value;
    const product = products.find(p => p.name === selectedName);
    setFormData(prev => ({
      ...prev,
      productName: selectedName,
      expectedDuration: product ? product.durationMinutes : ''
    }));
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleTool = (toolName) => {
    setFormData(prev => {
      const already = prev.toolsUsed.includes(toolName);
      return {
        ...prev,
        toolsUsed: already
          ? prev.toolsUsed.filter(t => t !== toolName)
          : [...prev.toolsUsed, toolName]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/productions/start', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onProductionStarted();
    } catch (err) {
      setError('Error starting production');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <p>Loading master data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Start New Production</h2>
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Product Name:</label>
            <select name="productName" value={formData.productName} onChange={handleProductChange} required>
              <option value="">— Select Product —</option>
              {products.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Category:</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">— Select Category —</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Expected Duration (minutes):</label>
            <input
              type="number"
              name="expectedDuration"
              value={formData.expectedDuration}
              readOnly
              className="input-readonly"
              placeholder="Auto-filled from product"
            />
          </div>

          <div className="form-group">
            <label>Work Station:</label>
            <select name="workStation" value={formData.workStation} onChange={handleChange} required>
              <option value="">— Select Work Station —</option>
              {workStations.map(ws => (
                <option key={ws.id} value={ws.name}>{ws.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tools Used:</label>
            <div className="tools-multiselect">
              {tools.length === 0 && <span className="no-tools">No tools available</span>}
              {tools.map(tool => {
                const checked = formData.toolsUsed.includes(tool.name);
                return (
                  <label key={tool.id} className={`tool-checkbox${checked ? ' selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTool(tool.name)}
                    />
                    {tool.name}
                  </label>
                );
              })}
            </div>
            {formData.toolsUsed.length > 0 && (
              <div className="tools-list">
                {formData.toolsUsed.map((t, i) => (
                  <span key={i} className="tool-tag">
                    {t}
                    <button type="button" onClick={() => toggleTool(t)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button type="submit">Start Production</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartProductionForm;