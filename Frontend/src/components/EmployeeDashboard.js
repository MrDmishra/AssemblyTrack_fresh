import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StartProductionForm from './StartProductionForm';
import ActiveProductionsTable from './ActiveProductionsTable';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [activeProductions, setActiveProductions] = useState([]);
  const [showStartForm, setShowStartForm] = useState(false);
  const navigate = useNavigate();
  const currentEmployeeId = localStorage.getItem('employeeId');
  const currentRole = localStorage.getItem('role');

  useEffect(() => {
    fetchActiveProductions();
    const interval = setInterval(fetchActiveProductions, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActiveProductions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/productions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveProductions(response.data);
    } catch (error) {
      console.error('Error fetching active productions:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleProductionStarted = () => {
    setShowStartForm(false);
    fetchActiveProductions();
  };

  return (
    <div className="employee-dashboard">
      <aside className="dashboard-sidebar">
        <div>
          <h2 className="sidebar-brand">AssemblyTrack</h2>
          <p className="sidebar-role">Operator Workspace</p>
          <nav className="sidebar-nav">
            <span className="sidebar-item active">Active Runs</span>
          </nav>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Employee Dashboard</h1>
            <p>Handle live production with precise updates.</p>
          </div>
          <button onClick={() => setShowStartForm(true)} className="start-btn">
            + Start New Production
          </button>
        </header>

        <div className="dashboard-content">
          {showStartForm && (
            <StartProductionForm
              onClose={() => setShowStartForm(false)}
              onProductionStarted={handleProductionStarted}
            />
          )}

          <ActiveProductionsTable
            productions={activeProductions}
            onProductionStopped={fetchActiveProductions}
            currentEmployeeId={currentEmployeeId}
            currentRole={currentRole}
          />
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;