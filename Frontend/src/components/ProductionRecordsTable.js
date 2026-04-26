import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './ProductionRecordsTable.css';

const hasImagesForRun = async (id, token) => {
  try {
    const res = await axios.get(`/api/productions/${id}/images`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(res.data) && res.data.length > 0;
  } catch (err) {
    console.warn(`Unable to check images for production run ${id}:`, err);
    return false;
  }
};

const getDisplayStatus = (record) => {
  const quality = (record?.quality || '').toUpperCase();
  const status = (record?.status || '').toUpperCase();
  if (status === 'FAILED' || quality === 'REJECT' || quality === 'REJECTED' || quality === 'FAILED') {
    return 'FAILED';
  }
  return status;
};

const ProductionRecordsTable = ({ records, pageSize = 10 }) => {
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(null);
  const [nowTs, setNowTs] = useState(Date.now());
  const [hasImagesByRunId, setHasImagesByRunId] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const aTime = new Date(a.startTime).getTime() || 0;
      const bTime = new Date(b.startTime).getTime() || 0;
      return bTime - aTime;
    });
  }, [records]);

  const getActualDurationText = (record) => {
    if (record.actualDuration !== null && record.actualDuration !== undefined) {
      return `${record.actualDuration} min`;
    }

    if (record.status === 'ACTIVE' && record.startTime) {
      const startMs = new Date(record.startTime).getTime();
      if (!Number.isNaN(startMs)) {
        const liveMinutes = Math.max(0, Math.floor((nowTs - startMs) / 60000));
        return `${liveMinutes} min (live)`;
      }
    }

    return 'N/A';
  };

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
        link.remove();
      });
    } catch (err) {
      console.error('Failed to download images:', err);
      alert('Failed to download images.');
    } finally {
      setDownloading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [sortedRecords, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, page, pageSize]);

  useEffect(() => {
    let cancelled = false;

    const idsToCheck = pagedRecords
      .filter((record) => record.status === 'COMPLETED')
      .map((record) => record.id)
      .filter((id) => hasImagesByRunId[id] === undefined);

    if (idsToCheck.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    const checkImageAvailability = async () => {
      const token = localStorage.getItem('token');
      const entries = await Promise.all(
        idsToCheck.map(async (id) => {
          const hasImages = await hasImagesForRun(id, token);
          return [id, hasImages];
        })
      );

      if (!cancelled) {
        const updates = Object.fromEntries(entries);
        setHasImagesByRunId((prev) => ({ ...prev, ...updates }));
      }
    };

    checkImageAvailability();

    return () => {
      cancelled = true;
    };
  }, [pagedRecords, hasImagesByRunId]);

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
          {pagedRecords.map((record) => {
            const displayStatus = getDisplayStatus(record);
            let statusClass = 'status-badge active';
            if (displayStatus === 'FAILED') {
              statusClass = 'status-badge failed';
            } else if (displayStatus === 'COMPLETED') {
              statusClass = 'status-badge completed';
            }

            return (
              <tr key={record.id}>
                <td>{record.employeeId}</td>
                <td>{record.productName}</td>
                <td>{record.category}</td>
                <td>{record.workStation}</td>
                <td>{new Date(record.startTime).toLocaleDateString()}</td>
                <td>{record.expectedDuration} min</td>
                <td>{getActualDurationText(record)}</td>
                <td>
                  <span className={statusClass}>
                    {displayStatus}
                  </span>
                </td>
                <td>{record.quality || 'N/A'}</td>
                <td>{record.unitsProduced || 'N/A'}</td>
                <td title={record.logbookNotes || 'N/A'}>{record.logbookNotes || 'N/A'}</td>
                <td title={record.delayReason || 'N/A'}>{record.delayReason || 'N/A'}</td>
                <td>
                  {record.status === 'COMPLETED' && hasImagesByRunId[record.id] && (
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
            );
          })}
          {pagedRecords.length === 0 && (
            <tr>
              <td colSpan="13" className="empty-state">No production records found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {sortedRecords.length > 0 && (
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