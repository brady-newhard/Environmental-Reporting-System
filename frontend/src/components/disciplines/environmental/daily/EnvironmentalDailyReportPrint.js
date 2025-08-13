import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { loadDraft } from '../../../../utils/draftUtils';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { formatPhotoUrl } from '../../../../utils/photoUtils';

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

export default function EnvironmentalDailyReportPrint({ reportData }) {
  const { id } = useParams();
  const location = useLocation();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      try {
        console.log('EnvironmentalDailyReportPrint - props:', { reportData, id });
        console.log('EnvironmentalDailyReportPrint - location.state:', location.state);
        
        // Prioritize reportData prop, then location.state, then load from storage
        if (reportData) {
          console.log('EnvironmentalDailyReportPrint: Using reportData prop:', reportData);
          setDraft(reportData);
          setIsLoading(false);
          return;
        }
        
        if (location.state?.reportData) {
          console.log('EnvironmentalDailyReportPrint: Using location.state.reportData:', location.state.reportData);
          
          // Check if the report data is complete
          const reportData = location.state.reportData;
          if (!reportData.header && !reportData.sections && !reportData.summaries) {
            console.log('EnvironmentalDailyReportPrint: Incomplete report data detected');
            // For incomplete data, we can't display much, but we'll try to show what we have
          }
          
          setDraft(reportData);
          setIsLoading(false);
          return;
        }
        
        if (id) {
          console.log('EnvironmentalDailyReportPrint: Loading draft from storage for id:', id);
          const loadedDraft = await loadDraft('environmental', id);
          setDraft(loadedDraft);
        } else {
          console.log('EnvironmentalDailyReportPrint: No id provided, setting draft to null');
          setDraft(null);
        }
      } catch (error) {
        console.error('EnvironmentalDailyReportPrint: Error loading draft:', error);
        setDraft(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadDraftData();
  }, [id, location.state, reportData]);

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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-white text-lg">Loading...</div>;
  }

  if (!draft) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No Report Data Available</h2>
          <p className="text-gray-600">The report data could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Extract all data from draft, with fallbacks
  const {
    header = {},
    sections = [],
    summaries = {},
    signature = '',
    sigDate = '',
    preparedBy = ''
  } = draft;

  // Project Info
  const headerData = header || {};
  
  // Weather Info
  let weatherSection = null;
  if (Array.isArray(sections)) {
    weatherSection = sections.find(s => s.name && s.name.toLowerCase().includes('weather'));
  }
  const weatherRow = weatherSection && Array.isArray(weatherSection.rows) && weatherSection.rows.length > 0 ? weatherSection.rows[0] : {};
  
  // Filter sections to show only those with data
  const filledSections = sections.filter(section => 
    section && section.rows && section.rows.length > 0 && 
    section.rows.some(row => Object.values(row).some(val => val && val.toString().trim() !== ''))
  );

  console.log('Environmental Daily Print component data:', {
    header: Object.keys(headerData),
    sections: filledSections.length,
    summaries: Object.keys(summaries),
    signature: signature ? 'Present' : 'Missing',
    sigDate: sigDate ? 'Present' : 'Empty',
    preparedBy: preparedBy ? 'Present' : 'Empty'
  });

  // Photos (move to end)
  const photos = Array.isArray(draft.photos) ? draft.photos : [];

  // Sections (filter out project/weather info)
  const filteredSections = Array.isArray(sections)
    ? sections.filter(
        (section) =>
          section &&
          section.name &&
          !section.name.toLowerCase().includes('project information') &&
          !section.name.toLowerCase().includes('weather information')
      )
    : [];

  console.log('Review/Print photos:', photos);

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
    border-collapse: separate !important;
    border-spacing: 0 !important;
  }
  .print-section th, .print-section td { 
    font-size: 0.7rem !important; 
    padding: 2px 4px !important; 
    border: none !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  .print-section th { 
    font-weight: bold !important; 
    background-color: #f3f4f6 !important; 
  }
  .print-footer { 
    margin-top: 20px !important; 
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
        {/* Main printable area - align with header edges */}
        <div className="w-full max-w-[816px] mx-auto bg-white shadow-2xl rounded-xl flex flex-col print:shadow-none print:rounded-none print:w-full print:max-w-none print:min-h-0 print:p-0 print:m-0">
          {/* Header */}
          <div className="w-full border-b-4 border-blue-500 bg-blue-900 text-white py-0.5 pl-1 pr-8 print:rounded-none rounded-t-xl">
            <div className="flex items-center mt-1 mb-1">
              <div className="flex-shrink-0 flex items-center justify-start" style={{ minWidth: '9rem' }}>
                <img src="/static/PIPE-Logo.png" alt="PIPE Logo" className="h-16 w-auto" />
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
                <div className="text-base font-semibold text-blue-800 ml-4">Date: {formatDate(headerData.inspection_date)}</div>
              </div>
              <table className="w-full mb-6 text-sm">
                <tbody>
                  <tr className="bg-gray-50 print-bg-gray-100">
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Project:</td>
                    <td className="py-1 text-gray-900 text-center">{headerData.project || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Spread:</td>
                    <td className="py-1 text-gray-900 text-center">{headerData.spread || '—'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Contractor:</td>
                    <td className="py-1 text-gray-900 text-center">{headerData.contractor || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Inspector:</td>
                    <td className="py-1 text-gray-900 text-center">{headerData.inspector || '—'}</td>
                  </tr>
                  <tr className="bg-gray-50 print-bg-gray-100">
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Facility:</td>
                    <td className="py-1 text-gray-900 text-center">{headerData.facility || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Milepost Start:</td>
                    <td className="py-1 text-gray-900 text-center">{headerData.milepost_start || '—'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Milepost End:</td>
                    <td className="py-1 text-gray-900 text-center">{headerData.milepost_end || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Station Start:</td>
                    <td className="py-1 text-gray-900 text-center">{headerData.station_start || '—'}</td>
                  </tr>
                  <tr className="bg-gray-50 print-bg-gray-100">
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Station End:</td>
                    <td className="py-1 text-gray-900 text-center">{headerData.station_end || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700"></td>
                    <td className="py-1 text-gray-900 text-center"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Weather Information */}
            {weatherSection && weatherSection.rows && weatherSection.rows.length > 0 && (
              <div className="print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">Weather Information</h2>
                </div>
                <table className="w-full mb-6 text-sm">
                  <tbody>
                    <tr className="bg-gray-50 print-bg-gray-100">
                      <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Weather Conditions:</td>
                      <td className="py-1 text-gray-900 text-center">{weatherRow.weather_conditions || '—'}</td>
                      <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Temperature:</td>
                      <td className="py-1 text-gray-900 text-center">{weatherRow.temperature || '—'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Precipitation Type:</td>
                      <td className="py-1 text-gray-900 text-center">{weatherRow.precipitation_type || '—'}</td>
                      <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Soil Conditions:</td>
                      <td className="py-1 text-gray-900 text-center">{weatherRow.soil_conditions || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Crew Daily Summaries */}
            {filteredSections.filter(s => s.name === 'Crew Daily Summaries').map((section, sectionIdx) => (
              <div key={sectionIdx} className="print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">{section.name}</h2>
                </div>
                {section.rows && section.rows.length > 0 && (
                  <table className="w-full mb-6 text-sm">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-1 px-1 text-left text-xs">Crew</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Foreman</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Start Station</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">End Station</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                          <td className="py-1 px-1 text-xs">{row.Crew || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.Foreman || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row['Start Station'] || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row['End Station'] || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row.Summary || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}

            {/* Daily Progress */}
            {filteredSections.filter(s => s.name === 'Daily Progress').map((section, sectionIdx) => (
              <div key={sectionIdx} className="print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">{section.name}</h2>
                </div>
                {section.rows && section.rows.length > 0 && (
                  <table className="w-full mb-6 text-sm">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-1 px-1 text-left text-xs">Phase</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">Start Station</th>
                        <th className="font-bold py-1 px-1 text-left text-xs">End Station</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                          <td className="py-1 px-1 text-xs">{row.Phase || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row['Start Station'] || '—'}</td>
                          <td className="py-1 px-1 text-xs">{row['End Station'] || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}

            {/* Environmental Summary */}
            <div className="print-section">
              <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                <h2 className="text-xl font-bold text-blue-800">Environmental Summary</h2>
              </div>
              <div className="mb-6">
                {Object.entries(summaries).map(([key, value]) => (
                  <div key={key} className="mb-2 text-sm">
                    <span className="font-semibold text-blue-700 mr-2">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> 
                    <span className="text-gray-900">{value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div className="flex flex-row items-center gap-6 mt-12 mb-8 print-section">
              <div className="text-base font-semibold whitespace-nowrap"><b>Prepared by:</b> {headerData.inspector || '—'}</div>
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
                  {photos.map((photo, idx) => {
                    let possibleImageUrl;
                    if (photo.image_url || photo.url) {
                      possibleImageUrl = photo.image_url || photo.url;
                    } else if (photo.preview) {
                      possibleImageUrl = photo.preview;
                    } else if (photo.file && photo.file instanceof File) {
                      possibleImageUrl = URL.createObjectURL(photo.file);
                    } else {
                      possibleImageUrl = photo.file || photo.image;
                    }
                    
                    const imageSrc = formatPhotoUrl(possibleImageUrl);
                    
                    return (
                      <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 shadow-sm p-4 flex flex-col items-center w-full">
                        {imageSrc ? (
                          <img src={imageSrc} alt={photo.comment || photo.description || `Photo ${idx + 1}`} className="w-full h-40 object-contain rounded mb-2 bg-white border" />
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