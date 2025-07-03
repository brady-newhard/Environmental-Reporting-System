import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import { PencilIcon, ArrowLeftOnRectangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatPhotoUrl } from '../../utils/photoUtils';

const ReportTemplateReview = ({ config }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { draftId } = useParams();
  let data = location.state?.reportData;

  // If no data in state, try to load from localStorage
  if (!data && draftId && config && config.reportType) {
    const localKey = `${config.reportType}_draft_${draftId}`;
    const localData = localStorage.getItem(localKey);
    if (localData) {
      data = JSON.parse(localData);
    }
  }

  if (!data) {
    return (
      <div className="p-6">
        <p>No report data provided.</p>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/environmental/reports');
  };

  const handleEdit = () => {
    navigate(`/environmental/reports/daily/edit/${draftId}`);
  };

  const handleDelete = async () => {
    try {
      await import('../../utils/draftUtils').then(utils => utils.deleteDraft('environmental', draftId));
      navigate('/environmental/reports');
    } catch (err) {
      console.error('Error deleting draft:', err);
    }
  };

  // Helper to format date fields
  const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (!isNaN(d)) return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    return value;
  };

  // Defensive: ensure all fields are present
  const projectInfo = {
    project: data.project || '',
    spread: data.spread || '',
    inspector: data.inspector || '',
    afe: data.afe || '',
    contractor: data.contractor || '',
    date: formatDate(data.date),
    prepared_by: data.prepared_by || '',
  };

  const weatherInfo = data.weather || {};
  const sections = Array.isArray(data.sections) ? data.sections : [];
  const summaries = typeof data.summaries === 'object' && data.summaries !== null ? data.summaries : {};
  const signature = data.signature || '';
  const sigDate = formatDate(data.sigDate);
  const photos = Array.isArray(data.photos) ? data.photos : [];

  console.log('Review/Print photos:', photos);

  const renderPhotos = (photos) => {
    if (!photos || photos.length === 0) return null;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Photos</h3>
        <div className="grid grid-cols-2 gap-4 w-full">
          {photos.map((photo, index) => {
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
              <div key={index} className="relative w-full">
                <img
                  src={imageSrc}
                  alt={photo.comment || `Photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
                {photo.comment && (
                  <div className="mt-2 text-sm text-gray-600">
                    {photo.comment}
                  </div>
                )}
                {photo.location && (
                  <div className="mt-1 text-sm text-gray-500">
                    Location: {photo.location}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title={`${config.title} Review`}
        backPath={handleBack}
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }}
      />
      
      {/* Action Buttons */}
      <div className="flex gap-4 justify-end mb-6 flex-wrap">
        <button
          onClick={handleEdit}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Exit</span>
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <TrashIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">{config.title}</h1>
        
        {/* Project Information Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(projectInfo).map(([key, value]) => (
              <div key={key} className="min-w-[180px]">
                <span className="font-semibold">{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:</span>{' '}
                {value || '—'}
              </div>
            ))}
          </div>
        </div>

        {/* Weather Information Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Weather Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(weatherInfo).map(([key, value]) => (
              <div key={key} className="min-w-[180px]">
                <span className="font-semibold">{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:</span>{' '}
                {value || '—'}
              </div>
            ))}
          </div>
          
          {/* Rain Gauges */}
          {data?.rain_gauges && data.rain_gauges.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Rain Gauge Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rain (in)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Snow (in)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.rain_gauges.map((gauge, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gauge.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gauge.rain}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gauge.snow}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
            {section.rows && section.rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(section.rows[0]).map(field => (
                        <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {section.rows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {Object.values(row).map((value, fieldIdx) => (
                          <td key={fieldIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {value || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {section.photos && section.photos.length > 0 && renderPhotos(section.photos)}
          </div>
        ))}

        {/* Summaries */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Environmental Inspection Summary</h2>
          {Object.entries(summaries).map(([key, value]) => (
            <p key={key} className="mb-2">
              <span className="font-semibold">{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:</span>{' '}
              {value || '—'}
            </p>
          ))}
        </div>

        {/* Photos */}
        {photos.length > 0 && renderPhotos(photos)}

        {/* Signature */}
        {config.requiresSignature && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Inspector Signature</h2>
            <p className="mb-2">
              <span className="font-semibold">Prepared by:</span> {projectInfo.prepared_by}
            </p>
            {signature && (
              <div className="my-4">
                <img 
                  src={signature} 
                  alt="Signature" 
                  className="max-w-[300px] border border-gray-300 rounded p-1 bg-white" 
                />
              </div>
            )}
            <p>
              <span className="font-semibold">Date:</span> {sigDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportTemplateReview; 