import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import './ChartsSection.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ChartsSection = ({ productionHistory }) => {
  const [chartRenderKey, setChartRenderKey] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setChartRenderKey(prev => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prepare data for charts
  const completedRuns = productionHistory.filter(run => run.status === 'COMPLETED');

  // Bar Chart: Actual vs Expected Duration
  const barData = {
    labels: completedRuns.slice(0, 10).map(run => run.productName.substring(0, 20)),
    datasets: [
      {
        label: 'Expected Duration',
        data: completedRuns.slice(0, 10).map(run => run.expectedDuration),
        backgroundColor: 'rgba(44, 91, 230, 0.68)',
        borderRadius: 8,
      },
      {
        label: 'Actual Duration',
        data: completedRuns.slice(0, 10).map(run => run.actualDuration),
        backgroundColor: 'rgba(30, 47, 80, 0.78)',
        borderRadius: 8,
      },
    ],
  };

  // Doughnut Chart: On-Time vs Delayed
  const onTimeCount = completedRuns.filter(run => run.actualDuration <= run.expectedDuration).length;
  const delayedCount = completedRuns.length - onTimeCount;

  const doughnutData = {
    labels: ['On-Time', 'Delayed'],
    datasets: [
      {
        data: [onTimeCount, delayedCount],
        backgroundColor: ['rgba(62, 141, 97, 0.78)', 'rgba(210, 59, 88, 0.75)'],
        borderColor: ['rgba(62, 141, 97, 1)', 'rgba(210, 59, 88, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Line Chart: Daily Production Output
  const dailyData = {};
  completedRuns.forEach(run => {
    const date = new Date(run.startTime).toDateString();
    if (!dailyData[date]) {
      dailyData[date] = 0;
    }
    dailyData[date] += run.unitsProduced || 0;
  });

  const lineData = {
    labels: Object.keys(dailyData),
    datasets: [
      {
        label: 'Daily Units Produced',
        data: Object.values(dailyData),
        borderColor: 'rgba(44, 91, 230, 1)',
        backgroundColor: 'rgba(44, 91, 230, 0.12)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#2b3d5f',
          boxWidth: 12,
          useBorderRadius: true,
          borderRadius: 4,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#7183a4' },
        grid: { color: 'rgba(202, 214, 236, 0.4)' },
      },
      y: {
        ticks: { color: '#7183a4' },
        grid: { color: 'rgba(202, 214, 236, 0.4)' },
      },
    },
  };

  const doughnutOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: 'bottom',
      },
    },
  };

  return (
    <div className="charts-section">
      <h2>Analytics</h2>
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Actual vs Expected Duration</h3>
          <div className="chart-canvas chart-canvas--bar">
            <Bar key={`bar-${chartRenderKey}`} data={barData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>On-Time vs Delayed</h3>
          <div className="chart-canvas chart-canvas--doughnut">
            <Doughnut key={`doughnut-${chartRenderKey}`} data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-container full-width">
          <h3>Daily Production Output</h3>
          <div className="chart-canvas chart-canvas--line">
            <Line key={`line-${chartRenderKey}`} data={lineData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;