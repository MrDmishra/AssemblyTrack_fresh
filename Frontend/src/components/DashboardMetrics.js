import React from 'react';
import './DashboardMetrics.css';

const DashboardMetrics = ({ metrics }) => {
  return (
    <div className="dashboard-metrics">
      <h2>Dashboard Metrics</h2>
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Runs Completed</h3>
          <div className="metric-value">{metrics.totalRunsCompleted}</div>
        </div>
        <div className="metric-card">
          <h3>Delayed Runs</h3>
          <div className="metric-value delayed">{metrics.delayedRuns}</div>
        </div>
        <div className="metric-card">
          <h3>Total Units Produced</h3>
          <div className="metric-value">{metrics.totalUnitsProduced}</div>
        </div>
        <div className="metric-card">
          <h3>On-Time Rate</h3>
          <div className="metric-value">{metrics.onTimeRate.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;