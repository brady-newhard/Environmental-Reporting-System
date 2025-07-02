import React, { useEffect, useState } from "react";
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

// Custom print CSS for landscape orientation and page breaks
const printPageBreakCss = `
@media print {
  @page {
    size: landscape;
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

export default function PunchlistReportPrint() {
  const { id } = useParams();
  const location = useLocation();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('PunchlistReportPrint: Component loaded', { id, location: location.state });

  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      try {
        if (location.state?.reportData) {
          console.log('PunchlistReportPrint: Using report data from state', location.state.reportData);
          setDraft(location.state.reportData);
          setIsLoading(false);
          return;
        }
        console.log('PunchlistReportPrint: Loading draft from storage', id);
        const loadedDraft = await loadDraft('punchlist', id);
        console.log('PunchlistReportPrint: Loaded draft', loadedDraft);
        setDraft(loadedDraft);
      } catch (error) {
        console.error('PunchlistReportPrint: Error loading draft', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDraftData();
  }, [id, location.state]);

  // For page numbers in print
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-lg text-white">
        {isLoading ? 'Loading Punchlist Print Preview...' : 'No draft data found'}
      </div>
    );
  }

  // Extract data from draft
  const header = draft.header || {};
  const sections = Array.isArray(draft.sections) ? draft.sections : [];
  const summaries = typeof draft.summaries === 'object' && draft.summaries !== null ? draft.summaries : {};
  const photos = Array.isArray(draft.photos) ? draft.photos : [];

  // Filter sections to only include Punchlist Items (remove project/weather info)
  const punchlistSection = sections.find(s => s.name === 'Punchlist Items');
  const punchlistItems = punchlistSection && Array.isArray(punchlistSection.rows) ? punchlistSection.rows : [];

  // Check if there are any photos to display
  const hasItemPhotos = punchlistItems.some(item => item.photos && Array.isArray(item.photos) && item.photos.length > 0);
  const hasPhotos = photos.length > 0 || hasItemPhotos;

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
  .punchlist-table { 
    width: 100% !important; 
    border-collapse: collapse !important; 
    font-size: 0.7rem !important; 
  }
  .punchlist-table th, .punchlist-table td { 
    font-size: 0.7rem !important; 
    padding: 2px 4px !important; 
    border: 1px solid #d1d5db !important;
  }
  .punchlist-table th { 
    font-weight: bold !important; 
    background-color: #f3f4f6 !important; 
  }
  .punchlist-table .issue-cell, .punchlist-table .recommendations-cell {
    max-width: 150px !important;
    white-space: normal !important;
    word-wrap: break-word !important;
  }
}
`}</style>
      <div className="w-full flex flex-col items-center print:block">
        {/* Add PageHeader and Print button above the main print area, only visible on screen */}
        {typeof window !== 'undefined' && (
          <div className="flex items-center gap-4 mb-4 print:hidden w-full max-w-[816px] mx-auto">
            <PageHeader title="Print Preview" backPath={`/environmental/reports/punchlist/review/${id}`} />
            <Button onClick={() => window.print()} className="ml-auto bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">Send to Printer</Button>
          </div>
        )}
        {/* Main printable area as a flex column for sticky footer */}
        <div className="max-w-[816px] min-h-[1056px] bg-white shadow-2xl rounded-xl mx-auto flex flex-col print:shadow-none print:rounded-none print:w-full print:max-w-none print:min-h-0 print:p-0 print:m-0">
          {/* Header */}
          <div className="w-full border-b-4 border-blue-500 bg-blue-900 text-white py-0.5 pl-1 pr-8 print:rounded-none rounded-t-xl">
            <div className="flex items-center mt-1 mb-1">
              <div className="flex-shrink-0 flex items-center justify-start" style={{ minWidth: '9rem' }}>
                <img src="/staticfiles/PIPE-Logo.png" alt="PIPE Logo" className="h-16 w-auto" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-3xl font-bold tracking-wide text-center">Environmental Punchlist Report</h1>
              </div>
              <div className="flex-shrink-0" style={{ minWidth: '9rem' }}></div>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 px-8 py-8 print:px-8 print:py-8 flex flex-col">
            {/* Punchlist Items Table */}
            <div className="print-section">
              <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                <h2 className="text-xl font-bold text-blue-800">Punchlist Items</h2>
              </div>
              {punchlistItems.length > 0 && (
                <table className="w-full text-xs punchlist-table">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="font-bold py-2 px-2 text-left">Item #</th>
                      <th className="font-bold py-2 px-2 text-left">Inspector</th>
                      <th className="font-bold py-2 px-2 text-left">Spread</th>
                      <th className="font-bold py-2 px-2 text-left">Facility</th>
                      <th className="font-bold py-2 px-2 text-left">Start Station</th>
                      <th className="font-bold py-2 px-2 text-left">End Station</th>
                      <th className="font-bold py-2 px-2 text-left">Feature/Location</th>
                      <th className="font-bold py-2 px-2 text-left">Date Observed</th>
                      <th className="font-bold py-2 px-2 text-left">Issue</th>
                      <th className="font-bold py-2 px-2 text-left">Recommendations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {punchlistItems.map((row, rowIdx) => (
                      <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                        <td className="py-2 px-2 font-semibold">{row.item_number || '—'}</td>
                        <td className="py-2 px-2">{row.inspector || '—'}</td>
                        <td className="py-2 px-2">{Array.isArray(row.spread) ? row.spread.join(', ') : row.spread || '—'}</td>
                        <td className="py-2 px-2">{Array.isArray(row.facility) ? row.facility.join(', ') : row.facility || '—'}</td>
                        <td className="py-2 px-2">{row.start_station || '—'}</td>
                        <td className="py-2 px-2">{row.end_station || '—'}</td>
                        <td className="py-2 px-2">{row.feature || '—'}</td>
                        <td className="py-2 px-2">{formatDate(row.date_observed)}</td>
                        <td className="py-2 px-2 issue-cell" style={{ whiteSpace: 'pre-line', maxWidth: '150px' }}>{row.issue || '—'}</td>
                        <td className="py-2 px-2 recommendations-cell" style={{ whiteSpace: 'pre-line', maxWidth: '150px' }}>{row.recommendations || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Photos */}
            {hasPhotos && (
              <div className="mt-10 mb-10 print-photo-break">
                <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4">Photos</h2>
                {/* Group photos by item */}
                {punchlistItems.map((item, itemIdx) => (
                  item.photos && Array.isArray(item.photos) && item.photos.length > 0 && (
                    <div key={itemIdx} className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Item #{item.item_number} - {item.feature}
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                        {item.photos.map((photo, photoIdx) => (
                          <div key={photoIdx} className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 flex flex-col items-center w-full">
                            {(photo.url || photo.image_url) ? (
                              <img src={photo.url || photo.image_url} alt={`Item ${item.item_number} Photo ${photoIdx + 1}`} className="w-full h-40 object-contain rounded mb-2 bg-white border" />
                            ) : (
                              <div className="w-full h-32 flex items-center justify-center bg-gray-200 text-gray-400 rounded mb-2">No Image</div>
                            )}
                            {(photo.location || photo.description || photo.comment) && (
                              <div className="w-full space-y-1">
                                {photo.location && (
                                  <div className="text-xs font-semibold text-gray-700">Location: {photo.location}</div>
                                )}
                                {(photo.description || photo.comment) && (
                                  <div className="text-xs text-gray-500 mt-1">{photo.description || photo.comment}</div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
                {/* Show any standalone photos (not associated with items) */}
                {photos.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">General Photos</h4>
                    <div className="grid grid-cols-2 gap-6">
                      {photos.map((photo, photoIdx) => (
                        <div key={photoIdx} className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 flex flex-col items-center w-full">
                          {(photo.url || photo.image_url) ? (
                            <img src={photo.url || photo.image_url} alt={`Photo ${photoIdx + 1}`} className="w-full h-40 object-contain rounded mb-2 bg-white border" />
                          ) : (
                            <div className="w-full h-32 flex items-center justify-center bg-gray-200 text-gray-400 rounded mb-2">No Image</div>
                          )}
                          {(photo.location || photo.description || photo.comment) && (
                            <div className="w-full space-y-1">
                              {photo.location && (
                                <div className="text-xs font-semibold text-gray-700">Location: {photo.location}</div>
                              )}
                              {(photo.description || photo.comment) && (
                                <div className="text-xs text-gray-500 mt-1">{photo.description || photo.comment}</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
