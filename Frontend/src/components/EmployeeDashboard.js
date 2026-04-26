import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StartProductionForm from './StartProductionForm';
import ActiveProductionsTable from './ActiveProductionsTable';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [activeProductions, setActiveProductions] = useState([]);
  const [showStartForm, setShowStartForm] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCompactScreen, setIsCompactScreen] = useState(window.innerWidth <= 1100);
  const navigate = useNavigate();
  const currentEmployeeId = localStorage.getItem('employeeId');
  const currentRole = localStorage.getItem('role');

  useEffect(() => {
    fetchActiveProductions();
    const interval = setInterval(fetchActiveProductions, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const compact = window.innerWidth <= 1100;
      setIsCompactScreen(compact);
      if (!compact) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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
    localStorage.removeItem('employeeId');
    navigate('/');
  };

  const handleProductionStarted = () => {
    setShowStartForm(false);
    fetchActiveProductions();
  };

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  return (
    <div className="employee-dashboard">
      <aside className={`dashboard-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-top">
            <div>
              <h2 className="sidebar-brand">AssemblyTrack</h2>
              <p className="sidebar-role">Operator Workspace</p>
            </div>
            <button
              type="button"
              className="sidebar-close-btn"
              aria-label="Close menu"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          <nav className="sidebar-nav">
            <span className="sidebar-item active">Active Runs</span>
          </nav>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </aside>

      {isCompactScreen && isMobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <main className="dashboard-main">
        <header className="dashboard-header">
          {isCompactScreen && (
            <div className="mobile-header-actions">
              <button
                type="button"
                className="sidebar-toggle-btn"
                aria-label="Open navigation menu"
                onClick={toggleSidebar}
              >
                <span className="hamburger-line" />
                <span className="hamburger-line" />
                <span className="hamburger-line" />
              </button>
              <span className="mobile-brand">AssemblyTrack</span>
              <button type="button" className="mobile-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
          <div className="dashboard-header-main">
            <div>
              <h1>Employee Dashboard</h1>
              <p>Handle live production with precise updates.</p>
            </div>
            <button onClick={() => setShowStartForm(true)} className="start-btn">
              + Start New Production
            </button>
          </div>
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