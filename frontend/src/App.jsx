import { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({ baseURL: API_URL });

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [products, setProducts] = useState([]);
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', sku: '', description: '' });
  const [runForm, setRunForm] = useState({ productId: '', quantity: 1, status: 'PLANNED', startedAt: '', completedAt: '' });
  const [runImage, setRunImage] = useState({ runId: '', image: null });
  const [error, setError] = useState('');

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const loadDashboard = useCallback(async (activeToken = token) => {
    const headers = { Authorization: `Bearer ${activeToken}` };
    try {
      const [productsRes, runsRes, statsRes] = await Promise.all([
        api.get('/api/products', { headers }),
        api.get('/api/production-runs', { headers }),
        api.get('/api/dashboard/stats', { headers }),
      ]);
      setProducts(productsRes.data);
      setRuns(runsRes.data);
      setStats(statsRes.data);
      setError('');
    } catch {
      setError('Unable to load data. Please log in again.');
    }
  }, [token]);

  const login = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { token: jwt, role: userRole } = response.data;
      localStorage.setItem('token', jwt);
      localStorage.setItem('role', userRole);
      setToken(jwt);
      setRole(userRole);
      await loadDashboard(jwt);
      setError('');
    } catch {
      setError('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken('');
    setRole('');
    setProducts([]);
    setRuns([]);
    setStats(null);
  };

  const createProduct = async (event) => {
    event.preventDefault();
    await api.post('/api/products', productForm, { headers: authHeaders });
    setProductForm({ name: '', sku: '', description: '' });
    await loadDashboard();
  };

  const createRun = async (event) => {
    event.preventDefault();
    await api.post('/api/production-runs', {
      ...runForm,
      productId: Number(runForm.productId),
      quantity: Number(runForm.quantity),
      startedAt: `${runForm.startedAt}:00`,
      completedAt: runForm.completedAt ? `${runForm.completedAt}:00` : null,
    }, { headers: authHeaders });
    setRunForm({ productId: '', quantity: 1, status: 'PLANNED', startedAt: '', completedAt: '' });
    await loadDashboard();
  };

  const uploadImage = async (event) => {
    event.preventDefault();
    if (!runImage.runId || !runImage.image) return;
    const body = new FormData();
    body.append('image', runImage.image);
    await api.post(`/api/production-runs/${runImage.runId}/image`, body, {
      headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' },
    });
    setRunImage({ runId: '', image: null });
    await loadDashboard();
  };

  if (!token) {
    return (
      <main className="auth-page">
        <form className="card" onSubmit={login}>
          <h1>AssemblyTrack Login</h1>
          <p>Secure manufacturing tracking for admin and employee roles.</p>
          <input
            placeholder="Username"
            value={credentials.username}
            onChange={(event) => setCredentials({ ...credentials, username: event.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit">Login</button>
          <small>Default: admin/Admin@123 or employee/Employee@123</small>
        </form>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div>
          <h1>AssemblyTrack Dashboard</h1>
          <p>{role === 'ROLE_ADMIN' ? 'Administrator' : 'Employee'} session</p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      {stats && (
        <section className="stats-grid">
          <article className="card"><h3>Total Products</h3><strong>{stats.totalProducts}</strong></article>
          <article className="card"><h3>Total Runs</h3><strong>{stats.totalRuns}</strong></article>
          <article className="card"><h3>In Progress</h3><strong>{stats.runStatusCounts?.IN_PROGRESS || 0}</strong></article>
          <article className="card"><h3>Completed</h3><strong>{stats.runStatusCounts?.COMPLETED || 0}</strong></article>
        </section>
      )}

      <section className="layout">
        {role === 'ROLE_ADMIN' && (
          <form className="card" onSubmit={createProduct}>
            <h2>Master Data (Products)</h2>
            <input placeholder="Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            <input placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} required />
            <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
            <button type="submit">Create Product</button>
          </form>
        )}

        <form className="card" onSubmit={createRun}>
          <h2>Production Run Tracking</h2>
          <select value={runForm.productId} onChange={(e) => setRunForm({ ...runForm, productId: e.target.value })} required>
            <option value="">Select Product</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
          </select>
          <input type="number" min="1" value={runForm.quantity} onChange={(e) => setRunForm({ ...runForm, quantity: e.target.value })} required />
          <select value={runForm.status} onChange={(e) => setRunForm({ ...runForm, status: e.target.value })}>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <label>Started At<input type="datetime-local" value={runForm.startedAt} onChange={(e) => setRunForm({ ...runForm, startedAt: e.target.value })} required /></label>
          <label>Completed At<input type="datetime-local" value={runForm.completedAt} onChange={(e) => setRunForm({ ...runForm, completedAt: e.target.value })} /></label>
          <button type="submit">Create Run</button>
        </form>

        <form className="card" onSubmit={uploadImage}>
          <h2>Image Upload</h2>
          <select value={runImage.runId} onChange={(e) => setRunImage({ ...runImage, runId: e.target.value })} required>
            <option value="">Select Run</option>
            {runs.map((run) => <option key={run.id} value={run.id}>Run #{run.id} - {run.status}</option>)}
          </select>
          <input type="file" accept="image/*" onChange={(e) => setRunImage({ ...runImage, image: e.target.files?.[0] || null })} required />
          <button type="submit">Upload</button>
        </form>
      </section>

      <section className="card table-card">
        <h2>Recent Production Runs</h2>
        <table>
          <thead>
            <tr><th>ID</th><th>Product</th><th>Qty</th><th>Status</th><th>Image</th></tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td>{run.id}</td>
                <td>{run.product?.name}</td>
                <td>{run.quantity}</td>
                <td>{run.status}</td>
                <td>{run.imagePath ? 'Uploaded' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default App;
