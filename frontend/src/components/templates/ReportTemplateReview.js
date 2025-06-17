import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import { PencilIcon, ArrowLeftOnRectangleIcon, TrashIcon } from '@heroicons/react/24/outline';

const ReportTemplateReview = ({ config }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { draftId } = useParams();
  let data = location.state?.formData;

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
  const header = data.header || {};
  const sections = Array.isArray(data.sections) ? data.sections : [];
  const summaries = typeof data.summaries === 'object' && data.summaries !== null ? data.summaries : {};
  const preparedBy = data.preparedBy || '';
  const signature = data.signature || '';
  const sigDate = data.sigDate || '';
  const photos = Array.isArray(data.photos) ? data.photos : [];

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
            {config.headerFields.filter(f => [
              'project', 'contractor', 'inspector', 'date', 'spread', 'facility', 'milepost_start', 'milepost_end', 'station_start', 'station_end'
            ].includes(f.name)).map(field => (
              <div key={field.name} className="min-w-[180px]">
                <span className="font-semibold">{field.label}:</span>{' '}
                {field.type === 'date' ? formatDate(header[field.name]) : (header[field.name] || '')}
              </div>
            ))}
          </div>
        </div>

        {/* Weather Information Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Weather Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {config.headerFields.filter(f => [
              'weather_conditions', 'temperature', 'precipitation_type', 'soil_conditions'
            ].includes(f.name)).map(field => (
              <div key={field.name} className="min-w-[180px]">
                <span className="font-semibold">{field.label}:</span>{' '}
                {header[field.name] || ''}
              </div>
            ))}
          </div>
          
          {/* Rain Gauges */}
          {header?.rain_gauges && header.rain_gauges.length > 0 && (
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
                    {header.rain_gauges.map((gauge, idx) => (
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {section.rows.length > 0 && Object.keys(section.rows[0]).map(field => (
                      <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {section.rows.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((value, fieldIdx) => (
                        <td key={fieldIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Summaries */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Environmental Inspection Summary</h2>
          {config.summaryFields.map(field => (
            <p key={field.name} className="mb-2">
              <span className="font-semibold">{field.label}:</span>{' '}
              {summaries?.[field.name]}
            </p>
          ))}
        </div>

        {/* Signature */}
        {config.requiresSignature && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Inspector Signature</h2>
            <p className="mb-2">
              <span className="font-semibold">Prepared by:</span> {preparedBy}
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
              <span className="font-semibold">Date:</span> {formatDate(sigDate)}
            </p>
          </div>
        )}

        {/* Photos Section */}
        {config.requiresPhotos && photos && photos.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, idx) => {
                let photoUrl;
                if (typeof photo === 'string') {
                  photoUrl = photo;
                } else if (photo.url) {
                  photoUrl = photo.url;
                } else if (photo.file) {
                  photoUrl = photo.file;
                } else if (photo instanceof Blob) {
                  photoUrl = URL.createObjectURL(photo);
                } else if (photo.preview) {
                  photoUrl = photo.preview;
                } else if (photo.image_url) {
                  photoUrl = photo.image_url;
                }

                const location = photo.location || '';
                const comments = photo.comments || photo.comment || '';

                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col"
                  >
                    <div className="relative pt-[75%] bg-gray-50">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={`Photo ${idx + 1}`}
                          className="absolute top-0 left-0 w-full h-full object-contain"
                          onError={e => {
                            console.error('Error loading photo:', e);
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500">
                          Image not available
                        </div>
                      )}
                    </div>
                    {(location || comments) && (
                      <div className="p-3 bg-gray-50">
                        {location && (
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Location: {location}
                          </p>
                        )}
                        {comments && (
                          <p className="text-sm text-gray-600">
                            {comments}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportTemplateReview; 