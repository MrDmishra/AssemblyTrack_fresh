import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './ProductionRecordsTable.css';

const ProductionRecordsTable = ({ records, pageSize = 10 }) => {
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(null);

  const handleDownloadImages = async (record) => {
    setDownloading(record.id);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/productions/${record.id}/images`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const images = res.data;
      if (!images || images.length === 0) {
        alert('No images uploaded for this production run.');
        return;
      }
      images.forEach((img) => {
        const link = document.createElement('a');
        link.href = img.imageData; // already a data URI (base64)
        link.download = img.fileName || `image_${img.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (err) {
      alert('Failed to download images.');
    } finally {
      setDownloading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [records, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, page, pageSize]);

  return (
    <div className="production-records">
      <table>
        <thead>
          <tr>
            <th className="col-employee">Employee ID</th>
            <th className="col-product">Product Name</th>
            <th className="col-category">Category</th>
            <th className="col-station">Work Station</th>
            <th className="col-date">Date</th>
            <th className="col-duration">Expected Duration</th>
            <th className="col-duration">Actual Duration</th>
            <th className="col-status">Status</th>
            <th className="col-quality">Quality</th>
            <th className="col-units">Units Produced</th>
            <th className="col-notes">Notes</th>
            <th className="col-delay">Delay Reason</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pagedRecords.map((record) => (
            <tr key={record.id}>
              <td>{record.employeeId}</td>
              <td>{record.productName}</td>
              <td>{record.category}</td>
              <td>{record.workStation}</td>
              <td>{new Date(record.startTime).toLocaleDateString()}</td>
              <td>{record.expectedDuration} min</td>
              <td>{record.actualDuration ? `${record.actualDuration} min` : 'N/A'}</td>
              <td>
                <span className={record.status === 'COMPLETED' ? 'status-badge completed' : 'status-badge active'}>
                  {record.status}
                </span>
              </td>
              <td>{record.quality || 'N/A'}</td>
              <td>{record.unitsProduced || 'N/A'}</td>
              <td title={record.logbookNotes || 'N/A'}>{record.logbookNotes || 'N/A'}</td>
              <td title={record.delayReason || 'N/A'}>{record.delayReason || 'N/A'}</td>
              <td>
                {record.status === 'COMPLETED' && (
                  <button
                    type="button"
                    className="download-img-btn"
                    onClick={() => handleDownloadImages(record)}
                    disabled={downloading === record.id}
                    title="Download uploaded images"
                  >
                    {downloading === record.id ? '...' : '⬇ Images'}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {pagedRecords.length === 0 && (
            <tr>
              <td colSpan="13" className="empty-state">No production records found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {records.length > 0 && (
        <div className="table-pagination">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="pagination-text">Page {page} of {totalPages}</span>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

ProductionRecordsTable.propTypes = {
  records: PropTypes.arrayOf(PropTypes.object).isRequired,
  pageSize: PropTypes.number
};

export default ProductionRecordsTable;