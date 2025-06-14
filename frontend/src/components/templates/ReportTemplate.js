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

const ReportTemplate = ({ config = defaultConfig, initialData, onSave }) => {
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

    if (initialData.sections) {
      const updatedSections = initialData.sections.map(section => ({
        ...section,
        rows: section.rows && section.rows.length > 0 ? section.rows : [section.defaultRow ? section.defaultRow() : {}]
      }));
      console.log('Updated sections:', updatedSections);
      setSections(updatedSections);
    }

    if (initialData.summaries) {
      const updatedSummaries = {
        ...summaries,
        ...initialData.summaries
      };
      console.log('Updated summaries:', updatedSummaries);
      setSummaries(updatedSummaries);
    }

    if (initialData.preparedBy) setPreparedBy(initialData.preparedBy);
    if (initialData.signature) setSignature(initialData.signature);
    if (initialData.sigDate) setSigDate(new Date(initialData.sigDate));
    if (initialData.photos) setPhotos(initialData.photos);
    if (initialData.id) setDraftId(initialData.id);
  }, [initialData]);

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
        await axios.delete(`/api/drafts/${draftId}`);
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
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-2xl font-semibold mb-4">{config.title}</h2>
            <div className="space-y-6">
              {config.headerFields.map((field, index) => (
                field.type === 'section' ? (
                  <h3 key={field.name} className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    {field.label}
                  </h3>
                ) : (
                  <div key={field.name} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {field.label}
                      </label>
                      {field.type === 'dropdown' ? (
                        <select
                          name={field.name}
                          value={header[field.name] || ''}
                          onChange={handleHeaderChange}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'date' ? (
                        <input
                          type="date"
                          name={field.name}
                          value={header[field.name] || ''}
                          onChange={handleHeaderChange}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : field.type === 'dynamicArray' ? (
                        <div className="space-y-2">
                          {header[field.name].map((item, index) => (
                            <div key={index} className="flex gap-2">
                              {field.subFields.map((subField) => (
                                <input
                                  key={subField.name}
                                  type={subField.type}
                                  name={`${field.name}.${index}.${subField.name}`}
                                  value={item[subField.name] || ''}
                                  onChange={handleHeaderChange}
                                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder={subField.label}
                                />
                              ))}
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(field.name, index)}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddRow(field.name)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md px-4 py-2 flex items-center gap-2"
                          >
                            <PlusIcon className="h-5 w-5" />
                            Add {field.label}
                          </button>
                        </div>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          name={field.name}
                          value={header[field.name] || ''}
                          onChange={handleHeaderChange}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Dynamic Sections */}
          {(sections || []).map((section, sectionIdx) => {
            // Validate section data
            if (!section || !section.name) {
              console.warn('Invalid section data:', section);
              return null;
            }

            // Find matching section config
            const sectionConfig = config.dynamicSections?.find(s => s.name === section.name);
            if (!sectionConfig) {
              console.warn(`Section "${section.name}" not found in config.dynamicSections`);
              return null;
            }

            // Validate section fields
            const fields = sectionConfig.fields || [];
            if (!Array.isArray(fields)) {
              console.warn(`Invalid fields for section "${section.name}":`, fields);
              return null;
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {weatherFields.map((field) => (
                          <div key={field.name} className="col-span-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              {field.label}
                            </label>
                            {field.type === 'dropdown' ? (
                              <select
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select {field.label}</option>
                                {(field.options || sectionConfig.dropdownOptions || []).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type || 'text'}
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      {rainGaugeField && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            {rainGaugeField.label}
                          </label>
                          <div className="space-y-2">
                            {(row[rainGaugeField.name] || []).map((item, idx) => (
                              <div key={idx} className="flex gap-2">
                                {rainGaugeField.subFields.map((subField) => (
                                  <input
                                    key={subField.name}
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
                                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={subField.label}
                                  />
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
                                  className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {crewFields.map((field) => (
                          <div key={field.name} className="col-span-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              {field.label}
                            </label>
                            {field.type === 'dropdown' ? (
                              <select
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select {field.label}</option>
                                {(field.options || sectionConfig.dropdownOptions || []).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type || 'text'}
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      {summaryField && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            {summaryField.label}
                          </label>
                          <textarea
                            value={row[summaryField.name] || ''}
                            onChange={(e) => handleSectionChange(section.name, rowIndex, summaryField.name, e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                        </div>
                      )}
                      {!sectionConfig.isStatic && (
                        <div className="col-span-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(section.name, rowIndex)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-4 py-2"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </>
                  ))}
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
            }

            return (
              <div key={section.name} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
                {(section.rows || []).map((row, rowIndex) => {
                  // Validate row data
                  if (!row || typeof row !== 'object') {
                    console.warn(`Invalid row data in section "${section.name}" at index ${rowIndex}:`, row);
                    return null;
                  }

                  return (
                    <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {fields.map((field) => {
                        // Validate field data
                        if (!field || !field.name || !field.label) {
                          console.warn(`Invalid field data in section "${section.name}":`, field);
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
                                  <div key={idx} className="flex gap-2">
                                    {field.subFields.map((subField) => (
                                      <input
                                        key={subField.name}
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
                                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={subField.label}
                                      />
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
                                      className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2"
                                    >
                                      <XMarkIcon className="h-5 w-5" />
                                    </button>
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
                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                              />
                            ) : (
                              <input
                                type={field.type || 'text'}
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-4 py-2"
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
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photo Section */}
          {config.requiresPhotos && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Photos</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <CameraIcon className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotos(photos.filter((_, i) => i !== index));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
    id: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired
};

ReportTemplate.defaultProps = {
  config: defaultConfig,
  initialData: null
};

export default ReportTemplate; 