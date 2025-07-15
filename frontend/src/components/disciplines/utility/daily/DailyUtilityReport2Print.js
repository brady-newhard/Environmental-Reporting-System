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

export default function DailyUtilityReport2Print() {
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
        const loadedDraft = await loadDraft('daily_utility_2', id);
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
    headcounts = {},
    subcontractors = [],
    inspectionPersonnel = [],
    craft = '',
    environmental = '',
    survey = '',
    land = '',
    morningTemp = '',
    midTemp = '',
    weather = '',
    precipitation = '',
    abnormalConditions = '',
    crewAdverse = '',
    progressRows = [],
    payItems = [],
    remarks = '',
    equipment = [],
    trucking = [],
    crews = [],
    preparedBy = '',
    signature = '',
    sigDate = '',
    photos = []
  } = draft;

  // Filter out empty progress rows (only show rows with data)
  const filledProgressRows = progressRows.filter(row => 
    row.from || row.to || row.feet || row.comments
  );

  // Filter out empty pay item rows (only show rows with data)
  const filledPayItems = payItems.filter(item => 
    item.from || item.to || item.qty || item.comments
  );

  console.log('Print component data:', {
    header: Object.keys(header),
    headcounts: Object.keys(headcounts),
    progressRows: filledProgressRows.length,
    payItems: filledPayItems.length,
    photos: photos.length,
    remarks: remarks ? 'Present' : 'Empty',
    preparedBy: preparedBy ? 'Present' : 'Empty',
    signature: signature ? 'Present' : 'Missing',
    sigDate: sigDate ? 'Present' : 'Empty'
  });

  // Project Info
  const projectInfoRows = [
    [
      { label: 'Section', value: header.section },
      { label: 'Spread', value: header.spread },
      { label: 'Contractor', value: header.contractor },
      { label: 'Inspector', value: header.inspector },
    ],
  ];

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
            <PageHeader title="Print Preview" backPath={`/utility/reports/daily2/review/${id}`} />
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
                <h1 className="text-3xl font-bold tracking-wide text-center">Daily Utility Report 2</h1>
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
                <div className="text-base font-semibold text-blue-800 ml-4">Date: {formatDate(header.workDate)}</div>
              </div>
              <table className="w-full mb-6 text-sm">
                <tbody>
                  <tr className="bg-gray-50 print-bg-gray-100">
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Section:</td>
                    <td className="py-1 text-gray-900 text-center">{header.section || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Spread:</td>
                    <td className="py-1 text-gray-900 text-center">{header.spread || '—'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Contractor:</td>
                    <td className="py-1 text-gray-900 text-center">{header.contractor || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Inspector:</td>
                    <td className="py-1 text-gray-900 text-center">{header.inspector || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Contractor/Subcontractor Headcount */}
            <div className="print-section">
              <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                <h2 className="text-xl font-bold text-blue-800">Contractor/Subcontractor Headcount</h2>
              </div>
              
              {/* Contractor Headcount */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Contractor</h3>
                <table className="w-full mb-4 text-sm">
                  <tbody>
                    {/* Line 1: Office and Foreman */}
                    <tr className="bg-gray-50 print-bg-gray-100">
                      <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Office:</td>
                      <td className="py-1 text-gray-900 text-center">{headcounts.office || '—'}</td>
                      <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Foreman Name:</td>
                      <td className="py-1 text-gray-900 text-center">{headcounts.foreman || '—'}</td>
                    </tr>
                    {/* Line 2: Laborers, Operators, Teamsters */}
                    <tr>
                      <td className="font-semibold py-1 pr-4 w-32 text-gray-700">Laborers:</td>
                      <td className="py-1 text-gray-900 text-center">{headcounts.laborers || '—'}</td>
                      <td className="font-semibold py-1 pr-4 w-32 text-gray-700">Operators:</td>
                      <td className="py-1 text-gray-900 text-center">{headcounts.operators || '—'}</td>
                      <td className="font-semibold py-1 pr-4 w-32 text-gray-700">Teamsters:</td>
                      <td className="py-1 text-gray-900 text-center">{headcounts.teamsters || '—'}</td>
                    </tr>
                    {/* Line 3: Welders, Helpers, Other */}
                    <tr className="bg-gray-50 print-bg-gray-100">
                      <td className="font-semibold py-1 pr-4 w-32 text-gray-700">Welders:</td>
                      <td className="py-1 text-gray-900 text-center">{headcounts.welders || '—'}</td>
                      <td className="font-semibold py-1 pr-4 w-32 text-gray-700">Helpers:</td>
                      <td className="py-1 text-gray-900 text-center">{headcounts.helpers || '—'}</td>
                      <td className="font-semibold py-1 pr-4 w-32 text-gray-700">Other:</td>
                      <td className="py-1 text-gray-900 text-center">{headcounts.other || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Subcontractors */}
              {subcontractors.length > 0 && subcontractors.some(s => s.company) && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">Subcontractors</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-1 px-2 text-left">Company</th>
                        <th className="font-bold py-1 px-2 text-left">Headcount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subcontractors.filter(s => s.company).map((subcontractor, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                          <td className="py-1 px-2">{subcontractor.company}</td>
                          <td className="py-1 px-2">{subcontractor.headcount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Other Info */}
            <div className="print-section">
              <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                <h2 className="text-xl font-bold text-blue-800">Inspection Personnel</h2>
              </div>
              <table className="w-full mb-6 text-sm">
                <tbody>
                  <tr className="bg-gray-50 print-bg-gray-100">
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Craft:</td>
                    <td className="py-1 text-gray-900">{craft || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Environmental:</td>
                    <td className="py-1 text-gray-900">{environmental || '—'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Survey:</td>
                    <td className="py-1 text-gray-900">{survey || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Land:</td>
                    <td className="py-1 text-gray-900">{land || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Weather */}
            <div className="print-section">
              <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                <h2 className="text-xl font-bold text-blue-800">Weather</h2>
              </div>
              <table className="w-full mb-6 text-sm">
                <tbody>
                  <tr className="bg-gray-50 print-bg-gray-100">
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Morning Temp:</td>
                    <td className="py-1 text-gray-900 text-center">{morningTemp || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Mid Temp:</td>
                    <td className="py-1 text-gray-900 text-center">{midTemp || '—'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Weather:</td>
                    <td className="py-1 text-gray-900 text-center">{weather || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Precipitation:</td>
                    <td className="py-1 text-gray-900 text-center">{precipitation || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Working Conditions Questions */}
            <div className="print-section">
              <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                <h2 className="text-xl font-bold text-blue-800">Working Conditions</h2>
              </div>
              <table className="w-full mb-6 text-sm">
                <tbody>
                  <tr>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700 whitespace-nowrap">Did ABNORMAL working conditions exist that adversely affected progress?</td>
                    <td className="py-1 text-gray-900 text-center">{abnormalConditions || '—'}</td>
                  </tr>
                  <tr className="bg-gray-50 print-bg-gray-100">
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700 whitespace-nowrap">Any Crews affected by adverse weather, right-of-way or other working conditions?</td>
                    <td className="py-1 text-gray-900 text-center">{crewAdverse || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Progress/Activity Table - Only show filled rows */}
            {filledProgressRows.length > 0 && (
              <div className="print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">Progress / Activity</h2>
                </div>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-xs print:text-xs">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/5">Activity</th>
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/10">From</th>
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/10">To</th>
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/10">Feet Today</th>
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/2">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filledProgressRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                          <td className="py-1 px-1 text-xs text-center">{row.activity}</td>
                          <td className="py-1 px-1 text-xs text-center">{row.from || '—'}</td>
                          <td className="py-1 px-1 text-xs text-center">{row.to || '—'}</td>
                          <td className="py-1 px-1 text-xs text-center">{row.feet || '—'}</td>
                          <td className="py-1 px-1 text-xs text-center" style={{ maxWidth: '120px', wordWrap: 'break-word' }}>{row.comments || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pay Item Logs Table - Only show filled rows */}
            {filledPayItems.length > 0 && (
              <div className="print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">Pay Item Logs</h2>
                </div>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-xs print:text-xs">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/6">Item</th>
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/12">UOM</th>
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/12">From</th>
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/12">To</th>
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/12">Quantity Today</th>
                        <th className="font-bold py-1 px-1 text-center text-xs w-1/3">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filledPayItems.map((item, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                          <td className="py-1 px-1 text-xs text-center">{item.item}</td>
                          <td className="py-1 px-1 text-xs text-center">{item.uom}</td>
                          <td className="py-1 px-1 text-xs text-center">{item.from || '—'}</td>
                          <td className="py-1 px-1 text-xs text-center">{item.to || '—'}</td>
                          <td className="py-1 px-1 text-xs text-center">{item.qty || '—'}</td>
                          <td className="py-1 px-1 text-xs text-center" style={{ maxWidth: '120px', wordWrap: 'break-word' }}>{item.comments || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Equipment */}
            {equipment.length > 0 && equipment.some(e => e.type) && (
              <div className="print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">Equipment</h2>
                </div>
                <table className="w-full mb-6 text-sm">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="font-bold py-1 px-2 text-center">Type</th>
                      <th className="font-bold py-1 px-2 text-center">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.filter(e => e.type).map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                        <td className="py-1 px-2 text-center">{item.isCustom ? item.customType : item.type}</td>
                        <td className="py-1 px-2 text-center">{item.qty || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Trucking */}
            {trucking.length > 0 && trucking.some(t => t.type) && (
              <div className="print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">Trucking</h2>
                </div>
                <table className="w-full mb-6 text-sm">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="font-bold py-1 px-2 text-center">Type</th>
                      <th className="font-bold py-1 px-2 text-center">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucking.filter(t => t.type).map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                        <td className="py-1 px-2 text-center">{item.isCustom ? item.customType : item.type}</td>
                        <td className="py-1 px-2 text-center">{item.qty || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Crews */}
            {crews.length > 0 && crews.some(c => c.type) && (
              <div className="print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">Crews</h2>
                </div>
                <table className="w-full mb-6 text-sm">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="font-bold py-1 px-2 text-center">Type</th>
                      <th className="font-bold py-1 px-2 text-center">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crews.filter(c => c.type).map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 print-bg-gray-100' : ''}>
                        <td className="py-1 px-2 text-center">{item.isCustom ? item.customType : item.type}</td>
                        <td className="py-1 px-2 text-center">{item.qty || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Remarks */}
            {remarks && (
              <div className="print-section">
                <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                  <h2 className="text-xl font-bold text-blue-800">Remarks</h2>
                </div>
                <div className="mb-6 text-base">
                  <p className="text-gray-900 whitespace-pre-wrap">{remarks}</p>
                </div>
              </div>
            )}

            {/* Signature Section */}
            <div className="flex flex-row items-center gap-6 mt-12 mb-8 print-section">
              <div className="text-base font-semibold whitespace-nowrap"><b>Prepared by:</b> {preparedBy || '—'}</div>
              {signature && (
                <img src={signature} alt="Signature" className="max-h-16 max-w-xs border border-gray-300 rounded bg-white shadow mb-0" />
              )}
              <div className="text-base font-semibold whitespace-nowrap"><b>Date:</b> {formatDate(sigDate)}</div>
            </div>

            {/* Photos */}
            {photos && photos.length > 0 && (
              <div className="mt-10 mb-10 print-photo-break">
                <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4">Photos</h2>
                <div className="grid grid-cols-2 gap-6">
                  {photos.map((photo, idx) => {
                    // Use the same robust photo URL extraction logic as ReportPhotoSection
                    let possibleImageUrl;
                    if (photo.image_url || photo.url) {
                      // Uploaded photo with server URL
                      possibleImageUrl = photo.image_url || photo.url;
                    } else if (photo.preview) {
                      // Local photo with blob preview URL
                      possibleImageUrl = photo.preview;
                    } else if (photo.file && photo.file instanceof File) {
                      // Local photo with File object - create object URL
                      possibleImageUrl = URL.createObjectURL(photo.file);
                    } else {
                      // Fallback to any other URL property
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