import React, { useState } from 'react';
import PropTypes from 'prop-types';
import StopProductionForm from './StopProductionForm';
import './ActiveProductionsTable.css';

const ActiveProductionsTable = ({ productions, onProductionStopped, currentEmployeeId, currentRole }) => {
  const canStop = (production) =>
    currentRole === 'ADMIN' || production.employeeId === currentEmployeeId;
  const [stoppingProduction, setStoppingProduction] = useState(null);

  const calculateDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now - start;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStopClick = (production) => {
    setStoppingProduction(production);
  };

  const handleStopProduction = () => {
    setStoppingProduction(null);
    onProductionStopped();
  };

  return (
    <div className="active-productions">
      <h2>Active Productions</h2>
      {productions.length === 0 ? (
        <p>No active productions</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Product Name</th>
              <th>Start Time</th>
              <th>Live Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productions.map((production) => (
              <tr key={production.id}>
                <td>{production.employeeId}</td>
                <td>{production.productName}</td>
                <td>{new Date(production.startTime).toLocaleString()}</td>
                <td>{calculateDuration(production.startTime)}</td>
                <td>On-Time</td>
                <td>
                  {canStop(production) ? (
                    <button
                      onClick={() => handleStopClick(production)}
                      className="stop-btn"
                    >
                      Stop
                    </button>
                  ) : (
                    <span className="stop-na">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {stoppingProduction && (
        <StopProductionForm
          production={stoppingProduction}
          onClose={() => setStoppingProduction(null)}
          onProductionStopped={handleStopProduction}
        />
      )}
    </div>
  );
};

ActiveProductionsTable.propTypes = {
  productions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onProductionStopped: PropTypes.func.isRequired,
  currentEmployeeId: PropTypes.string,
  currentRole: PropTypes.string
};

export default ActiveProductionsTable;