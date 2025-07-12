import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { loadDraft } from '../../../../utils/draftUtils';
import PageHeader from '../../../../components/common/PageHeader';
import { Button } from '../../../../components/ui/button';

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
  @page {
    size: letter;
    margin: 0.5in;
  }
  .print-section { break-inside: avoid; page-break-inside: avoid; }
  .print-photo-break { break-before: page; page-break-before: always; }
  .report-table { width: 100%; border-collapse: separate; border-spacing: 0; }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  tbody { display: table-row-group; }
}
`;

export default function DailyUtilityReportPrint() {
  const { id } = useParams();
  const location = useLocation();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      try {
        if (location.state?.reportData) {
          console.log('Print component: Using data from location state:', location.state.reportData);
          setDraft(location.state.reportData);
          setIsLoading(false);
          return;
        }
        console.log('Print component: Loading draft from storage:', id);
        const loadedDraft = await loadDraft('daily_utility', id);
        console.log('Print component: Loaded draft from storage:', loadedDraft);
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

  // Extract all data from draft, with fallbacks
  const {
    header = {},
    weather = { am: {}, pm: {} },
    am = false,
    pm = false,
    rows = [],
    equipmentRows = [],
    generalSummary = '',
    landSummary = '',
    envSummary = '',
    safety = '',
    preparedBy = '',
    signature = '',
    sigDate = '',
    photos = []
  } = draft;

  console.log('Print component data:', {
    header: Object.keys(header),
    weather: Object.keys(weather),
    rows: rows.length,
    equipmentRows: equipmentRows.length,
    photos: photos.length,
    generalSummary: generalSummary ? 'Present' : 'Empty',
    landSummary: landSummary ? 'Present' : 'Empty',
    envSummary: envSummary ? 'Present' : 'Empty',
    safety: safety ? 'Present' : 'Empty',
    preparedBy: preparedBy ? 'Present' : 'Empty',
    signature: signature ? 'Present' : 'Missing',
    sigDate: sigDate ? 'Present' : 'Empty'
  });

  // Project Info
  const projectInfoRows = [
    [
      { label: 'Project', value: header.project },
      { label: 'Spread', value: header.spread },
    ],
    [
      { label: 'Inspector', value: header.inspector },
      { label: 'AFE Number', value: header.afe },
    ],
    [
      { label: 'Contractor', value: header.contractor },
      { label: 'Date', value: formatDate(header.date) },
    ],
    [
      { label: 'Weekday', value: header.weekday },
      { label: 'Report No.', value: header.reportNo },
    ],
    [
      { label: 'Total Footage', value: header.totalFootage },
      null,
    ],
  ];

  // Add subcontractors if they exist
  [1, 2, 3].forEach(i => {
    if (header[`sub${i}`]) {
      projectInfoRows.push([
        { label: `Subcontractor ${i}`, value: header[`sub${i}`] },
        null,
      ]);
    }
  });

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
            <PageHeader title="Print Preview" backPath={`/utility/reports/daily/review/${id}`} />
            <Button onClick={() => window.print()} className="ml-auto bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">Send to Printer</Button>
          </div>
        )}
        {/* Main printable area - align with header edges */}
        <div className="w-full max-w-[816px] mx-auto bg-white shadow-2xl rounded-xl flex flex-col print:shadow-none print:rounded-none print:w-full print:max-w-none print:min-h-0 print:p-0 print:m-0">
          {/* Header */}
          <div className="w-full border-b-4 border-blue-500 bg-blue-900 text-white py-0.5 pl-1 pr-8 print:rounded-none rounded-t-xl">
            <div className="flex items-center mt-1 mb-1">
              <div className="flex-shrink-0 flex items-center justify-start" style={{ minWidth: '9rem' }}>
                <img src="/static/PIPE-Logo.png" alt="PIPE Logo" className="h-16 w-auto" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-3xl font-bold tracking-wide text-center">Daily Utility Report</h1>
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
                  <tr className="bg-gray-50 print-bg-gray-100">
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">AM Sky Cover:</td>
                    <td className="py-1 text-gray-900">{weather?.am?.sky || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">PM Sky Cover:</td>
                    <td className="py-1 text-gray-900">{weather?.pm?.sky || '—'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">AM Precipitation:</td>
                    <td className="py-1 text-gray-900">{weather?.am?.precip || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">PM Precipitation:</td>
                    <td className="py-1 text-gray-900">{weather?.pm?.precip || '—'}</td>
                  </tr>
                  <tr className="bg-gray-50 print-bg-gray-100">
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">AM Temperature:</td>
                    <td className="py-1 text-gray-900">{weather?.am?.temp ? `${weather.am.temp}°F` : '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">PM Temperature:</td>
                    <td className="py-1 text-gray-900">{weather?.pm?.temp ? `${weather.pm.temp}°F` : '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Construction Activities */}
            <div className="print-section">
              <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                <h2 className="text-xl font-bold text-blue-800">Construction Activities</h2>
              </div>
              {rows && rows.length > 0 && (
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-xs print:text-xs">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-1 px-1 text-left text-xs">Phase</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Start Station</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">End Station</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Daily Footage</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Cumulative</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">% Complete</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Contractor</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Crew</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                          <td className="py-1 px-1 text-xs">
                            {row.phase === 'Other' ? row.customPhase : row.phase}
                          </td>
                          <td className="py-1 px-1 text-xs">{row.startSta || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.endSta || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.dailyFootage || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.cumulativeFootage || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.percentComplete || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.contractor || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.crew || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.hours || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Equipment */}
            {equipmentRows && equipmentRows.length > 0 && (
              <div className="print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">Equipment</h2>
                </div>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-xs print:text-xs">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-1 px-1 text-left text-xs">Equipment</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Quantity</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Hours Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipmentRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                          <td className="py-1 px-1 text-xs">{row.equipment || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.qty || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.hoursUsed || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summaries */}
            <div className="print-section">
              <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                <h2 className="text-xl font-bold text-blue-800">Summaries</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">General Summary</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px] text-sm">
                    {generalSummary || 'No general summary provided.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Land Summary</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px] text-sm">
                    {landSummary || 'No land summary provided.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Environmental Summary</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px] text-sm">
                    {envSummary || 'No environmental summary provided.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Safety Concerns</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px] text-sm">
                    {safety || 'No safety concerns reported.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="flex flex-row items-center gap-6 mt-12 mb-8 print-section">
              <div className="text-base font-semibold whitespace-nowrap"><b>Prepared by:</b> {preparedBy || '—'}</div>
              {signature && (
                <img src={signature} alt="Signature" className="max-h-16 max-w-xs border border-gray-300 rounded bg-white shadow mb-0" />
              )}
              <div className="text-base font-semibold whitespace-nowrap"><b>Date:</b> {formatDate(sigDate)}</div>
            </div>

            {/* Photos */}
            {photos && photos.length > 0 && (
              <div className="print-photo-break print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">Photos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {photos.map((photo, idx) => {
                    // Use the same robust photo URL extraction logic as ReportPhotoSection
                    let possibleImageUrl;
                    if (photo.image_url || photo.url) {
                      // Uploaded photo with server URL
                      possibleImageUrl = photo.image_url || photo.url;
                    } else if (photo.preview) {
                      // Local photo with blob preview URL or base64 data URL
                      possibleImageUrl = photo.preview;
                    } else if (photo.file && photo.file instanceof File) {
                      // Local photo with File object - create object URL
                      possibleImageUrl = URL.createObjectURL(photo.file);
                    } else if (photo.file && typeof photo.file === 'string' && photo.file.startsWith('data:')) {
                      // Base64 data URL
                      possibleImageUrl = photo.file;
                    } else {
                      // Fallback to any other URL property
                      possibleImageUrl = photo.file || photo.image;
                    }
                    
                    // Handle invalid blob URLs by showing a placeholder
                    const isValidUrl = possibleImageUrl && 
                      (possibleImageUrl.startsWith('http') || 
                       possibleImageUrl.startsWith('blob:') || 
                       possibleImageUrl.startsWith('data:'));
                    
                    return (
                      <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 shadow-sm p-4 flex flex-col items-center w-full">
                        {isValidUrl ? (
                          <img 
                            src={possibleImageUrl} 
                            alt={photo.comment || photo.description || `Photo ${idx + 1}`} 
                            className="w-full h-40 object-contain rounded mb-2 bg-white border"
                            onError={(e) => {
                              console.error('Failed to load image in print:', possibleImageUrl);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-40 object-contain rounded mb-2 bg-white border flex items-center justify-center ${isValidUrl ? 'hidden' : ''}`}
                        >
                          <span className="text-gray-500 text-xs">Photo not available</span>
                        </div>
                        {photo.location && (
                          <div className="text-xs text-gray-600 mb-1 w-full"><b>Location:</b> {photo.location}</div>
                        )}
                        {(photo.comment || photo.description) && (
                          <div className="text-xs text-gray-700 w-full"><b>Comments:</b> {photo.comment || photo.description}</div>
                        )}
                      </div>
                    );
                  })}
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