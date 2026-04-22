import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleModeSwitch = (adminMode) => {
    setIsAdmin(adminMode);
    setError('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { employeeId };
      if (isAdmin) {
        payload.password = password;
      }

      const response = await axios.post('/api/auth/login', payload);
      const { token, role, employeeId: loggedInEmployeeId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('employeeId', loggedInEmployeeId);

      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>AssemblyTrack Login</h2>
        <p>Track production flow with a focused control center.</p>

        <div className="login-mode-toggle">
          <button
            type="button"
            className={`login-mode-btn ${!isAdmin ? 'active' : ''}`}
            onClick={() => handleModeSwitch(false)}
          >
            Employee
          </button>
          <button
            type="button"
            className={`login-mode-btn ${isAdmin ? 'active' : ''}`}
            onClick={() => handleModeSwitch(true)}
          >
            Admin
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="employeeId">Employee ID:</label>
          <input
            id="employeeId"
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter your employee ID"
            required
          />
        </div>

        {isAdmin && (
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
        )}

        {!isAdmin && (
          <p className="login-hint">Employees sign in with their Employee ID only — no password needed.</p>
        )}

        {error && <div className="error">{error}</div>}
        <button type="submit">{isAdmin ? 'Admin Login' : 'Employee Login'}</button>
      </form>
    </div>
  );
};

export default Login;