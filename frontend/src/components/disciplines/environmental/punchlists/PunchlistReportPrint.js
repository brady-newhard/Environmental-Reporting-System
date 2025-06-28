import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadDraft } from '../../../../utils/draftUtils';
import PageHeader from '../../../../components/common/PageHeader';
import { ArrowLeftOnRectangleIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function PunchlistReportPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportType = 'punchlist';

  useEffect(() => {
    const loadDraftData = async () => {
      if (!id) {
        setError('No draft ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const loadedDraft = await loadDraft(reportType, id);
        if (loadedDraft) {
          setDraft(loadedDraft);
        } else {
          setError('Draft not found');
        }
      } catch (err) {
        console.error('Error loading draft:', err);
        setError('Error loading draft: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDraftData();
  }, [id, reportType]);

  const handleBack = () => {
    navigate(`/environmental/reports/punchlist/review/${id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to format date as MM/DD/YYYY, but handle YYYY-MM-DD strings without timezone shift
  const formatDate = (value) => {
    if (!value) return '—';
    // If value is already in YYYY-MM-DD, format as MM/DD/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
    }
    // Otherwise, try to parse as Date
    const d = new Date(value);
    if (isNaN(d)) return value;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title="Environmental Punchlist Report Print"
          backPath={handleBack}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Loading draft...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title="Environmental Punchlist Report Print"
          backPath={handleBack}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{error}</h2>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title="Environmental Punchlist Report Print"
          backPath={handleBack}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">No report data provided.</h2>
        </div>
      </div>
    );
  }

  // Extract data from draft
  const header = draft.header || {};
  const sections = Array.isArray(draft.sections) ? draft.sections : [];
  const summaries = typeof draft.summaries === 'object' && draft.summaries !== null ? draft.summaries : {};
  const signature = draft.signature;
  const sigDate = draft.sigDate;
  const photos = Array.isArray(draft.photos) ? draft.photos : [];

  // Define the fields for each row as pairs
  const projectInfoRows = [
    [
      { label: 'Inspector', value: header.inspector },
      { label: 'Milepost Start', value: header.milepost_start },
    ],
    [
      { label: 'Project', value: header.project },
      { label: 'Milepost End', value: header.milepost_end },
    ],
    [
      { label: 'Spread', value: header.spread },
      { label: 'Station Start', value: header.station_start },
    ],
    [
      { label: 'Facility', value: header.facility },
      { label: 'Station End', value: header.station_end },
    ],
    [
      { label: 'Contractor', value: header.contractor },
      null,
    ],
  ];

  // Weather Info
  let weatherSection = null;
  if (Array.isArray(draft.sections)) {
    weatherSection = draft.sections.find(s => s.name && s.name.toLowerCase().includes('weather'));
  }
  const weatherRow = weatherSection && Array.isArray(weatherSection.rows) && weatherSection.rows.length > 0 ? weatherSection.rows[0] : {};
  const weatherInfo = [
    { label: 'Weather Conditions', value: weatherRow.weather_conditions || header.weather_conditions },
    { label: 'Temperature', value: weatherRow.temperature || header.temperature },
    { label: 'Precipitation Type', value: weatherRow.precipitation_type || header.precipitation_type },
    { label: 'Soil Conditions', value: weatherRow.soil_conditions || header.soil_conditions },
  ];
  const rainGauges = weatherRow.rain_gauges || header.rain_gauges || [];

  // Filter out project/weather info sections for dynamic sections
  const dynamicSections = Array.isArray(draft.sections)
    ? draft.sections.filter(
        (section) =>
          section &&
          section.name &&
          !section.name.toLowerCase().includes('project information') &&
          !section.name.toLowerCase().includes('weather information')
      )
    : [];

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print Header - Hidden on screen, visible in print */}
      <div className="hidden print:block print:fixed print:top-0 print:left-0 print:right-0 print:bg-white print:z-50 print:border-b-2 print:border-blue-200 print:pb-2">
        <div className="flex justify-between items-center px-8 py-4">
          <h1 className="text-2xl font-bold text-blue-800">Environmental Punchlist Report</h1>
          <div className="text-sm text-gray-600">
            Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Screen Header - Visible on screen, hidden in print */}
      <div className="print:hidden">
        <PageHeader
          title="Environmental Punchlist Report Print"
          backPath={handleBack}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <div className="flex justify-end mb-4">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print Report
          </button>
        </div>
      </div>

      {/* Print Content */}
      <div className="flex-1 px-8 py-8 print:px-8 print:py-8 flex flex-col">
        {/* Project Info */}
        <div className="print-section">
          <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
            <h2 className="text-xl font-bold text-blue-800">Project Information</h2>
            <div className="text-base font-semibold text-blue-800 ml-4">Date: {formatDate(header.date)}</div>
          </div>
          <table className="w-full mb-6 text-sm">
            <tbody>
              {projectInfoRows.map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                  {row.map((item, colIdx) => (
                    item ? (
                      <React.Fragment key={colIdx}>
                        <td className="font-semibold py-1 pr-4 w-48 text-gray-700">{item.label}</td>
                        <td className="py-1 text-gray-900">{item.value || '—'}</td>
                      </React.Fragment>
                    ) : (
                      <td key={colIdx} colSpan={2}></td>
                    )
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Weather Info */}
        <div className="print-section">
          <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4 mt-8">Weather Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {weatherInfo.map((info, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="font-semibold text-blue-700 text-sm">{info.label}:</span>
                <span className="text-gray-900">{info.value || '—'}</span>
              </div>
            ))}
          </div>
          {rainGauges.length > 0 && (
            <div className="mb-4">
              <span className="font-semibold text-blue-700 text-sm">Rain Gauges:</span>
              <table className="w-full mt-2 text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="text-left py-1 px-2 font-semibold">Location</th>
                    <th className="text-left py-1 px-2 font-semibold">Rain (in)</th>
                    <th className="text-left py-1 px-2 font-semibold">Snow (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {rainGauges.map((gauge, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-1 px-2">{gauge.location || '—'}</td>
                      <td className="py-1 px-2">{gauge.rain || '—'}</td>
                      <td className="py-1 px-2">{gauge.snow || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dynamic Sections */}
        {dynamicSections.map((section, idx) => (
          <div key={idx} className="mb-8 print-section">
            <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4 mt-8">{section.name}</h2>
            {section.rows && section.rows.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    {Object.keys(section.rows[0]).filter(key => key !== 'photos' && key !== 'photo_comments').map((field, i) => (
                      <th key={i} className="font-bold py-1 px-2 text-left">{field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</th>
                    ))}
                    <th className="font-bold py-1 px-2 text-left">Photos</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                      {Object.entries(row).filter(([key]) => key !== 'photos' && key !== 'photo_comments').map(([key, value], fieldIdx) => (
                        <td key={fieldIdx} className="py-1 px-2">
                          {typeof value === 'object' && value !== null ? JSON.stringify(value) : value || '—'}
                        </td>
                      ))}
                      <td className="py-1 px-2">
                        {row.photos && Array.isArray(row.photos) && row.photos.length > 0 ? (
                          <div className="text-xs">
                            {row.photos.length} photo{row.photos.length !== 1 ? 's' : ''}
                          </div>
                        ) : (
                          'No photos'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}

        {/* Item Photos Section */}
        {dynamicSections.some(section => 
          section.rows && section.rows.some(row => row.photos && row.photos.length > 0)
        ) && (
          <div className="mb-8 print-section">
            <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4 mt-8">Item Photos</h2>
            {dynamicSections.map((section, sectionIdx) => (
              section.rows && section.rows.map((row, rowIdx) => (
                row.photos && Array.isArray(row.photos) && row.photos.length > 0 && (
                  <div key={`${sectionIdx}-${rowIdx}`} className="mb-6 p-4 bg-gray-50 rounded-lg print-bg-gray-100">
                    <h3 className="font-semibold text-blue-800 mb-3 text-base">
                      Item #{row.item_number} - {row.feature}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {row.photos.map((photo, photoIdx) => (
                        <div key={photoIdx} className="relative">
                          <img
                            src={photo.url || photo.file || photo.preview || photo.image_url}
                            alt={`Item ${row.item_number} Photo ${photoIdx + 1}`}
                            className="w-full h-32 object-cover rounded-lg shadow-md"
                          />
                          {(photo.location || photo.description || photo.comment) && (
                            <div className="mt-2 text-xs">
                              {photo.location && (
                                <div className="font-semibold text-blue-700">Location: {photo.location}</div>
                              )}
                              {(photo.description || photo.comment) && (
                                <div className="text-gray-600 mt-1">{photo.description || photo.comment}</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))
            ))}
          </div>
        )}

        {/* Summaries */}
        <div className="mb-8 print-section">
          <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4 mt-8">Punchlist Summary</h2>
          {Object.entries(summaries).map(([key, value]) => (
            <div key={key} className="mb-2 text-base">
              <span className="font-semibold text-blue-700 mr-2">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> {value || '—'}
            </div>
          ))}
        </div>

        {/* Signature */}
        {signature && (
          <div className="mb-8 print-section">
            <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4 mt-8">Signature</h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <img src={signature} alt="Signature" className="max-w-xs h-16 object-contain" />
              </div>
              <div className="text-sm text-gray-600">
                <div>Date: {formatDate(sigDate)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <div className="mb-8 print-section">
            <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4 mt-8">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg border">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print-section {
            page-break-inside: avoid;
          }
          .print-bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
        }
      `}</style>
    </div>
  );
} 