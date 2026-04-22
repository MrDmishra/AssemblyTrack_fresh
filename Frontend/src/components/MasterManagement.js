import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './MasterManagement.css';

const MasterManagement = ({ title, masterType }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    durationMinutes: '',
    active: true
  });

  const isProductMaster = useMemo(() => masterType === 'product', [masterType]);
  const pageSize = 8;
  let submitLabel = 'Create';
  if (editingId) {
    submitLabel = 'Update';
  }
  if (saving) {
    submitLabel = 'Saving...';
  }

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/masters/${masterType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data || []);
    } catch (loadError) {
      setError('Failed to load master records.');
      console.error('Error loading master data:', loadError);
    } finally {
      setLoading(false);
    }
  }, [masterType]);

  useEffect(() => {
    setEditingId(null);
    setMessage('');
    setError('');
    setForm({
      name: '',
      description: '',
      durationMinutes: '',
      active: true
    });
    loadItems();
  }, [loadItems]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      durationMinutes: '',
      active: true
    });
  };

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !normalizedSearch
        || (item.name || '').toLowerCase().includes(normalizedSearch)
        || (item.description || '').toLowerCase().includes(normalizedSearch)
        || (isProductMaster && String(item.durationMinutes || '').includes(normalizedSearch));

      const matchesStatus = statusFilter === 'ALL'
        || (statusFilter === 'ACTIVE' && item.active)
        || (statusFilter === 'INACTIVE' && !item.active);

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter, isProductMaster]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, masterType]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getErrorMessage = (apiError, fallback) => {
    if (apiError?.response?.data?.message) {
      return apiError.response.data.message;
    }
    if (typeof apiError?.response?.data === 'string') {
      return apiError.response.data;
    }
    return fallback;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: form.name,
        description: form.description,
        active: form.active
      };

      if (isProductMaster) {
        payload.durationMinutes = Number(form.durationMinutes);
      }

      if (editingId) {
        await axios.put(`/api/masters/${masterType}/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(`${title} updated successfully.`);
      } else {
        await axios.post(`/api/masters/${masterType}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(`${title} created successfully.`);
      }

      resetForm();
      await loadItems();
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to save master record.'));
      console.error('Error saving master data:', saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setMessage('');
    setError('');
    setForm({
      name: item.name || '',
      description: item.description || '',
      durationMinutes: item.durationMinutes || '',
      active: item.active !== false
    });
  };

  const handleDelete = async (id) => {
    const approved = window.confirm('Deactivate this record? You can reactivate it later by editing.');
    if (!approved) {
      return;
    }

    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/masters/${masterType}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`${title} deactivated successfully.`);
      if (editingId === id) {
        resetForm();
      }
      await loadItems();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Failed to delete master record.'));
      console.error('Error deleting master data:', deleteError);
    }
  };

  return (
    <section className="master-management">
      <div className="master-form-card">
        <h2>{editingId ? `Edit ${title}` : `Add ${title}`}</h2>
        <p>Manage your operational master records with full CRUD controls.</p>

        {message && <div className="master-alert success">{message}</div>}
        {error && <div className="master-alert error">{error}</div>}

        <form className="master-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={`Enter ${title.toLowerCase()} name`}
              required
            />
          </label>

          {isProductMaster && (
            <label>
              <span>Duration (minutes)</span>
              <input
                type="number"
                min="1"
                name="durationMinutes"
                value={form.durationMinutes}
                onChange={handleChange}
                placeholder="Enter duration in minutes"
                required
              />
            </label>
          )}

          <label>
            <span>Description</span>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description"
            />
          </label>

          <label className="master-checkbox">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            <span>Active</span>
          </label>

          <div className="master-form-actions">
            <button type="submit" disabled={saving}>
              {submitLabel}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="master-list-card">
        <h2>{title} List</h2>
        <p>Use edit and delete actions to maintain data quality.</p>

        <div className="master-list-controls">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={`Search ${title.toLowerCase()} records`}
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {loading && <div className="master-empty">Loading records...</div>}
        {!loading && filteredItems.length === 0 && <div className="master-empty">No records found.</div>}
        {!loading && filteredItems.length > 0 && (
          <div className="master-table-wrap">
            <table className="master-table">
              <thead>
                <tr>
                  <th>Name</th>
                  {isProductMaster && <th>Duration</th>}
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    {isProductMaster && <td>{item.durationMinutes || '-'} min</td>}
                    <td>{item.description || '-'}</td>
                    <td>
                      <span className={`status-pill ${item.active ? 'active' : 'inactive'}`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="master-row-actions">
                      <button type="button" className="action-edit" onClick={() => handleEdit(item)}>Edit</button>
                      <button type="button" className="action-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="master-pagination">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-text">Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

MasterManagement.propTypes = {
  title: PropTypes.string.isRequired,
  masterType: PropTypes.string.isRequired
};

export default MasterManagement;
