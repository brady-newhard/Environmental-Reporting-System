import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getReports, approveReport, rejectReport } from '../../services/api';
import api from '../../services/api';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';



// Import the print components for each report type
import EnvironmentalDailyReportPrint from '../disciplines/environmental/daily/EnvironmentalDailyReportPrint';
import DailyUtilityReportPrint from '../disciplines/utility/daily/DailyUtilityReportPrint';
import DailyUtilityReport2Print from '../disciplines/utility/daily/DailyUtilityReport2Print';
import PunchlistReportPrint from '../disciplines/environmental/punchlists/PunchlistReportPrint';
import SWPPPReportPrint from '../disciplines/environmental/swppp/SWPPPReportPrint';
import PayItemReportPrint from '../disciplines/utility/daily/PayItemReportPrint';

// Wrapper components that properly provide location state to print components
const EnvironmentalDailyReportWrapper = ({ reportData }) => {
  const mockLocation = { state: { reportData } };
  return <EnvironmentalDailyReportPrint location={mockLocation} />;
};

const DailyUtilityReportWrapper = ({ reportData }) => {
  const mockLocation = { state: { reportData } };
  return <DailyUtilityReportPrint location={mockLocation} />;
};

const DailyUtilityReport2Wrapper = ({ reportData }) => {
  const mockLocation = { state: { reportData } };
  return <DailyUtilityReport2Print location={mockLocation} />;
};

const PunchlistReportWrapper = ({ reportData }) => {
  const mockLocation = { state: { reportData } };
  return <PunchlistReportPrint location={mockLocation} />;
};

const SWPPPReportWrapper = ({ reportData }) => {
  const mockLocation = { state: { reportData } };
  return <SWPPPReportPrint location={mockLocation} />;
};

const PayItemReportWrapper = ({ reportData }) => {
  const mockLocation = { state: { reportData } };
  return <PayItemReportPrint location={mockLocation} />;
};

// Simple report renderer that displays data in print format
const PrintFormatRenderer = ({ data, reportType }) => {
  if (!data) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const renderUtilityDaily2Content = () => {
    const header = data.header || {};
    const progressRows = Array.isArray(data.progressRows) ? data.progressRows : [];
    const payItems = Array.isArray(data.payItems) ? data.payItems : [];
    const photos = Array.isArray(data.photos) ? data.photos : [];
    const headcounts = data.headcounts || {};
    const subcontractors = Array.isArray(data.subcontractors) ? data.subcontractors : [];
    const inspectionPersonnel = Array.isArray(data.inspectionPersonnel) ? data.inspectionPersonnel : [];
    const equipment = Array.isArray(data.equipment) ? data.equipment : [];
    const trucking = Array.isArray(data.trucking) ? data.trucking : [];
    const crews = Array.isArray(data.crews) ? data.crews : [];
    const remarks = data.remarks || '';
    const preparedBy = data.preparedBy || '';
    const signature = data.signature;
    const sigDate = data.sigDate;
    
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-[816px] mx-auto bg-white shadow-2xl rounded-xl flex flex-col">
          {/* Header */}
          <div className="w-full border-b-4 border-blue-500 bg-blue-900 text-white py-0.5 pl-1 pr-8 rounded-t-xl">
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
          <div className="flex-1 px-8 py-8 flex flex-col">
            {/* Project Info */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-4 border-b-2 border-blue-200 pb-1">
                <h2 className="text-xl font-bold text-blue-800">Project Information</h2>
                <div className="text-base font-semibold text-blue-800 ml-4">Date: {formatDate(header.date)}</div>
              </div>
              <table className="w-full mb-6 text-sm">
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Section</td>
                    <td className="py-1 text-gray-900">{header.section || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Spread</td>
                    <td className="py-1 text-gray-900">{header.spread || '—'}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Contractor</td>
                    <td className="py-1 text-gray-900">{header.contractor || '—'}</td>
                    <td className="font-semibold py-1 pr-4 w-48 text-gray-700">Inspector</td>
                    <td className="py-1 text-gray-900">{header.inspector || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Headcounts */}
            {Object.keys(headcounts).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Headcounts</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(headcounts).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {value || '—'}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Subcontractors */}
            {subcontractors.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Subcontractors</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Company</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Work</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Personnel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subcontractors.map((sub, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-2 border border-gray-300">{sub.company || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{sub.work || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{sub.personnel || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Inspection Personnel */}
            {inspectionPersonnel.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Inspection Personnel</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Name</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Company</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspectionPersonnel.map((person, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-2 border border-gray-300">{person.name || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{person.company || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{person.role || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Weather and Conditions */}
            {(data.morningTemp || data.midTemp || data.weather || data.precipitation || data.abnormalConditions || data.crewAdverse) && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Weather and Conditions</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {data.morningTemp && <div><strong>Morning Temperature:</strong> {data.morningTemp}</div>}
                  {data.midTemp && <div><strong>Mid Temperature:</strong> {data.midTemp}</div>}
                  {data.weather && <div><strong>Weather:</strong> {data.weather}</div>}
                  {data.precipitation && <div><strong>Precipitation:</strong> {data.precipitation}</div>}
                  {data.abnormalConditions && <div><strong>Abnormal Conditions:</strong> {data.abnormalConditions}</div>}
                  {data.crewAdverse && <div><strong>Crew Adverse:</strong> {data.crewAdverse}</div>}
                </div>
              </div>
            )}
            
            {/* Progress Rows */}
            {progressRows.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Progress</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">From</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">To</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Feet</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressRows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-2 border border-gray-300">{row.from || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{row.to || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{row.feet || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{row.comments || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Pay Items */}
            {payItems.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Pay Items</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">From</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">To</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Qty</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payItems.map((item, itemIdx) => (
                        <tr key={itemIdx} className={itemIdx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-2 border border-gray-300">{item.from || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{item.to || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{item.qty || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{item.comments || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Equipment */}
            {equipment.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Equipment</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Equipment</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Hours</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Status</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-2 border border-gray-300">{item.equipment || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{item.hours || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{item.status || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{item.comments || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Trucking */}
            {trucking.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Trucking</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Truck</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Loads</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Material</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trucking.map((truck, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-2 border border-gray-300">{truck.truck || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{truck.loads || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{truck.material || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{truck.comments || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Crews */}
            {crews.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Crews</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Crew</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Foreman</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Start Station</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">End Station</th>
                        <th className="font-bold py-2 px-2 text-left border border-gray-300">Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crews.map((crew, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-2 border border-gray-300">{crew.crew || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{crew.foreman || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{crew.startStation || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{crew.endStation || '—'}</td>
                          <td className="py-2 px-2 border border-gray-300">{crew.summary || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Additional Sections */}
            {(data.craft || data.environmental || data.survey || data.land) && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Additional Information</h2>
                <div className="space-y-4 text-sm">
                  {data.craft && (
                    <div>
                      <strong>Craft:</strong> {data.craft}
                    </div>
                  )}
                  {data.environmental && (
                    <div>
                      <strong>Environmental:</strong> {data.environmental}
                    </div>
                  )}
                  {data.survey && (
                    <div>
                      <strong>Survey:</strong> {data.survey}
                    </div>
                  )}
                  {data.land && (
                    <div>
                      <strong>Land:</strong> {data.land}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Remarks */}
            {remarks && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-800 border-b-2 border-blue-200 pb-1 mb-4">Remarks</h2>
                <p className="text-gray-900">{remarks}</p>
              </div>
            )}
            
            {/* Signature */}
            <div className="flex flex-row items-center gap-6 mt-12 mb-8">
              <div className="text-base font-semibold whitespace-nowrap"><b>Prepared by:</b> {preparedBy || header.inspector || '—'}</div>
              {signature && (
                <img src={signature} alt="Signature" className="max-h-16 max-w-xs border border-gray-300 rounded bg-white shadow mb-0" />
              )}
              <div className="text-base font-semibold whitespace-nowrap"><b>Date:</b> {formatDate(sigDate)}</div>
            </div>
            
            {/* Photos */}
            {photos.length > 0 && (
              <div className="mt-10 mb-10">
                <h2 className="text-xl font-bold text-blue-800 border-b border-blue-200 pb-1 mb-4">Photos</h2>
                <div className="grid grid-cols-2 gap-6">
                  {photos.map((photo, idx) => {
                    // Handle different photo URL formats
                    let imageSrc = null;
                    if (photo.image_url || photo.url) {
                      imageSrc = photo.image_url || photo.url;
                    } else if (photo.preview) {
                      imageSrc = photo.preview;
                    } else if (photo.file && photo.file instanceof File) {
                      imageSrc = URL.createObjectURL(photo.file);
                    } else if (photo.file) {
                      imageSrc = photo.file;
                    }
                    
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
          
          {/* Footer */}
          <div className="w-full border-t-4 border-blue-500 bg-blue-900 text-white py-2 px-8 rounded-b-xl text-sm flex justify-between items-center">
            <span className="flex-1 text-center">&copy; {new Date().getFullYear()} WildStone Solutions, LLC</span>
          </div>
        </div>
      </div>
    );
  };

  // For now, just render the Daily Report 2 format for all types
  // This can be expanded later to handle other report types
  return renderUtilityDaily2Content();
};

const ReportReview = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      // Use the detail endpoint to get the specific report
      const response = await api.get(`/reports/${reportId}/`);
      const foundReport = response.data;
      
      console.log('Found report:', {
        id: foundReport.id,
        report_type: foundReport.report_type,
        report_data_type: typeof foundReport.report_data,
        report_data_length: foundReport.report_data ? 
          (typeof foundReport.report_data === 'string' ? foundReport.report_data.length : 'object') : 0,
        report_data_preview: foundReport.report_data ? 
          (typeof foundReport.report_data === 'string' ? 
            foundReport.report_data.substring(0, 100) + '...' : 
            'Object: ' + Object.keys(foundReport.report_data).join(', ')) : null
      });
      
      // Parse the report data
      let parsedReportData = null;
      if (foundReport.report_data) {
        try {
          if (typeof foundReport.report_data === 'object' && foundReport.report_data !== null) {
            parsedReportData = foundReport.report_data;
            console.log('Using object data directly:', parsedReportData);
          } else if (typeof foundReport.report_data === 'string') {
            parsedReportData = JSON.parse(foundReport.report_data);
            console.log('Successfully parsed JSON data:', parsedReportData);
          }
        } catch (error) {
          console.error('Error parsing report data:', error);
        }
      }
      
      setReport(foundReport);
      setParsedData(parsedReportData);
    } catch (error) {
      console.error('Error loading report:', error);
      navigate('/leads/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!report) return;
    
    setSubmitting(true);
    try {
      await approveReport(report.id, reviewNotes);
      setShowApproveModal(false);
      navigate('/leads/dashboard');
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Failed to approve report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!report || !rejectionReason.trim()) return;
    
    setSubmitting(true);
    try {
      await rejectReport(report.id, rejectionReason, reviewNotes);
      setShowRejectModal(false);
      setRejectionReason('');
      navigate('/leads/dashboard');
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('Failed to reject report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900/50 text-green-300 border-green-600';
      case 'rejected':
        return 'bg-red-900/50 text-red-300 border-red-600';
      case 'submitted':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-600';
      case 'in_review':
        return 'bg-blue-900/50 text-blue-300 border-blue-600';
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderReportContent = (data, reportType) => {
    console.log('renderReportContent called with:', { reportType, dataKeys: Object.keys(data || {}), data });
    
    if (!data) {
      console.log('No data available, showing error message');
      return (
        <div className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-md border border-gray-700">
          <p className="text-sm text-gray-300">Report data could not be parsed. Please contact support.</p>
          <details className="mt-2">
            <summary className="text-sm text-gray-400 cursor-pointer">Raw Data</summary>
            <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-40">
              {JSON.stringify(report?.report_data, null, 2)}
            </pre>
          </details>
        </div>
      );
    }
    
    console.log('Creating wrapper for report type:', reportType, 'with data:', data);
    
    // Use the PrintFormatRenderer for all report types
    console.log('Using PrintFormatRenderer for:', reportType);
    return <PrintFormatRenderer data={data} reportType={reportType} />;
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-[816px] mx-auto bg-white shadow-2xl rounded-xl flex flex-col">
          <div className="w-full border-b-4 border-blue-500 bg-blue-900 text-white py-0.5 pl-1 pr-8 rounded-t-xl">
            <div className="flex items-center mt-1 mb-1">
              <div className="flex-shrink-0 flex items-center justify-start" style={{ minWidth: '9rem' }}>
                <img src="/static/PIPE-Logo.png" alt="PIPE Logo" className="h-16 w-auto" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-3xl font-bold tracking-wide text-center">Review Report</h1>
              </div>
              <div className="flex-shrink-0" style={{ minWidth: '9rem' }}></div>
            </div>
          </div>
          <div className="flex-1 px-8 py-8 flex flex-col">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-[816px] mx-auto bg-white shadow-2xl rounded-xl flex flex-col">
          <div className="w-full border-b-4 border-blue-500 bg-blue-900 text-white py-0.5 pl-1 pr-8 rounded-t-xl">
            <div className="flex items-center mt-1 mb-1">
              <div className="flex-shrink-0 flex items-center justify-start" style={{ minWidth: '9rem' }}>
                <img src="/static/PIPE-Logo.png" alt="PIPE Logo" className="h-16 w-auto" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-3xl font-bold tracking-wide text-center">Report Not Found</h1>
              </div>
              <div className="flex-shrink-0" style={{ minWidth: '9rem' }}></div>
            </div>
          </div>
          <div className="flex-1 px-8 py-8 flex flex-col">
            <div className="text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Report not found</h3>
              <p className="mt-1 text-sm text-gray-500">
                The report you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/leads/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Report Info Header */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {report.report_type.replace(/_/g, ' ').toUpperCase()}
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Submitted by {report.submitted_by?.first_name} {report.submitted_by?.last_name} on {formatDate(report.submitted_at)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(report.status)}`}>
                {report.status.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={() => navigate('/leads/dashboard')}
                className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Report Content - Print Preview */}
        <div className="bg-black rounded-lg shadow-2xl overflow-hidden">
          {renderReportContent(parsedData, report.report_type)}
        </div>

        {/* Review Actions */}
        {report.status === 'submitted' && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Review Actions</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Add any notes about your review..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Reject Report
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Approve Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Review Info */}
        {report.status !== 'submitted' && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Review Information</h3>
            <div className="space-y-4">
              {report.reviewed_by && (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Reviewed By</label>
                  <p className="mt-1 text-sm text-white">
                    {report.reviewed_by.first_name} {report.reviewed_by.last_name}
                  </p>
                </div>
              )}
              {report.reviewed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Reviewed At</label>
                  <p className="mt-1 text-sm text-white">{formatDate(report.reviewed_at)}</p>
                </div>
              )}
              {report.review_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Review Notes</label>
                  <p className="mt-1 text-sm text-white">{report.review_notes}</p>
                </div>
              )}
              {report.rejection_reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Rejection Reason</label>
                  <p className="mt-1 text-sm text-white">{report.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800 border-gray-700">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Confirm Approval</h3>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">
                Are you sure you want to approve this report? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800 border-gray-700">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Reject Report</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Rejection Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={submitting || !rejectionReason.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportReview; 