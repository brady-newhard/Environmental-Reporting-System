import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';
import { loadDraft } from '../../../../utils/draftUtils';

const DailyUtilityReportReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Smart back button path
  const backPath = state?.from || '/utility/reports/daily/drafts';

  // Try to get draft from state, else from localStorage
  const draft = useMemo(() => {
    // Check if data was passed directly in state (from form)
    if (state && (state.header || state.weather || state.rows)) {
      console.log('Using data from form state:', state);
      return state;
    }
    
    // Check if draft object was passed in state
    if (state && state.draft) {
      console.log('Using draft from state:', state.draft);
      return state.draft;
    }
    
    // Try to load from draft storage
    if (id) {
      try {
        const loadedDraft = loadDraft('daily_utility', id);
        console.log('Using draft from storage:', loadedDraft);
        return loadedDraft;
      } catch (error) {
        console.error('Error loading draft:', error);
        return null;
      }
    }
    
    console.log('No draft data found');
    return null;
  }, [state, id]);

  if (!draft) {
    return (
      <div className="bg-black min-h-screen pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
            <p className="text-center text-gray-600 py-8">
              Draft not found.{' '}
              <button
                onClick={() => navigate('/utility/reports/daily/drafts')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Back to Drafts
              </button>
            </p>
          </div>
        </div>
      </div>
    );
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

  console.log('Review component data:', {
    header,
    weather,
    rows: rows.length,
    equipmentRows: equipmentRows.length,
    photos: photos.length,
    generalSummary,
    landSummary,
    envSummary,
    safety,
    preparedBy,
    signature: signature ? 'Present' : 'Missing',
    sigDate
  });

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Daily Utility Report Review"
          backPath={backPath}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />

        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mt-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Daily Utility Report</h1>

          {/* Project Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><span className="font-medium">Project:</span> {header?.project || '-'}</div>
              <div><span className="font-medium">Spread:</span> {header?.spread || '-'}</div>
              <div><span className="font-medium">Inspector:</span> {header?.inspector || '-'}</div>
              <div><span className="font-medium">AFE Number:</span> {header?.afe || '-'}</div>
              <div><span className="font-medium">Contractor:</span> {header?.contractor || '-'}</div>
              <div><span className="font-medium">Date:</span> {header?.date ? new Date(header.date).toLocaleDateString() : '-'}</div>
              <div><span className="font-medium">Weekday:</span> {header?.weekday || '-'}</div>
              <div><span className="font-medium">Report No.:</span> {header?.reportNo || '-'}</div>
              <div><span className="font-medium">Total Footage:</span> {header?.totalFootage || '-'}</div>
              {[1, 2, 3].map(i => header && header[`sub${i}`] && (
                <div key={i}><span className="font-medium">Subcontractor {i}:</span> {header[`sub${i}`]}</div>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Weather Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['am', 'pm'].map(period => (
                <div key={period} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">{period.toUpperCase()} Weather</h3>
                  <div className="space-y-1">
                    <div><span className="font-medium">Sky Cover:</span> {weather?.[period]?.sky || '-'}</div>
                    <div><span className="font-medium">Precipitation:</span> {weather?.[period]?.precip || '-'}</div>
                    <div><span className="font-medium">Temperature:</span> {weather?.[period]?.temp ? `${weather[period].temp}°F` : '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Construction Activities */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Construction Activities</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Station</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Station</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Footage</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Complete</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crew</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows && rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {row.phase === 'Other' ? row.customPhase : row.phase}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.startSta || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.endSta || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.dailyFootage || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.cumulativeFootage || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.percentComplete || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.contractor || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.crew || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.hours || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Equipment */}
          {equipmentRows && equipmentRows.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Equipment</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Used</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {equipmentRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.equipment || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.qty || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.hoursUsed || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summaries */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Summaries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">General Summary</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                  {generalSummary || 'No general summary provided.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Land Summary</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                  {landSummary || 'No land summary provided.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Environmental Summary</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                  {envSummary || 'No environmental summary provided.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Safety Concerns</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                  {safety || 'No safety concerns reported.'}
                </p>
              </div>
            </div>
          </div>

          {/* Photos */}
          {photos && photos.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Photos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  return (
                    <div key={idx} className="flex flex-col items-center border rounded-lg p-3 bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
                      {possibleImageUrl && (
                        <img
                          src={possibleImageUrl}
                          alt={photo.comment || photo.description || `Photo ${idx + 1}`}
                          className="w-full max-w-xs max-h-60 object-contain mb-3 rounded shadow"
                        />
                      )}
                      {photo.location && (
                        <div className="text-sm text-gray-600 mb-1 w-full">
                          <span className="font-medium">Location:</span> {photo.location}
                        </div>
                      )}
                      {(photo.comment || photo.description) && (
                        <div className="text-sm text-gray-700 w-full">
                          <span className="font-medium">Comments:</span> {photo.comment || photo.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Inspector Signature</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <span className="font-medium">Prepared by:</span> {preparedBy || '-'}
              </div>
              {signature && (
                <div className="mb-3">
                  <img 
                    src={signature} 
                    alt="Signature" 
                    className="max-w-xs border border-gray-300 rounded"
                  />
                </div>
              )}
              <div>
                <span className="font-medium">Date:</span> {sigDate || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyUtilityReportReview; 