import React, { useEffect, useState } from 'react';
import './ProgressChartTable.css';
import { getProgressChart } from '../../services/api';

const NUM_COLUMNS = 201;
const COLUMN_LABELS = Array.from({ length: NUM_COLUMNS }, (_, i) => (i * 0.1).toFixed(1));

const getCellColor = (value) => {
  switch (value) {
    case 1:
      return '#ffe066'; // in progress
    case 2:
      return '#8bc34a'; // complete
    default:
      return '#e0e0e0'; // not started
  }
};

const ProgressChartTable = ({ activityTitles = [] }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProgressChart();
        setProgressData(data);
      } catch (err) {
        setError('Failed to fetch progress chart data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading progress chart...</div>;
  if (error) return <div>{error}</div>;

  // Map activity titles to progress data, fallback to empty data if not found
  const activityRows = activityTitles.map((title) => {
    const row = progressData.find((r) => r.activity === title);
    let points = row ? row.progress_data.slice(0, NUM_COLUMNS) : [];
    while (points.length < NUM_COLUMNS) points.push(0);
    return { title, points };
  });

  return (
    <div className="progress-chart-table" style={{ overflowX: 'auto' }}>
      <table className="progress-grid-table">
        <thead>
          <tr>
            <th style={{ minWidth: 80, textAlign: 'right', fontWeight: 600 }}>
              Activity
            </th>
            {/* Empty header row for grid alignment */}
            {COLUMN_LABELS.map((_, idx) => (
              <th key={idx}></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activityRows.map((row) => (
            <tr key={row.title}>
              <td
                style={{
                  minWidth: 80,
                  maxWidth: 120,
                  textAlign: 'right',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  verticalAlign: 'middle',
                  height: 20,
                  lineHeight: '20px',
                  padding: 0,
                }}
              >
                {row.title}
              </td>
              {row.points.map((val, idx) => (
                <td
                  key={idx}
                  style={{ background: getCellColor(val), width: 16, height: 20, padding: 0, border: '1px solid #ccc' }}
                ></td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ minWidth: 80, textAlign: 'right', fontWeight: 600, fontSize: '0.85em', paddingTop: 8 }}>
              Milepost
            </td>
            {COLUMN_LABELS.map((label, idx) => (
              <td
                key={idx}
                style={{
                  fontSize: '0.7em',
                  color: '#333',
                  textAlign: 'center',
                  padding: 0,
                  border: '1px solid #ccc',
                  height: 40,
                  verticalAlign: 'bottom',
                }}
              >
                <span style={{ display: 'inline-block', transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>{label}</span>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ProgressChartTable; 