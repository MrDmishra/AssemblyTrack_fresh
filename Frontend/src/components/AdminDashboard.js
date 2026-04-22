import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardMetrics from './DashboardMetrics';
import ProductionRecordsTable from './ProductionRecordsTable';
import ChartsSection from './ChartsSection';
import MasterManagement from './MasterManagement';
import EmployeeManagement from './EmployeeManagement';
import './AdminDashboard.css';

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AdminDashboard = () => {
  const todayDate = new Date();
  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(todayDate.getDate() - 7);

  const today = formatDateInput(todayDate);
  const defaultStartDate = formatDateInput(sevenDaysAgoDate);

  const masterMenus = [
    { key: 'product', label: 'Product', type: 'product' },
    { key: 'category', label: 'Category', type: 'category' },
    { key: 'work-station', label: 'Work Station', type: 'work-station' },
    { key: 'tool', label: 'Tool', type: 'tool' }
  ];

  const [metrics, setMetrics] = useState(null);
  const [productionHistory, setProductionHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCompactScreen, setIsCompactScreen] = useState(window.innerWidth <= 980);
  const [activePrimaryMenu, setActivePrimaryMenu] = useState('dashboard');
  const [activeMasterMenu, setActiveMasterMenu] = useState('product');
  const [isMasterExpanded, setIsMasterExpanded] = useState(true);
  const [filters, setFilters] = useState({
    startDate: defaultStartDate,
    endDate: today,
    category: '',
    status: '',
    search: ''
  });
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      const [metricsResponse, historyResponse] = await Promise.all([
        axios.get('/api/dashboard/metrics', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/productions/history', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setMetrics(metricsResponse.data);
      setProductionHistory(historyResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const refreshTimer = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(refreshTimer);
  }, [fetchDashboardData]);

  useEffect(() => {
    const onResize = () => {
      const compact = window.innerWidth <= 980;
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

  const applyFilters = useCallback(() => {
    let filtered = [...productionHistory];

    if (filters.startDate) {
      const start = new Date(`${filters.startDate}T00:00:00`);
      filtered = filtered.filter(record => new Date(record.startTime) >= start);
    }

    if (filters.endDate) {
      const end = new Date(`${filters.endDate}T23:59:59`);
      filtered = filtered.filter(record => new Date(record.startTime) <= end);
    }

    if (filters.category) {
      filtered = filtered.filter(record => record.category.toLowerCase().includes(filters.category.toLowerCase()));
    }

    if (filters.status) {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(record =>
        record.employeeId.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.productName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
  }, [filters, productionHistory]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === 'startDate' && filters.endDate && value > filters.endDate) {
      setFilters({
        ...filters,
        startDate: value,
        endDate: value
      });
      return;
    }

    if (name === 'endDate' && filters.startDate && value < filters.startDate) {
      setFilters({
        ...filters,
        startDate: value,
        endDate: value
      });
      return;
    }

    setFilters({
      ...filters,
      [name]: value
    });
  };

  const escapeCsv = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value).replaceAll('"', '""');
    return `"${stringValue}"`;
  };

  const handleExport = () => {
    if (!filteredHistory.length) {
      return;
    }

    const headers = [
      'Employee ID', 'Product Name', 'Category', 'Work Station', 'Start Date',
      'Expected Duration', 'Actual Duration', 'Status', 'Quality', 'Units Produced',
      'Notes', 'Delay Reason'
    ];

    const rows = filteredHistory.map(record => ([
      record.employeeId,
      record.productName,
      record.category,
      record.workStation,
      new Date(record.startTime).toLocaleString(),
      record.expectedDuration,
      record.actualDuration ?? 'N/A',
      record.status,
      record.quality ?? 'N/A',
      record.unitsProduced ?? 'N/A',
      record.logbookNotes ?? '',
      record.delayReason ?? ''
    ].map(escapeCsv).join(',')));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `production_records_${filters.startDate}_to_${filters.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  const handleNavItemClick = (menuKey) => {
    if (menuKey === 'master') {
      setIsMasterExpanded(prev => !prev);
      setActivePrimaryMenu('master');
    } else {
      setActivePrimaryMenu(menuKey);
    }

    if (isCompactScreen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleMasterItemClick = (masterKey) => {
    setActivePrimaryMenu('master');
    setActiveMasterMenu(masterKey);
    setIsMasterExpanded(true);
    if (isCompactScreen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const activeMasterConfig = masterMenus.find(item => item.key === activeMasterMenu) || masterMenus[0];

  const getHeaderTitle = () => {
    if (activePrimaryMenu === 'master') return `${activeMasterConfig.label} Master`;
    if (activePrimaryMenu === 'employee-master') return 'Employee Master';
    return 'Management Overview';
  };

  const getHeaderSubtitle = () => {
    if (activePrimaryMenu === 'master') return 'Create, update, and maintain master data for operations.';
    if (activePrimaryMenu === 'employee-master') return 'Add, edit and remove employee records.';
    return 'Monitor production performance and operational quality.';
  };

  return (
    <div className="admin-dashboard">
      <aside className={`dashboard-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-top">
            <div>
              <h2 className="sidebar-brand">AssemblyTrack</h2>
              <p className="sidebar-role">Admin Panel</p>
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
            <button
              type="button"
              className={`sidebar-item ${activePrimaryMenu === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavItemClick('dashboard')}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`sidebar-item ${activePrimaryMenu === 'employee-master' ? 'active' : ''}`}
              onClick={() => handleNavItemClick('employee-master')}
            >
              Employee Master
            </button>

            <div className="master-menu-wrapper">
              <button
                type="button"
                className={`sidebar-item sidebar-item-master ${activePrimaryMenu === 'master' ? 'active' : ''}`}
                onClick={() => handleNavItemClick('master')}
              >
                <span>Master</span>
                <span className={`master-chevron ${isMasterExpanded ? 'expanded' : ''}`}>▾</span>
              </button>

              {isMasterExpanded && (
                <div className="master-submenu">
                  {masterMenus.map(menu => (
                    <button
                      key={menu.key}
                      type="button"
                      className={`master-submenu-item ${activePrimaryMenu === 'master' && activeMasterMenu === menu.key ? 'active' : ''}`}
                      onClick={() => handleMasterItemClick(menu.key)}
                    >
                      {menu.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </aside>

      {isCompactScreen && isMobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
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
          <div>
            <div className="dashboard-header-main">
              <div>
                <h1>{getHeaderTitle()}</h1>
                <p>{getHeaderSubtitle()}</p>
              </div>

              {activePrimaryMenu !== 'master' && activePrimaryMenu !== 'employee-master' && (
                <div className="date-range-controls">
                  <label>
                    <span>Start Date</span>
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      max={today}
                      onChange={handleFilterChange}
                    />
                  </label>
                  <label>
                    <span>End Date</span>
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      min={filters.startDate}
                      max={today}
                      onChange={handleFilterChange}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {activePrimaryMenu === 'master' && (
            <MasterManagement
              title={activeMasterConfig.label}
              masterType={activeMasterConfig.type}
            />
          )}
          {activePrimaryMenu === 'employee-master' && <EmployeeManagement />}
          {activePrimaryMenu !== 'master' && activePrimaryMenu !== 'employee-master' && (
            <>
              {metrics && <DashboardMetrics metrics={metrics} />}

              <ChartsSection productionHistory={filteredHistory} />

              <section className="filters-section">
                <div>
                  <h2>Production Records</h2>
                  <p>Filter and export production details.</p>
                </div>
                <div className="filters">
                  <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={filters.category}
                    onChange={handleFilterChange}
                  />
                  <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ACTIVE">Active</option>
                  </select>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search employee or product"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                  <button onClick={handleExport} className="export-btn">Export CSV</button>
                </div>
              </section>

              <ProductionRecordsTable records={filteredHistory} pageSize={10} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;