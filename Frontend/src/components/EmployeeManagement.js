import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    employeeId: '',
    name: '',
    role: 'EMPLOYEE',
    password: ''
  });

  const pageSize = 8;

  let submitLabel = 'Create';
  if (editingId) submitLabel = 'Update';
  if (saving) submitLabel = 'Saving...';

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data || []);
    } catch (loadError) {
      setError('Failed to load employees.');
      console.error('Error loading employees:', loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ employeeId: '', name: '', role: 'EMPLOYEE', password: '' });
    setMessage('');
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const getErrorMessage = (apiError, fallback) => {
    if (apiError?.response?.data?.message) return apiError.response.data.message;
    if (typeof apiError?.response?.data === 'string') return apiError.response.data;
    return fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: form.name,
        role: form.role
      };
      if (!editingId) {
        payload.employeeId = form.employeeId;
      }
      if (form.password) {
        payload.password = form.password;
      }

      if (editingId) {
        await axios.put(`/api/employees/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Employee updated successfully.');
      } else {
        await axios.post('/api/employees', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Employee created successfully.');
      }

      setEditingId(null);
      setForm({ employeeId: '', name: '', role: 'EMPLOYEE', password: '' });
      await loadEmployees();
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to save employee.'));
      console.error('Error saving employee:', saveError);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.id);
    setMessage('');
    setError('');
    setForm({
      employeeId: emp.employeeId || '',
      name: emp.name || '',
      role: emp.role || 'EMPLOYEE',
      password: ''
    });
  };

  const handleDelete = async (id) => {
    const approved = window.confirm('Delete this employee? This action cannot be undone.');
    if (!approved) return;
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Employee deleted successfully.');
      if (editingId === id) resetForm();
      await loadEmployees();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Failed to delete employee.'));
      console.error('Error deleting employee:', deleteError);
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = employees.filter((emp) => {
      const matchesSearch = !term
        || (emp.employeeId || '').toLowerCase().includes(term)
        || (emp.name || '').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    return filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [employees, searchTerm, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const pagedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <section className="emp-management">
      <div className="emp-form-card">
        <h2>{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
        <p>Manage your employee records with full CRUD controls.</p>

        {message && <div className="emp-alert success">{message}</div>}
        {error && <div className="emp-alert error">{error}</div>}

        <form className="emp-form" onSubmit={handleSubmit}>
          {!editingId && (
            <label>
              <span>Employee ID</span>
              <input
                type="text"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                placeholder="e.g. EMP0001"
                required
              />
            </label>
          )}

          <label>
            <span>Full Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </label>

          <label>
            <span>Role</span>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <label>
            <span>{editingId ? 'New Password (leave blank to keep current)' : 'Password (optional)'}</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={editingId ? 'Leave blank to keep current' : 'Auto-uses Employee ID if blank'}
            />
          </label>

          <div className="emp-form-actions">
            <button type="submit" disabled={saving}>{submitLabel}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="emp-list-card">
        <h2>Employee List</h2>
        <p>Search, edit and remove employee records.</p>

        <div className="emp-list-controls">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID or name"
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {loading && <div className="emp-empty">Loading employees...</div>}
        {!loading && filteredEmployees.length === 0 && <div className="emp-empty">No employees found.</div>}
        {!loading && filteredEmployees.length > 0 && (
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedEmployees.map((emp) => (
                  <tr key={emp.id} className={editingId === emp.id ? 'editing-row' : ''}>
                    <td>{emp.employeeId}</td>
                    <td>{emp.name}</td>
                    <td>
                      <span className={`emp-role-badge ${emp.role === 'ADMIN' ? 'admin' : 'employee'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="emp-actions">
                      <button
                        type="button"
                        className="action-edit"
                        onClick={() => handleEdit(emp)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="action-delete"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="emp-pagination">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ‹ Prev
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default EmployeeManagement;
