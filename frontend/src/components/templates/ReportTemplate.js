import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import { useSnackbar } from 'notistack';
import axios from '../../utils/axios';
import { uploadPhoto } from '../../utils/photoUtils';
import { loadDraft, saveDraft } from '../../utils/draftUtils';
import PageHeader from '../common/PageHeader';
import { 
  PlusIcon, 
  TrashIcon, 
  CameraIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import ReportPhotoSection from '../common/ReportPhotoSection';

// Template configuration
const defaultConfig = {
  title: 'Report Template',
  reportType: 'template',
  headerFields: [
    { name: 'project', label: 'Project', required: true },
    { name: 'spread', label: 'Spread', required: false },
    { name: 'inspector', label: 'Inspector', required: true },
    { name: 'afe', label: 'AFE Number', required: false },
    { name: 'contractor', label: 'Contractor', required: true },
    { name: 'weather_description', label: 'Weather Description', required: false },
    { name: 'temperature', label: 'Temperature', required: false },
    { name: 'precipitation_type', label: 'Precipitation Type', required: false },
    { name: 'precipitation_inches', label: 'Precipitation Inches', required: false },
    { name: 'weather_conditions', label: 'Weather Conditions', required: false },
    { name: 'soil_conditions', label: 'Soil Conditions', required: false },
    { name: 'rain_gauges', label: 'Rain Gauges', required: false },
    { name: 'additional_comments', label: 'Additional Comments', required: false }
  ],
  dynamicSections: [], // Array of section configurations
  summaryFields: [
    { name: 'generalSummary', label: 'General Summary', multiline: true },
    { name: 'landSummary', label: 'Land Summary', multiline: true },
    { name: 'envSummary', label: 'Environmental Summary', multiline: true },
    { name: 'safety', label: 'Safety Concerns / Visitors / Events', multiline: true }
  ],
  requiresSignature: true,
  requiresPhotos: true
};

const ReportTemplate = ({ config = defaultConfig, initialData = null, onSave }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const sigPadRef = useRef();
  const { id } = useParams();
  
  // Initialize state with default values from config
  const [header, setHeader] = useState(() => {
    const defaultHeader = config.headerFields.reduce((acc, field) => {
      if (field.type === 'dynamicArray') {
        return { ...acc, [field.name]: [{ location: '', rain: '', snow: '' }] };
      }
      return { ...acc, [field.name]: '' };
    }, { date: null, reportNo: 'Pending' });
    
    if (initialData?.header) {
      const mergedHeader = { ...defaultHeader, ...initialData.header };
      if (config.headerFields.some(field => field.type === 'dynamicArray')) {
        config.headerFields.forEach(field => {
          if (field.type === 'dynamicArray') {
            mergedHeader[field.name] = Array.isArray(mergedHeader[field.name]) && mergedHeader[field.name].length > 0
              ? mergedHeader[field.name] 
              : [{ location: '', rain: '', snow: '' }];
          }
        });
      }
      return mergedHeader;
    }
    return defaultHeader;
  });

  const [sections, setSections] = useState(() => {
    try {
      // If we have initial data with sections, validate and use it
      if (initialData?.sections) {
        return initialData.sections.map(section => {
          if (!section || !section.name) {
            console.warn('Invalid section in initialData:', section);
            return null;
          }
          return {
            ...section,
            rows: Array.isArray(section.rows) && section.rows.length > 0 
              ? section.rows 
              : [section.defaultRow ? section.defaultRow() : {}]
          };
        }).filter(Boolean); // Remove any null sections
      }

      // Otherwise, initialize from config
      if (!config.dynamicSections) {
        console.warn('No dynamicSections found in config');
        return [];
      }

      return config.dynamicSections.map(section => {
        if (!section || !section.name || !section.defaultRow) {
          console.warn('Invalid section in config:', section);
          return null;
        }
        return {
          name: section.name,
          rows: [section.defaultRow()]
        };
      }).filter(Boolean); // Remove any null sections
    } catch (error) {
      console.error('Error initializing sections:', error);
      return [];
    }
  });

  const [summaries, setSummaries] = useState(() => {
    const defaultSummaries = config.summaryFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {});
    return initialData?.summaries ? { ...defaultSummaries, ...initialData.summaries } : defaultSummaries;
  });

  const [preparedBy, setPreparedBy] = useState(initialData?.preparedBy || '');
  const [signature, setSignature] = useState(initialData?.signature || '');
  const [sigDate, setSigDate] = useState(initialData?.sigDate ? new Date(initialData.sigDate) : null);
  const [photos, setPhotos] = useState(initialData?.photos || []);
  const [draftId, setDraftId] = useState(initialData?.id || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  // Update state when initialData changes
  useEffect(() => {
    if (!initialData) return;
    
    console.log('ReportTemplate initialData changed:', initialData);
    
    const defaultHeader = config.headerFields.reduce((acc, field) => {
      if (field.type === 'dynamicArray') {
        return { ...acc, [field.name]: [{ location: '', rain: '', snow: '' }] };
      }
      return { ...acc, [field.name]: '' };
    }, { date: null, reportNo: 'Pending' });

    const updatedHeader = {
      ...defaultHeader,
      ...initialData.header
    };
    console.log('Updated header:', updatedHeader);
    setHeader(updatedHeader);

    if (initialData.sections && initialData.sections.length > 0) {
      const updatedSections = initialData.sections.map(section => ({
        ...section,
        rows: section.rows && section.rows.length > 0 ? section.rows : [section.defaultRow ? section.defaultRow() : {}]
      }));
      console.log('Updated sections:', updatedSections);
      setSections(updatedSections);
    } else if (config.dynamicSections) {
      // Fallback: initialize from config if sections is empty or missing
      const fallbackSections = config.dynamicSections.map(section => ({
        name: section.name,
        rows: [section.defaultRow ? section.defaultRow() : {}]
      }));
      console.log('Fallback sections from config:', fallbackSections);
      setSections(fallbackSections);
    } else {
      setSections([]);
    }

    // Always fully reset summaries from initialData
    if (initialData.summaries) {
      setSummaries({ ...initialData.summaries });
    } else {
      setSummaries({});
    }

    setPreparedBy(initialData.preparedBy || '');
    setSignature(initialData.signature || '');
    setSigDate(initialData.sigDate ? new Date(initialData.sigDate) : null);
    setPhotos(initialData.photos || []);
    setDraftId(initialData.id || null);
  }, [initialData]);

  // Debug logging for state and data flow
  console.log('initialData:', initialData);
  console.log('header:', header);
  console.log('sections:', sections);
  console.log('summaries:', summaries);
  console.log('photos:', photos);

  // Handlers
  const handleHeaderChange = e => setHeader({ ...header, [e.target.name]: e.target.value });
  
  const handleSectionChange = (sectionName, rowIndex, field, value) => {
    setSections(sections.map(section => {
      if (section.name !== sectionName) return section;
      return {
        ...section,
        rows: section.rows.map((row, idx) => 
          idx === rowIndex ? { ...row, [field]: value } : row
        )
      };
    }));
  };

  const handleAddRow = (sectionName) => {
    setSections(sections.map(section => {
      if (section.name !== sectionName) return section;
      const sectionConfig = config.dynamicSections.find(s => s.name === sectionName);
      return {
        ...section,
        rows: [...section.rows, sectionConfig.defaultRow()]
      };
    }));
  };

  const handleRemoveRow = (sectionName, rowIndex) => {
    setSections(sections.map(section => {
      if (section.name !== sectionName) return section;
      return {
        ...section,
        rows: section.rows.filter((_, idx) => idx !== rowIndex)
      };
    }));
  };

  const handleSummaryChange = (field, value) => {
    setSummaries({ ...summaries, [field]: value });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const uploadedPhotos = await Promise.all(
        files.map(file => uploadPhoto(file))
      );
      setPhotos([...photos, ...uploadedPhotos]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      enqueueSnackbar('Error uploading photos', { variant: 'error' });
    }
  };

  const handleClearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
      setSignature('');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (sigPadRef.current && !signature) {
      const signatureData = sigPadRef.current.toDataURL();
      setSignature(signatureData);
    }
    await handleSave();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = {
        header,
        sections,
        summaries,
        preparedBy,
        signature,
        sigDate: sigDate ? format(sigDate, 'yyyy-MM-dd') : null,
        photos,
        id: draftId
      };
      
      if (onSave) {
        await onSave(formData);
      }
      
      enqueueSnackbar('Report saved successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error saving report:', error);
      enqueueSnackbar('Error saving report: ' + error.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (draftId) {
        await axios.delete(`/drafts/${draftId}`);
        enqueueSnackbar('Report deleted successfully', { variant: 'success' });
        navigate('/environmental/reports/daily');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      enqueueSnackbar('Error deleting report: ' + error.message, { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleExit = () => {
    setExitDialogOpen(true);
  };

  const handleExitConfirm = async (shouldSave) => {
    if (shouldSave) {
      await handleSave();
    }
    navigate('/environmental/reports/daily');
  };

  const handleReview = () => {
    if (draftId) {
      navigate(`/environmental/reports/daily/review/${draftId}`);
    }
  };

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Dynamic Sections */}
          {(sections || []).map((section, sectionIdx) => {
            const sectionConfig = config.dynamicSections.find(s => s.name === section.name);
            const fields = sectionConfig ? sectionConfig.fields : [];

            // Validate section data
            if (!section || !section.name) {
              console.warn('Invalid section data:', section);
              return null;
            }

            // Find matching section config
            if (!sectionConfig) {
              console.warn(`Section "${section.name}" not found in config.dynamicSections`);
              return null;
            }

            // Validate section fields
            if (!Array.isArray(fields)) {
              console.warn(`Invalid fields for section "${section.name}":`, fields);
              return null;
            }

            // Render first section (header/project info) with white card wrapper
            if (sectionIdx === 0) {
              const inspectorField = fields.find(f => f.name === 'inspector');
              const projectField = fields.find(f => f.name === 'project');
              const contractorField = fields.find(f => f.name === 'contractor');
              const spreadField = fields.find(f => f.name === 'spread');
              const facilityField = fields.find(f => f.name === 'facility');
              const milepostStartField = fields.find(f => f.name === 'milepost_start');
              const milepostEndField = fields.find(f => f.name === 'milepost_end');
              const stationStartField = fields.find(f => f.name === 'station_start');
              const stationEndField = fields.find(f => f.name === 'station_end');

              return (
                <div key={`section-${section.name}-${sectionIdx}`} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
                  <div className="flex flex-col gap-4">
                    {/* Inspector and Project on one line for md+ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inspectorField && (
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{inspectorField.label}</label>
                          <input
                            type="text"
                            name={inspectorField.name}
                            value={header[inspectorField.name] || ''}
                            onChange={e => handleHeaderChange({ target: { name: inspectorField.name, value: e.target.value } })}
                            className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            required={inspectorField.required}
                          />
                        </div>
                      )}
                      {projectField && (
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{projectField.label}</label>
                          <input
                            type="text"
                            name={projectField.name}
                            value={header[projectField.name] || ''}
                            onChange={e => handleHeaderChange({ target: { name: projectField.name, value: e.target.value } })}
                            className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            required={projectField.required}
                          />
                        </div>
                      )}
                    </div>
                    {/* Spread and Facility on one line for mobile, revert to original for md+ */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {spreadField && (
                        <div className="col-span-1 md:col-span-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{spreadField.label}</label>
                          <input
                            type="text"
                            name={spreadField.name}
                            value={header[spreadField.name] || ''}
                            onChange={e => handleHeaderChange({ target: { name: spreadField.name, value: e.target.value } })}
                            className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                          />
                        </div>
                      )}
                      {facilityField && (
                        <div className="col-span-1 md:col-span-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{facilityField.label}</label>
                          <input
                            type="text"
                            name={facilityField.name}
                            value={header[facilityField.name] || ''}
                            onChange={e => handleHeaderChange({ target: { name: facilityField.name, value: e.target.value } })}
                            className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                          />
                        </div>
                      )}
                      {/* Contractor only on md+ as third column */}
                      {contractorField && (
                        <div className="hidden md:block md:col-span-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{contractorField.label}</label>
                          <input
                            type="text"
                            name={contractorField.name}
                            value={header[contractorField.name] || ''}
                            onChange={e => handleHeaderChange({ target: { name: contractorField.name, value: e.target.value } })}
                            className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            required={contractorField.required}
                          />
                        </div>
                      )}
                    </div>
                    {/* Contractor on its own line for mobile */}
                    {contractorField && (
                      <div className="block md:hidden">
                        <label className="block text-sm font-medium text-gray-600 mb-1">{contractorField.label}</label>
                        <input
                          type="text"
                          name={contractorField.name}
                          value={header[contractorField.name] || ''}
                          onChange={e => handleHeaderChange({ target: { name: contractorField.name, value: e.target.value } })}
                          className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                          required={contractorField.required}
                        />
                      </div>
                    )}
                    {/* Milepost and Station fields: 4 fields in one line on md+, two pairs on mobile */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {milepostStartField && (
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{milepostStartField.label}</label>
                          <input
                            type="text"
                            name={milepostStartField.name}
                            value={header[milepostStartField.name] || ''}
                            onChange={e => handleHeaderChange({ target: { name: milepostStartField.name, value: e.target.value } })}
                            className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                          />
                        </div>
                      )}
                      {milepostEndField && (
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{milepostEndField.label}</label>
                          <input
                            type="text"
                            name={milepostEndField.name}
                            value={header[milepostEndField.name] || ''}
                            onChange={e => handleHeaderChange({ target: { name: milepostEndField.name, value: e.target.value } })}
                            className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                          />
                        </div>
                      )}
                      {stationStartField && (
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{stationStartField.label}</label>
                          <input
                            type="text"
                            name={stationStartField.name}
                            value={header[stationStartField.name] || ''}
                            onChange={e => handleHeaderChange({ target: { name: stationStartField.name, value: e.target.value } })}
                            className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                          />
                        </div>
                      )}
                      {stationEndField && (
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{stationEndField.label}</label>
                          <input
                            type="text"
                            name={stationEndField.name}
                            value={header[stationEndField.name] || ''}
                            onChange={e => handleHeaderChange({ target: { name: stationEndField.name, value: e.target.value } })}
                            className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Custom layout for Weather Information
            if (section.name === 'Weather Information') {
              const weatherFields = fields.filter(f => f.name !== 'rain_gauges');
              const rainGaugeField = fields.find(f => f.name === 'rain_gauges');
              return (
                <div key={section.name} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
                  {(section.rows || []).map((row, rowIndex) => (
                    <>
                      {/* Weather fields: 2 per row on md and below, 4 per row on lg+ */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {weatherFields.map((field, idx) => {
                          if (!field || !field.label) {
                            console.warn('Invalid field in ReportTemplate:', field, idx);
                            return null;
                          }
                          return (
                            <div key={field.name} className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                {field.label}
                              </label>
                              {field.type === 'dropdown' ? (
                                <select
                                  value={row[field.name] || ''}
                                  onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                  className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                >
                                  <option value="">Select {field.label}</option>
                                  {(field.options || sectionConfig.dropdownOptions || []).map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type || 'text'}
                                  value={row[field.name] || ''}
                                  onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                  className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* Rain gauges on their own line */}
                      {rainGaugeField && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            {rainGaugeField.label}
                          </label>
                          <div className="space-y-2">
                            {(row[rainGaugeField.name] || []).map((item, idx) => (
                              <div key={idx}>
                                {/* Large screens: all fields in one row */}
                                <div className="hidden lg:flex gap-2">
                                  {rainGaugeField.subFields.map((subField, subFieldIndex) => (
                                    <div key={`${rainGaugeField.name}-${subField.name}-${subFieldIndex}`} className="flex-1">
                                      <label className="block text-sm font-medium text-gray-600 mb-1">
                                        {subField.label}
                                      </label>
                                      <input
                                        type={subField.type}
                                        value={item[subField.name] || ''}
                                        onChange={e =>
                                          handleSectionChange(
                                            section.name,
                                            rowIndex,
                                            rainGaugeField.name,
                                            (row[rainGaugeField.name] || []).map((subItem, subIdx) =>
                                              subIdx === idx
                                                ? { ...subItem, [subField.name]: e.target.value }
                                                : subItem
                                            )
                                          )
                                        }
                                        className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                        placeholder={subField.label}
                                      />
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSectionChange(
                                        section.name,
                                        rowIndex,
                                        rainGaugeField.name,
                                        (row[rainGaugeField.name] || []).filter((_, subIdx) => subIdx !== idx)
                                      )
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center"
                                  >
                                    <XMarkIcon className="h-5 w-5" />
                                  </button>
                                </div>
                                {/* Mobile/tablet: location on one line, rain/snow/trash on next line */}
                                <div className="block lg:hidden">
                                  <div className="mb-2">
                                    <input
                                      type={rainGaugeField.subFields[0].type}
                                      value={item[rainGaugeField.subFields[0].name] || ''}
                                      onChange={e =>
                                        handleSectionChange(
                                          section.name,
                                          rowIndex,
                                          rainGaugeField.name,
                                          (row[rainGaugeField.name] || []).map((subItem, subIdx) =>
                                            subIdx === idx
                                              ? { ...subItem, [rainGaugeField.subFields[0].name]: e.target.value }
                                              : subItem
                                          )
                                        )
                                      }
                                      className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                      placeholder={rainGaugeField.subFields[0].label}
                                    />
                                  </div>
                                  <div className="flex w-full min-w-0 gap-2 items-center">
                                    <input
                                      type={rainGaugeField.subFields[1].type}
                                      value={item[rainGaugeField.subFields[1].name] || ''}
                                      onChange={e =>
                                        handleSectionChange(
                                          section.name,
                                          rowIndex,
                                          rainGaugeField.name,
                                          (row[rainGaugeField.name] || []).map((subItem, subIdx) =>
                                            subIdx === idx
                                              ? { ...subItem, [rainGaugeField.subFields[1].name]: e.target.value }
                                              : subItem
                                          )
                                        )
                                      }
                                      className="flex-1 min-w-0 bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                      placeholder={rainGaugeField.subFields[1].label}
                                    />
                                    <input
                                      type={rainGaugeField.subFields[2].type}
                                      value={item[rainGaugeField.subFields[2].name] || ''}
                                      onChange={e =>
                                        handleSectionChange(
                                          section.name,
                                          rowIndex,
                                          rainGaugeField.name,
                                          (row[rainGaugeField.name] || []).map((subItem, subIdx) =>
                                            subIdx === idx
                                              ? { ...subItem, [rainGaugeField.subFields[2].name]: e.target.value }
                                              : subItem
                                          )
                                        )
                                      }
                                      className="flex-1 min-w-0 bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                      placeholder={rainGaugeField.subFields[2].label}
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSectionChange(
                                          section.name,
                                          rowIndex,
                                          rainGaugeField.name,
                                          (row[rainGaugeField.name] || []).filter((_, subIdx) => subIdx !== idx)
                                        )
                                      }
                                      className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center flex-none"
                                    >
                                      <XMarkIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                handleSectionChange(
                                  section.name,
                                  rowIndex,
                                  rainGaugeField.name,
                                  [...(row[rainGaugeField.name] || []), Object.fromEntries(rainGaugeField.subFields.map(sf => [sf.name, '']))]
                                )
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2 flex items-center gap-2"
                            >
                              <PlusIcon className="h-5 w-5" />
                              Add {rainGaugeField.label}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ))}
                </div>
              );
            }

            // Custom layout for Crew Daily Summaries
            if (section.name === 'Crew Daily Summaries') {
              const crewFields = fields.filter(f => f.name !== 'Summary');
              const summaryField = fields.find(f => f.name === 'Summary');
              return (
                <div key={section.name} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
                  {(section.rows || []).map((row, rowIndex) => (
                    <>
                      {/* All fields except Start/End Station */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {crewFields.filter(f => f.name !== 'Start Station' && f.name !== 'End Station').map((field, idx) => {
                          if (!field || !field.label) {
                            console.warn('Invalid field in ReportTemplate:', field, idx);
                            return null;
                          }
                          return (
                            <div key={field.name} className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                {field.label}
                              </label>
                              {field.type === 'dropdown' ? (
                                <select
                                  value={row[field.name] || ''}
                                  onChange={e => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                  className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                >
                                  <option value="">Select {field.label}</option>
                                  {(field.options || sectionConfig.dropdownOptions || []).map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type || 'text'}
                                  value={row[field.name] || ''}
                                  onChange={e => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                  className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                  placeholder={field.placeholder}
                                />
                              )}
                            </div>
                          );
                        })}
                        {/* Start Station and End Station side by side */}
                        <div className="col-span-1 md:col-span-2 flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Start Station</label>
                            <input
                              type="text"
                              value={row['Start Station'] || ''}
                              onChange={e => handleSectionChange(section.name, rowIndex, 'Start Station', e.target.value)}
                              className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">End Station</label>
                            <input
                              type="text"
                              value={row['End Station'] || ''}
                              onChange={e => handleSectionChange(section.name, rowIndex, 'End Station', e.target.value)}
                              className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            />
                          </div>
                        </div>
                      </div>
                      {summaryField && (
                        <div className="flex items-start gap-2 mb-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              {summaryField.label}
                            </label>
                            <textarea
                              value={row[summaryField.name] || ''}
                              onChange={e => handleSectionChange(section.name, rowIndex, summaryField.name, e.target.value)}
                              className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                              rows={3}
                            />
                          </div>
                          {!sectionConfig.isStatic && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(section.name, rowIndex)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center self-center mt-0"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ))}
                  {!sectionConfig.isStatic && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleAddRow(section.name)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2 flex items-center gap-2"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Add Row
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Custom layout for Daily Progress
            if (section.name === 'Daily Progress') {
              // Always get fields from config for this section
              const sectionConfig = config.dynamicSections.find(s => s.name === section.name);
              const fields = sectionConfig ? sectionConfig.fields : [];
              if (!fields[0] || !fields[0].label || !fields[1] || !fields[1].label || !fields[2] || !fields[2].label) {
                console.warn('Config for Daily Progress section is missing required fields:', fields);
                return null;
              }
              return (
                <div key={section.name} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
                  {(section.rows || []).map((row, rowIndex) => (
                    <div key={rowIndex} className="mb-4 w-full">
                      {/* MOBILE ONLY */}
                      <div className="block lg:hidden">
                        {/* Progress Item label and dropdown */}
                        <div className="w-full mb-2">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{fields[0].label}</label>
                          <select
                            value={row[fields[0].name] || ''}
                            onChange={e => handleSectionChange(section.name, rowIndex, fields[0].name, e.target.value)}
                            className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                          >
                            <option value="">Select {fields[0].label}</option>
                            {(fields[0].options || sectionConfig.dropdownOptions || []).map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        {/* Labels for Start/End Station */}
                        <div className="flex w-full gap-2 mt-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{fields[1].label}</label>
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{fields[2].label}</label>
                          </div>
                          <div className="w-8" />
                        </div>
                        {/* Start/End Station and Trashcan */}
                        <div className="flex w-full gap-2 items-center">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={row[fields[1].name] || ''}
                              onChange={e => handleSectionChange(section.name, rowIndex, fields[1].name, e.target.value)}
                              className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={row[fields[2].name] || ''}
                              onChange={e => handleSectionChange(section.name, rowIndex, fields[2].name, e.target.value)}
                              className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            />
                          </div>
                          {!sectionConfig.isStatic && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(section.name, rowIndex)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {/* DESKTOP ONLY */}
                      <div className="hidden lg:block w-full">
                        {/* Labels row */}
                        <div className="flex w-full gap-2 mb-1">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{fields[0].label}</label>
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{fields[1].label}</label>
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">{fields[2].label}</label>
                          </div>
                          <div className="w-8" />
                        </div>
                        {/* Fields row */}
                        <div className="flex w-full gap-2 items-center">
                          <div className="flex-1">
                            <select
                              value={row[fields[0].name] || ''}
                              onChange={e => handleSectionChange(section.name, rowIndex, fields[0].name, e.target.value)}
                              className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            >
                              <option value="">Select {fields[0].label}</option>
                              {(fields[0].options || sectionConfig.dropdownOptions || []).map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={row[fields[1].name] || ''}
                              onChange={e => handleSectionChange(section.name, rowIndex, fields[1].name, e.target.value)}
                              className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={row[fields[2].name] || ''}
                              onChange={e => handleSectionChange(section.name, rowIndex, fields[2].name, e.target.value)}
                              className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            />
                          </div>
                          {!sectionConfig.isStatic && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(section.name, rowIndex)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!sectionConfig.isStatic && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleAddRow(section.name)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2 flex items-center gap-2"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Add Row
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={`section-${section.name}-${sectionIdx}`} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
                {(section.rows || []).map((row, rowIndex) => {
                  // Validate row data
                  if (!row || typeof row !== 'object') {
                    console.warn(`Invalid row data in section "${section.name}" at index ${rowIndex}:`, row);
                    return null;
                  }

                  return (
                    <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {fields.map((field, idx) => {
                        if (!field || !field.name || !field.label) {
                          console.warn('Invalid field in ReportTemplate:', field, idx);
                          return null;
                        }
                        if (field.type === 'dynamicArray') {
                          return (
                            <div key={field.name} className="col-span-full">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                {field.label}
                              </label>
                              <div className="space-y-2">
                                {(row[field.name] || []).map((item, idx) => (
                                  <div key={idx}>
                                    {/* Large screens: all fields in one row */}
                                    <div className="hidden lg:flex gap-2">
                                      {field.subFields.map((subField, subFieldIndex) => (
                                        <div key={`${field.name}-${subField.name}-${subFieldIndex}`} className="flex-1">
                                          <label className="block text-sm font-medium text-gray-600 mb-1">
                                            {subField.label}
                                          </label>
                                          <input
                                            type={subField.type}
                                            value={item[subField.name] || ''}
                                            onChange={e =>
                                              handleSectionChange(
                                                section.name,
                                                rowIndex,
                                                field.name,
                                                (row[field.name] || []).map((subItem, subIdx) =>
                                                  subIdx === idx
                                                    ? { ...subItem, [subField.name]: e.target.value }
                                                    : subItem
                                                )
                                              )
                                            }
                                            className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                            placeholder={subField.label}
                                          />
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSectionChange(
                                            section.name,
                                            rowIndex,
                                            field.name,
                                            (row[field.name] || []).filter((_, subIdx) => subIdx !== idx)
                                          )
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center"
                                      >
                                        <XMarkIcon className="h-5 w-5" />
                                      </button>
                                    </div>
                                    {/* Mobile/tablet: location on one line, rain/snow/trash on next line */}
                                    <div className="block lg:hidden">
                                      <div className="mb-2">
                                        <input
                                          type={field.subFields[0].type}
                                          value={item[field.subFields[0].name] || ''}
                                          onChange={e =>
                                            handleSectionChange(
                                              section.name,
                                              rowIndex,
                                              field.name,
                                              (row[field.name] || []).map((subItem, subIdx) =>
                                                subIdx === idx
                                                  ? { ...subItem, [field.subFields[0].name]: e.target.value }
                                                  : subItem
                                              )
                                            )
                                          }
                                          className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                          placeholder={field.subFields[0].label}
                                        />
                                      </div>
                                      <div className="flex w-full min-w-0 gap-2 items-center">
                                        <input
                                          type={field.subFields[1].type}
                                          value={item[field.subFields[1].name] || ''}
                                          onChange={e =>
                                            handleSectionChange(
                                              section.name,
                                              rowIndex,
                                              field.name,
                                              (row[field.name] || []).map((subItem, subIdx) =>
                                                subIdx === idx
                                                  ? { ...subItem, [field.subFields[1].name]: e.target.value }
                                                  : subItem
                                              )
                                            )
                                          }
                                          className="flex-1 min-w-0 bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                          placeholder={field.subFields[1].label}
                                        />
                                        <input
                                          type={field.subFields[2].type}
                                          value={item[field.subFields[2].name] || ''}
                                          onChange={e =>
                                            handleSectionChange(
                                              section.name,
                                              rowIndex,
                                              field.name,
                                              (row[field.name] || []).map((subItem, subIdx) =>
                                                subIdx === idx
                                                  ? { ...subItem, [field.subFields[2].name]: e.target.value }
                                                  : subItem
                                              )
                                            )
                                          }
                                          className="flex-1 min-w-0 bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                          placeholder={field.subFields[2].label}
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleSectionChange(
                                              section.name,
                                              rowIndex,
                                              field.name,
                                              (row[field.name] || []).filter((_, subIdx) => subIdx !== idx)
                                            )
                                          }
                                          className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center flex-none"
                                        >
                                          <XMarkIcon className="h-5 w-5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSectionChange(
                                      section.name,
                                      rowIndex,
                                      field.name,
                                      [...(row[field.name] || []), Object.fromEntries(field.subFields.map(sf => [sf.name, '']))]
                                    )
                                  }
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2 flex items-center gap-2"
                                >
                                  <PlusIcon className="h-5 w-5" />
                                  Add {field.label}
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={field.name} className="col-span-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              {field.label}
                            </label>
                            {field.type === 'dropdown' ? (
                              <select
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                              >
                                <option value="">Select {field.label}</option>
                                {(field.options || sectionConfig.dropdownOptions || []).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === 'multiline' ? (
                              <textarea
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                                rows={3}
                              />
                            ) : (
                              <input
                                type={field.type || 'text'}
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                              />
                            )}
                          </div>
                        );
                      })}
                      {!sectionConfig.isStatic && (
                        <div className="col-span-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(section.name, rowIndex)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center self-center mt-0"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {!sectionConfig.isStatic && (
                  <button
                    type="button"
                    onClick={() => handleAddRow(section.name)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2 flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add Row
                  </button>
                )}
              </div>
            );
          })}

          {/* Summary Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{config.summarySectionTitle}</h2>
            <div className="space-y-4">
              {config.summaryFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {field.label}
                  </label>
                  <textarea
                    value={summaries[field.name] || ''}
                    onChange={(e) => handleSummaryChange(field.name, e.target.value)}
                    className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                    rows={4}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Signature Section */}
          {config.requiresSignature && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Signature</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Prepared By
                  </label>
                  <input
                    type="text"
                    value={preparedBy}
                    onChange={(e) => setPreparedBy(e.target.value)}
                    className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Signature
                  </label>
                  <div className="mt-1 border border-gray-300 rounded-md">
                    <SignaturePad
                      ref={sigPadRef}
                      canvasProps={{
                        className: 'w-full h-48 rounded-md'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Signature
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={sigDate ? format(sigDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setSigDate(new Date(e.target.value))}
                    className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Photos</h2>
            <ReportPhotoSection
              photos={photos}
              onPhotosChange={setPhotos}
              content_type={config.reportType || 'template'}
              object_id={draftId || id}
              editable={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-end">
            <button
              type="button"
              onClick={handleExit}
              className="bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-md px-4 py-2"
            >
              Exit
            </button>
            {draftId && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-4 py-2"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleReview}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md px-4 py-2"
            >
              Review
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md px-4 py-2"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Report</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {exitDialogOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Exit Report</h3>
            <p className="text-sm text-gray-500 mb-4">
              Do you want to save your changes before exiting?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setExitDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExitConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Don't Save
              </button>
              <button
                type="button"
                onClick={() => handleExitConfirm(true)}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ReportTemplate.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string.isRequired,
    reportType: PropTypes.string.isRequired,
    headerFields: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      required: PropTypes.bool,
      type: PropTypes.string,
      placeholder: PropTypes.string
    })).isRequired,
    dynamicSections: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string,
        required: PropTypes.bool
      })).isRequired,
      defaultRow: PropTypes.func.isRequired,
      dropdownOptions: PropTypes.arrayOf(PropTypes.string),
      isStatic: PropTypes.bool
    })).isRequired,
    summaryFields: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      multiline: PropTypes.bool
    })).isRequired,
    requiresSignature: PropTypes.bool,
    requiresPhotos: PropTypes.bool,
    summarySectionTitle: PropTypes.string
  }).isRequired,
  initialData: PropTypes.shape({
    header: PropTypes.object,
    sections: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      rows: PropTypes.arrayOf(PropTypes.object).isRequired
    })),
    summaries: PropTypes.object,
    preparedBy: PropTypes.string,
    signature: PropTypes.string,
    sigDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    photos: PropTypes.arrayOf(PropTypes.string),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onSave: PropTypes.func.isRequired
};

export default ReportTemplate; 