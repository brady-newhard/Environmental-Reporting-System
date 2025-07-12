import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveDraft, normalizeDraft, loadDraft } from '../../../../utils/draftUtils';
import PageHeader from '../../../common/PageHeader';
import BaseActionButtons from '../../base/BaseActionButtons';
import BaseFieldRenderer from '../../base/BaseFieldRenderer';
import BaseSignatureSection from '../../base/BaseSignatureSection';
import BaseDialogs from '../../base/BaseDialogs';
import BaseSnackbar from '../../base/BaseSnackbar';
import ReportPhotoSection from '../../../common/ReportPhotoSection';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const constructionPhaseOptions = [
  "MOBILIZATION",
  "DEVELOPING ACCESS ROADS",
  "TREE FELLING",
  "CLEARING RIGHT OF WAY",
  "GRADING RIGHT OF WAY",
  "EXCAVATING DITCH",
  "STRINGING",
  "BEND PIPE",
  "WELD PIPE",
  "COATING",
  "LOWER IN PIPE",
  "BACKFILL PIPE",
  "PERFORMANCE TEST, ANOMALY REPAIRS, AND DRYING",
  "CLEAN-UP, SEEDING, AND MULCHING",
  "TEMPORARY HDPE WATER LINE",
  "Other"
];

const defaultRow = () => ({
  phase: '', 
  customPhase: '', 
  startSta: '', 
  endSta: '', 
  dailyFootage: '', 
  cumulativeFootage: '', 
  percentComplete: '', 
  contractor: '', 
  crew: '', 
  hours: '', 
  equipment: '', 
  qty: '', 
  hoursUsed: ''
});

const skyCoverOptions = [
  'Clear',
  'Partly Cloudy',
  'Mostly Cloudy',
  'Overcast',
];

const precipOptions = [
  'None',
  'Drizzle',
  'Rain',
  'Snow',
  'Thunderstorm',
  'Other',
];

const DailyUtilityReportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState(id || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', severity: 'success' });

  // Form state
  const [header, setHeader] = useState({
    project: '', 
    inspector: '', 
    afe: '', 
    contractor: '', 
    date: new Date().toISOString().split('T')[0], 
    reportNo: 'Pending', 
    weekday: '', 
    totalFootage: '', 
    spread: '',
    sub1: '',
    sub2: '',
    sub3: ''
  });

  const [weather, setWeather] = useState({
    am: { sky: '', precip: '', temp: '' },
    pm: { sky: '', precip: '', temp: '' }
  });

  const [am, setAm] = useState(false);
  const [pm, setPm] = useState(false);
  const [rows, setRows] = useState([defaultRow()]);
  const [equipmentRows, setEquipmentRows] = useState([{ equipment: '', qty: '', hoursUsed: '' }]);
  const [generalSummary, setGeneralSummary] = useState('');
  const [landSummary, setLandSummary] = useState('');
  const [envSummary, setEnvSummary] = useState('');
  const [safety, setSafety] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [signature, setSignature] = useState('');
  const [sigDate, setSigDate] = useState('');
  const [photos, setPhotos] = useState([]);

  // Load existing draft if editing
  useEffect(() => {
    const loadExistingDraft = async () => {
      if (id) {
        try {
          const loadedDraft = await loadDraft('daily_utility', id);
          if (loadedDraft) {
            setHeader(loadedDraft.header || header);
            setWeather(loadedDraft.weather || weather);
            setAm(loadedDraft.am || am);
            setPm(loadedDraft.pm || pm);
            setRows(loadedDraft.rows || rows);
            setEquipmentRows(loadedDraft.equipmentRows || equipmentRows);
            setGeneralSummary(loadedDraft.generalSummary || generalSummary);
            setLandSummary(loadedDraft.landSummary || landSummary);
            setEnvSummary(loadedDraft.envSummary || envSummary);
            setSafety(loadedDraft.safety || safety);
            setPreparedBy(loadedDraft.preparedBy || preparedBy);
            setSignature(loadedDraft.signature || signature);
            setSigDate(loadedDraft.sigDate || sigDate);
            setPhotos(loadedDraft.photos || []);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          setSnackbar({
            show: true,
            message: 'Error loading draft: ' + error.message,
            severity: 'error'
          });
        }
      }
    };

    loadExistingDraft();
  }, [id]);

  // Handlers
  const handleHeaderChange = e => setHeader({ ...header, [e.target.name]: e.target.value });
  
  const handleWeatherChange = (period, field, value) => 
    setWeather(w => ({ ...w, [period]: { ...w[period], [field]: value } }));
  
  const handleRowChange = (idx, field, value) => setRows(rows.map((row, i) => {
    if (i !== idx) return row;
    if (field === 'phase' && value !== 'Other') {
      return { ...row, phase: value, customPhase: '' };
    }
    return { ...row, [field]: value };
  }));

  const handleAddRow = () => setRows([...rows, defaultRow()]);
  const handleRemoveRow = idx => setRows(rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);

  const handleEquipmentRowChange = (idx, field, value) => 
    setEquipmentRows(equipmentRows.map((row, i) => i !== idx ? row : { ...row, [field]: value }));

  const handleAddEquipmentRow = () => setEquipmentRows([...equipmentRows, { equipment: '', qty: '', hoursUsed: '' }]);
  const handleRemoveEquipmentRow = idx => setEquipmentRows(equipmentRows.filter((_, i) => i !== idx));

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      
      const dataToSave = {
        header,
        weather,
        am,
        pm,
        rows,
        equipmentRows,
        generalSummary,
        landSummary,
        envSummary,
        safety,
        preparedBy,
        signature,
        sigDate,
        photos,
        reportType: 'daily_utility'
      };

      const savedDraft = await saveDraft('daily_utility', dataToSave);
      
      setSnackbar({ show: true, message: 'Draft saved successfully', severity: 'success' });
      
      if (!draftId) {
        setDraftId(savedDraft.id);
        navigate(`/utility/reports/daily/edit/${savedDraft.id}`, { replace: true });
      }
      
      return savedDraft;
    } catch (error) {
      console.error('Error saving report:', error);
      setSnackbar({ 
        show: true, 
        message: 'Error saving draft: ' + (error.message || 'Unknown error'), 
        severity: 'error' 
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Delete logic here
      setDeleteDialogOpen(false);
      navigate('/utility/reports');
    } catch (error) {
      console.error('Error deleting draft:', error);
      setSnackbar({
        show: true,
        message: 'Error deleting draft: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleReview = () => {
    const reviewData = { 
      header, 
      weather, 
      am, 
      pm, 
      rows, 
      equipmentRows, 
      generalSummary, 
      landSummary, 
      envSummary, 
      safety, 
      preparedBy, 
      signature, 
      sigDate,
      photos
    };
    
    console.log('Passing data to review:', {
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
    
    navigate(`/utility/reports/daily/review/${draftId}`, {
      state: reviewData
    });
  };

  const handleExit = () => {
    setExitDialogOpen(true);
  };

  const handleExitConfirm = async (shouldSave) => {
    if (shouldSave) {
      await handleSave();
    }
    navigate('/utility/reports');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSave();
  };

  const handlePhotoNotification = (message, severity) => {
    setSnackbar({ show: true, message, severity });
  };

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Daily Utility Report"
          backPath="/utility/reports"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Project Information Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Project</label>
                <input
                  type="text"
                  name="project"
                  value={header.project}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Spread</label>
                <input
                  type="text"
                  name="spread"
                  value={header.spread}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Inspector</label>
                <input
                  type="text"
                  name="inspector"
                  value={header.inspector}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">AFE Number</label>
                <input
                  type="text"
                  name="afe"
                  value={header.afe}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Contractor and Subcontractors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Contractor</label>
                <input
                  type="text"
                  name="contractor"
                  value={header.contractor}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Sub {i}</label>
                    <input
                      type="text"
                      name={`sub${i}`}
                      value={header[`sub${i}`] || ''}
                      onChange={handleHeaderChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Date and Report Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={header.date}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Report No.</label>
                <input
                  type="text"
                  name="reportNo"
                  value={header.reportNo}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Total Footage</label>
                <input
                  type="text"
                  name="totalFootage"
                  value={header.totalFootage}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Weather Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Weather Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AM Weather */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">AM Weather</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Sky Cover</label>
                    <select
                      value={weather.am.sky}
                      onChange={(e) => handleWeatherChange('am', 'sky', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select...</option>
                      {skyCoverOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Precipitation</label>
                    <select
                      value={weather.am.precip}
                      onChange={(e) => handleWeatherChange('am', 'precip', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select...</option>
                      {precipOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Temperature (°F)</label>
                    <input
                      type="text"
                      value={weather.am.temp}
                      onChange={(e) => handleWeatherChange('am', 'temp', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* PM Weather */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">PM Weather</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Sky Cover</label>
                    <select
                      value={weather.pm.sky}
                      onChange={(e) => handleWeatherChange('pm', 'sky', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select...</option>
                      {skyCoverOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Precipitation</label>
                    <select
                      value={weather.pm.precip}
                      onChange={(e) => handleWeatherChange('pm', 'precip', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select...</option>
                      {precipOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Temperature (°F)</label>
                    <input
                      type="text"
                      value={weather.pm.temp}
                      onChange={(e) => handleWeatherChange('pm', 'temp', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Construction Activities Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Construction Activities</h2>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Activity
              </button>
            </div>

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
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <select
                          value={row.phase}
                          onChange={(e) => handleRowChange(idx, 'phase', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="">Select Phase</option>
                          {constructionPhaseOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        {row.phase === 'Other' && (
                          <input
                            type="text"
                            value={row.customPhase}
                            onChange={(e) => handleRowChange(idx, 'customPhase', e.target.value)}
                            placeholder="Specify other phase"
                            className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.startSta}
                          onChange={(e) => handleRowChange(idx, 'startSta', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.endSta}
                          onChange={(e) => handleRowChange(idx, 'endSta', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.dailyFootage}
                          onChange={(e) => handleRowChange(idx, 'dailyFootage', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.cumulativeFootage}
                          onChange={(e) => handleRowChange(idx, 'cumulativeFootage', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.percentComplete}
                          onChange={(e) => handleRowChange(idx, 'percentComplete', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.contractor}
                          onChange={(e) => handleRowChange(idx, 'contractor', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.crew}
                          onChange={(e) => handleRowChange(idx, 'crew', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.hours}
                          onChange={(e) => handleRowChange(idx, 'hours', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Equipment Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Equipment</h2>
              <button
                type="button"
                onClick={handleAddEquipmentRow}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Equipment
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Used</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {equipmentRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.equipment}
                          onChange={(e) => handleEquipmentRowChange(idx, 'equipment', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.qty}
                          onChange={(e) => handleEquipmentRowChange(idx, 'qty', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.hoursUsed}
                          onChange={(e) => handleEquipmentRowChange(idx, 'hoursUsed', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipmentRow(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Sections */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Summaries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">General Summary</label>
                <textarea
                  value={generalSummary}
                  onChange={(e) => setGeneralSummary(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Land Summary</label>
                <textarea
                  value={landSummary}
                  onChange={(e) => setLandSummary(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Environmental Summary</label>
                <textarea
                  value={envSummary}
                  onChange={(e) => setEnvSummary(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Safety Concerns</label>
                <textarea
                  value={safety}
                  onChange={(e) => setSafety(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              </div>
            </div>
          </div>

          {/* Photo Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Photos</h2>
            <ReportPhotoSection
              photos={photos}
              onPhotosChange={setPhotos}
              editable={true}
              content_type="daily_utility"
              object_id={draftId && !String(draftId).startsWith('temp_') ? draftId : null}
              onNotification={handlePhotoNotification}
            />
          </div>

          {/* Signature Section */}
          <BaseSignatureSection
            signature={signature}
            sigDate={sigDate}
            preparedBy={preparedBy}
            onSignatureChange={setSignature}
            onSigDateChange={setSigDate}
            onPreparedByChange={setPreparedBy}
            onClearSignature={() => setSignature('')}
            title="Signature Section"
          />

          {/* Action Buttons */}
          <BaseActionButtons
            loading={loading}
            draftId={draftId}
            onExit={handleExit}
            onDelete={handleDelete}
            onReview={handleReview}
            onSave={handleSave}
          />
        </form>

        {/* Dialogs */}
        <BaseDialogs
          deleteDialogOpen={deleteDialogOpen}
          exitDialogOpen={exitDialogOpen}
          onDeleteConfirm={handleDeleteConfirm}
          onExitConfirm={handleExitConfirm}
          onCloseDeleteDialog={() => setDeleteDialogOpen(false)}
          onCloseExitDialog={() => setExitDialogOpen(false)}
        />

        {/* Snackbar */}
        <BaseSnackbar
          snackbar={snackbar}
          onClose={() => setSnackbar({ show: false, message: '', severity: 'success' })}
        />
      </div>
    </div>
  );
};

export default DailyUtilityReportForm; 