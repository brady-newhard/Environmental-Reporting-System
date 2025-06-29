import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { loadDraft } from '../../../../utils/draftUtils';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';

function formatDate(value) {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
  }
  const d = new Date(value);
  if (isNaN(d)) return value;
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

// Custom print CSS for page breaks and section avoidance
const printPageBreakCss = `
@media print {
  .print-section { break-inside: avoid; page-break-inside: avoid; }
  .print-photo-break { break-before: page; page-break-before: always; }
  .report-table { width: 100%; border-collapse: separate; border-spacing: 0; }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  tbody { display: table-row-group; }
}
`;

export default function EnvironmentalDailyReportPrint() {
  const { id } = useParams();
  const location = useLocation();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      try {
        if (location.state?.reportData) {
          setDraft(location.state.reportData);
          setIsLoading(false);
          return;
        }
        const loadedDraft = await loadDraft('environmental', id);
        setDraft(loadedDraft);
      } finally {
        setIsLoading(false);
      }
    };
    loadDraftData();
  }, [id, location.state]);

  // For page numbers in print (optional, can be improved with a real print lib)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      const totalPages = Math.max(1, Math.round(document.body.scrollHeight / window.innerHeight));
      document.querySelectorAll('.print-footer-page').forEach((el, idx) => {
        el.textContent = `Page ${idx + 1} of ${totalPages}`;
      });
    };
    window.addEventListener('afterprint', handler);
    setTimeout(handler, 500);
    return () => window.removeEventListener('afterprint', handler);
  }, []);

  if (isLoading || !draft) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-lg">Loading...</div>;
  }

  // Project Info
  const header = draft.header || {};
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

  // Photos (move to end)
  const photos = Array.isArray(draft.photos) ? draft.photos : [];

  // Signature
  const signature = draft.signature;
  const sigDate = draft.sigDate;

  // Summaries
  const summaries = typeof draft.summaries === 'object' && draft.summaries !== null ? draft.summaries : {};

  // Sections (filter out project/weather info)
  const sections = Array.isArray(draft.sections)
    ? draft.sections.filter(
        (section) =>
          section &&
          section.name &&
          !section.name.toLowerCase().includes('project information') &&
          !section.name.toLowerCase().includes('weather information')
      )
    : [];

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center py-8 print:py-0 print:bg-white">
      <style>{printPageBreakCss}</style>
      <style>{`
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .print-bg-gray-200 { background-color: #e5e7eb !important; }
  .print-footer { display: block !important; position: fixed !important; bottom: 0; left: 0; right: 0; width: 100vw; z-index: 9999; }
  .no-print-footer { display: none !important; }
  .print-section table { 
    font-size: 0.7rem !important; 
    width: 100% !important; 
    table-layout: fixed !important;
  }
  .print-section th, .print-section td { 
    font-size: 0.7rem !important; 
    padding: 2px 4px !important; 
    border: 1px solid #d1d5db !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  .print-section th { 
    font-weight: bold !important; 
    background-color: #f3f4f6 !important; 
  }
}
`}</style>
      <div className="w-full flex flex-col items-center print:block">
        {/* Add PageHeader and Print button above the main print area, only visible on screen */}
        {typeof window !== 'undefined' && (
          <div className="flex items-center gap-4 mb-4 print:hidden w-full max-w-[816px] mx-auto">
            <PageHeader title="Print Preview" backPath={`/environmental/reports/daily/review/${id}`} />
            <Button onClick={() => window.print()} className="ml-auto bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">Send to Printer</Button>
          </div>
        )}
        {/* Main printable area as a flex column for sticky footer */}
        <div className="max-w-[816px] min-h-[1056px] bg-white shadow-2xl rounded-xl mx-auto flex flex-col print:shadow-none print:rounded-none print:w-full print:max-w-none print:min-h-0 print:p-0 print:m-0">
          {/* Header */}
          <div className="w-full border-b-4 border-blue-500 bg-blue-900 text-white py-0.5 pl-1 pr-8 print:rounded-none rounded-t-xl">
            <div className="flex items-center mt-1 mb-1">
              <div className="flex-shrink-0 flex items-center justify-start" style={{ minWidth: '9rem' }}>
                <img src="/PIPE-Logo.png" alt="PIPE Logo" className="h-16 w-auto" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-3xl font-bold tracking-wide text-center">Environmental Daily Report</h1>
              </div>
              <div className="flex-shrink-0" style={{ minWidth: '9rem' }}></div>
            </div>
          </div>
          {/* Main Content */}
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
              <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                <h2 className="text-xl font-bold text-blue-800">Weather Information</h2>
              </div>
              <table className="w-full mb-6 text-sm">
                <tbody>
                  {weatherInfo.reduce((rows, item, idx) => {
                    if (idx % 2 === 0) {
                      rows.push([item]);
                    } else {
                      rows[rows.length - 1].push(item);
                    }
                    return rows;
                  }, []).map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                      {row.map((item, colIdx) => (
                        <React.Fragment key={colIdx}>
                          <td className="font-semibold py-1 pr-4 w-48 text-gray-700">{item.label}</td>
                          <td className="py-1 text-gray-900">{item.value || '—'}</td>
                        </React.Fragment>
                      ))}
                      {row.length < 2 && <td colSpan={2}></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Rain Gauges */}
            {Array.isArray(rainGauges) && rainGauges.length > 0 && (
              <div className="mb-8 print-section">
                <div className="font-semibold text-gray-700 mb-2">Rain Gauges:</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="font-bold py-1 px-2 text-left">Location</th>
                      <th className="font-bold py-1 px-2 text-left">Rain (in)</th>
                      <th className="font-bold py-1 px-2 text-left">Snow (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rainGauges.map((g, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                        <td className="py-1 px-2">{g.location || '—'}</td>
                        <td className="py-1 px-2">{g.rain || '—'}</td>
                        <td className="py-1 px-2">{g.snow || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Dynamic Sections */}
            {sections.map((section, idx) => {
              // Special handling for Crew Daily Summaries: only show allowed fields
              if (section.name === 'Crew Daily Summaries') {
                const allowedFields = ['Crew', 'Foreman', 'Start Station', 'End Station', 'Summary'];
                return (
                  <div key={idx} className="mb-8 print-section">
                    <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4 mt-8">{section.name}</h2>
                    {section.rows && section.rows.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs print:text-xs">
                          <thead>
                            <tr className="bg-blue-50">
                              {allowedFields.map((field, i) => (
                                <th key={i} className="font-bold py-1 px-1 text-left text-xs" style={field === 'Summary' ? { minWidth: '300px', maxWidth: '600px' } : {}}>{field}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.rows.map((row, rowIdx) => (
                              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                                {allowedFields.map((field, fieldIdx) => (
                                  <td key={fieldIdx} className="py-1 px-1 text-xs" style={field === 'Summary' ? { minWidth: '300px', maxWidth: '600px', wordWrap: 'break-word' } : { maxWidth: '120px', wordWrap: 'break-word' }}>
                                    {row[field] || '—'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              }
              // Default rendering for other sections
              return (
                <div key={idx} className="mb-8 print-section">
                  <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4 mt-8">{section.name}</h2>
                  {section.rows && section.rows.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs print:text-xs">
                        <thead>
                          <tr className="bg-blue-50">
                            {Object.keys(section.rows[0]).map((field, i) => (
                              <th key={i} className="font-bold py-1 px-1 text-left text-xs">{field}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows.map((row, rowIdx) => (
                            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                              {Object.values(row).map((value, fieldIdx) => (
                                <td key={fieldIdx} className="py-1 px-1 text-xs" style={{ maxWidth: '120px', wordWrap: 'break-word' }}>
                                  {typeof value === 'object' && value !== null ? JSON.stringify(value) : value || '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
            {/* Summaries */}
            <div className="mb-8 print-section">
              <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4 mt-8">Environmental Inspection Summary</h2>
              {Object.entries(summaries).map(([key, value]) => (
                <div key={key} className="mb-2 text-base">
                  <span className="font-semibold text-blue-700 mr-2">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> {value || '—'}
                </div>
              ))}
            </div>
            {/* Signature */}
            <div className="flex flex-row items-center gap-6 mt-12 mb-8 print-section">
              <div className="text-base font-semibold whitespace-nowrap"><b>Prepared by:</b> {header.inspector || '—'}</div>
              {signature && (
                <img src={signature} alt="Signature" className="max-h-16 max-w-xs border border-gray-300 rounded bg-white shadow mb-0" />
              )}
              <div className="text-base font-semibold whitespace-nowrap"><b>Date:</b> {formatDate(sigDate)}</div>
            </div>
            {/* Photos */}
            {photos.length > 0 && (
              <div className="mt-10 mb-10 print-photo-break">
                <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4">Photos</h2>
                <div className="grid grid-cols-2 gap-6">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 shadow-sm p-4 flex flex-col items-center w-full">
                      {(photo.url || photo.image_url) ? (
                        <img src={photo.url || photo.image_url} alt={photo.comment || photo.description || `Photo ${idx + 1}`} className="w-full h-40 object-contain rounded mb-2 bg-white border" />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-gray-200 text-gray-400 rounded mb-2">No Image</div>
                      )}
                      {photo.location && (
                        <div className="text-xs text-gray-600 mb-1 w-full"><b>Location:</b> {photo.location}</div>
                      )}
                      {(photo.comment || photo.description) && (photo.comment || photo.description).trim() !== '' && (
                        <div className="text-xs text-gray-700 w-full"><b>Comments:</b> {photo.comment || photo.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Footer always at the bottom */}
          <div className="w-full border-t-4 border-blue-500 bg-blue-900 text-white py-2 px-8 print:rounded-none rounded-b-xl text-sm flex justify-between items-center mt-auto no-print-footer">
            <span className="flex-1 text-center">&copy; {new Date().getFullYear()} WildStone Solutions, LLC</span>
            <span className="print-footer-page">Page 1 of 1</span>
          </div>
          {/* Print-only sticky footer */}
          <div className="print-footer hidden print:flex w-full border-t-4 border-blue-500 bg-blue-900 text-white py-2 px-8 text-sm items-center" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
            <div className="flex-1 text-center">&copy; {new Date().getFullYear()} WildStone Solutions, LLC</div>
          </div>
        </div>
      </div>
    </div>
  );
} 