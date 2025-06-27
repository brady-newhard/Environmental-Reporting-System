import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { deleteDraft } from '../../utils/draftUtils';
import { uploadPhoto } from '../../utils/photoUtils';
import PageHeader from '../common/PageHeader';
import { 
  PlusIcon, 
  TrashIcon, 
  CameraIcon, 
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  CheckIcon,
  PencilIcon,
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

const ReportTemplate = ({ config = defaultConfig, initialData = null, onSave, onDelete, onReview, onChange }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const sigPadRef = useRef(null);
  const previousFormDataRef = useRef(null);
  const { id } = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Initialize state with default values from config
  const [header, setHeader] = useState(() => {
    // For SWPPP reports, headerFields is empty, so we need to get header data from dynamicSections
    let headerFields = config.headerFields;
    if (config.reportType === 'swppp' && config.headerFields.length === 0) {
      // Extract fields from the first two sections (Inspection Information and Project Information)
      const inspectionSection = config.dynamicSections.find(s => s.name === 'Inspection Information');
      const projectSection = config.dynamicSections.find(s => s.name === 'Project Information');
      
      if (inspectionSection) {
        headerFields = [...headerFields, ...inspectionSection.fields];
      }
      if (projectSection) {
        headerFields = [...headerFields, ...projectSection.fields];
      }
    }

    const defaultHeader = headerFields.reduce((acc, field) => {
      if (field.type === 'dynamicArray') {
        return { ...acc, [field.name]: [{ location: '', rain: '', snow: '' }] };
      }
      return { ...acc, [field.name]: '' };
    }, { date: null, reportNo: 'Pending' });
    
    if (initialData?.header) {
      const mergedHeader = { ...defaultHeader, ...initialData.header };
      if (headerFields.some(field => field.type === 'dynamicArray')) {
        headerFields.forEach(field => {
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

  // Update state when initialData changes
  useEffect(() => {
    if (!initialData) return;
    
    // For SWPPP reports, headerFields is empty, so we need to get header data from dynamicSections
    let headerFields = config.headerFields;
    if (config.reportType === 'swppp' && config.headerFields.length === 0) {
      // Extract fields from the first two sections (Inspection Information and Project Information)
      const inspectionSection = config.dynamicSections.find(s => s.name === 'Inspection Information');
      const projectSection = config.dynamicSections.find(s => s.name === 'Project Information');
      
      if (inspectionSection) {
        headerFields = [...headerFields, ...inspectionSection.fields];
      }
      if (projectSection) {
        headerFields = [...headerFields, ...projectSection.fields];
      }
    }
    
    const defaultHeader = headerFields.reduce((acc, field) => {
      if (field.type === 'dynamicArray') {
        return { ...acc, [field.name]: [{ location: '', rain: '', snow: '' }] };
      }
      return { ...acc, [field.name]: '' };
    }, { date: null, reportNo: 'Pending' });

    const updatedHeader = {
      ...defaultHeader,
      ...initialData.header
    };
    setHeader(updatedHeader);

    if (initialData.sections && initialData.sections.length > 0) {
      const updatedSections = initialData.sections.map(section => ({
        ...section,
        rows: section.rows && section.rows.length > 0 ? section.rows : [section.defaultRow ? section.defaultRow() : {}]
      }));
      setSections(updatedSections);
    } else if (config.dynamicSections) {
      const fallbackSections = config.dynamicSections.map(section => ({
        name: section.name,
        rows: [section.defaultRow ? section.defaultRow() : {}]
      }));
      setSections(fallbackSections);
    } else {
      setSections([]);
    }

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
  }, [initialData?.id, config]);

  // Debug logging for state and data flow
  // console.log('initialData:', initialData);
  // console.log('header:', header);
  // console.log('sections:', sections);
  // console.log('summaries:', summaries);
  // console.log('photos:', photos);

  // Call onChange prop whenever form data changes
  useEffect(() => {
    if (onChange && draftId) { // Only call onChange if we have a draftId
      const formData = {
        id: draftId,
        header,
        sections,
        summaries,
        photos,
        signature,
        sigDate,
        preparedBy,
      };
      onChange(formData);
    }
  }, [header, sections, summaries, photos, signature, sigDate, preparedBy, draftId]);

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
    const formData = {
      id: draftId,
      header,
      sections,
      summaries,
      photos,
      signature: sigPadRef.current ? sigPadRef.current.toDataURL() : '',
      sigDate: sigDate || '',
      preparedBy,
    };
    await handleSave(formData);
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
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
        await deleteDraft('environmental', draftId);
        enqueueSnackbar('Report deleted successfully', { variant: 'success' });
        navigate('/environmental/reports/daily');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      enqueueSnackbar(error.response?.data?.detail || 'Error deleting report', { variant: 'error' });
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
    navigate(draftId ? '/environmental/reports/daily/drafts' : '/environmental/reports');
  };

  const handleReview = () => {
    // Format the date in local timezone
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    // Format rain gauge data
    const formatRainGaugeData = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) {
        return data.map(gauge => {
          if (typeof gauge === 'object' && gauge !== null) {
            // Ensure all values are strings
            const location = gauge.location || gauge.Location || '';
            const rain = gauge.rain || gauge.Rain || '';
            const snow = gauge.snow || gauge.Snow || '';
            
            return {
              location: typeof location === 'object' ? '' : String(location),
              rain: typeof rain === 'object' ? '' : String(rain),
              snow: typeof snow === 'object' ? '' : String(snow)
            };
          }
          return { location: String(gauge), rain: '', snow: '' };
        });
      }
      return [];
    };

    // Create comprehensive review data with all current form state
    const reviewData = {
      id: draftId,
      header: {
        ...header, // Include all header fields
        date: formatDate(header.date),
      },
      sections: sections ? sections.map(section => ({
        name: section.name,
        rows: section.rows || [],
        // Include all section data, even if empty
      })) : [],
      summaries: summaries || {},
      photos: photos ? photos.map(photo => ({
        id: photo.id,
        url: photo.url || photo.file || photo.preview || photo.image_url,
        comment: photo.comment || photo.comments || photo.description || '',
        location: photo.location || '',
      })) : [],
      signature: signature || '',
      sigDate: sigDate ? formatDate(sigDate) : '',
      preparedBy: preparedBy || '',
    };

    // console.log('Review data being passed:', reviewData); // Debug log
    // console.log('Sections being passed to review:', reviewData.sections);
    // console.log('Photos being passed to review:', reviewData.photos);

    // Navigate to the appropriate review page based on report type
    if (config.reportType === 'swppp') {
      navigate(`/environmental/swppp/review/${draftId}`, { state: { reportData: reviewData } });
    } else {
      navigate(`/environmental/reports/daily/review/${draftId}`, { state: { reportData: reviewData } });
    }
  };

  // Update the signature date handler
  const handleSigDateChange = (e) => {
    setSigDate(e.target.value); // Store as 'YYYY-MM-DD'
  };

  // Update the date input handler to handle timezone correctly
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    // Adjust for timezone offset
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    handleHeaderChange({ target: { name: 'date', value: localDate.toISOString().split('T')[0] } });
  };

  // Notification handler for photo operations
  const handlePhotoNotification = (message, severity = 'success') => {
    enqueueSnackbar(message, { variant: severity });
  };

  const renderField = (field, value, onChange) => {
    if (!field) return null;

    switch (field.type) {
      case 'dropdown':
        return (
          <select
            name={field.name}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 'time':
        return (
          <input
            type="time"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 'multiline':
        return (
          <textarea
            name={field.name}
            value={value || ''}
            onChange={onChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 'dynamicArray':
        return (
          <div className="space-y-4">
            {(value || []).map((item, index) => (
              <div key={index} className="flex flex-wrap -mx-2 items-end">
                {field.subfields?.map(subfield => (
                  <div key={subfield.name} className={`px-2 mb-2 ${subfield.className || 'flex-1'}`}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {subfield.label}
                    </label>
                    {renderField(subfield, item[subfield.name], (e) => {
                      const newValue = [...(value || [])];
                      newValue[index] = {
                        ...newValue[index],
                        [subfield.name]: e.target.value
                      };
                      onChange({ target: { name: field.name, value: newValue } });
                    })}
                  </div>
                ))}
                <div className="px-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = [...(value || [])];
                      newValue.splice(index, 1);
                      onChange({ target: { name: field.name, value: newValue } });
                    }}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newValue = [...(value || [])];
                newValue.push({});
                onChange({ target: { name: field.name, value: newValue } });
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add {field.label}
            </button>
          </div>
        );
      default:
        return (
          <input
            type="text"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
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

            // SWPPP: Render Inspection Information as a normal card
            if (config.reportType === 'swppp' && section.name === 'Inspection Information') {
              return (
                <div key={`section-${section.name}-${sectionIdx}`} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.filter(Boolean).map(field => (
                      <div key={field.name} className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
                        {renderField(field, header[field.name], e =>
                          handleHeaderChange(e)
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // SWPPP: Render Project Information as a normal card
            if (config.reportType === 'swppp' && section.name === 'Project Information') {
              return (
                <div key={`section-${section.name}-${sectionIdx}`} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
                  
                  {/* Line 1: Project, Spread, Facility */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {fields.filter(f => ['project', 'spread', 'facility'].includes(f.name)).map(field => (
                      <div key={field.name} className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
                        {renderField(field, header[field.name], e =>
                          handleHeaderChange(e)
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Line 2: Inspector, Contractor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {fields.filter(f => ['inspector', 'contractor'].includes(f.name)).map(field => (
                      <div key={field.name} className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
                        {renderField(field, header[field.name], e =>
                          handleHeaderChange(e)
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Line 3: Milepost Start, Milepost End, Station Start, Station End */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {fields.filter(f => ['milepost_start', 'milepost_end', 'station_start', 'station_end'].includes(f.name)).map(field => (
                      <div key={field.name} className="col-span-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
                        {renderField(field, header[field.name], e =>
                          handleHeaderChange(e)
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Render first section (header/project info) with white card wrapper for non-SWPPP reports
            if (sectionIdx === 0 && config.reportType !== 'swppp') {
              const inspectorField = fields.find(f => f.name === 'inspector');
              const projectField = fields.find(f => f.name === 'project');
              const contractorField = fields.find(f => f.name === 'contractor');
              const spreadField = fields.find(f => f.name === 'spread');
              const facilityField = fields.find(f => f.name === 'facility');
              const milepostStartField = fields.find(f => f.name === 'milepost_start');
              const milepostEndField = fields.find(f => f.name === 'milepost_end');
              const stationStartField = fields.find(f => f.name === 'station_start');
              const stationEndField = fields.find(f => f.name === 'station_end');
              const dateField = fields.find(f => f.name === 'date');

              return (
                <div key={`section-${section.name}-${sectionIdx}`} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{section.name}</h2>
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-600 mr-2">Date:</label>
                      <input
                        type="date"
                        name="date"
                        value={header.date ? new Date(header.date).toISOString().split('T')[0] : ''}
                        onChange={handleDateChange}
                        className="bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                      {/* Original daily report layout */}
                      <>
                        {/* Inspector and Project on one line for md+ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {inspectorField && (
                            <div className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">{inspectorField.label}</label>
                              {renderField(inspectorField, header[inspectorField.name], handleHeaderChange)}
                            </div>
                          )}
                          {projectField && (
                            <div className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">{projectField.label}</label>
                              {renderField(projectField, header[projectField.name], handleHeaderChange)}
                            </div>
                          )}
                        </div>
                        {/* Spread and Facility on one line for mobile, revert to original for md+ */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {spreadField && (
                            <div className="col-span-1 md:col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">{spreadField.label}</label>
                              {renderField(spreadField, header[spreadField.name], handleHeaderChange)}
                            </div>
                          )}
                          {facilityField && (
                            <div className="col-span-1 md:col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">{facilityField.label}</label>
                              {renderField(facilityField, header[facilityField.name], handleHeaderChange)}
                            </div>
                          )}
                          {/* Contractor only on md+ as third column */}
                          {contractorField && (
                            <div className="hidden md:block md:col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">{contractorField.label}</label>
                              {renderField(contractorField, header[contractorField.name], handleHeaderChange)}
                            </div>
                          )}
                        </div>
                        {/* Milepost and Station fields: 4 fields in one line on md+, two pairs on mobile */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {milepostStartField && (
                            <div className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">{milepostStartField.label}</label>
                              {renderField(milepostStartField, header[milepostStartField.name], handleHeaderChange)}
                            </div>
                          )}
                          {milepostEndField && (
                            <div className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">{milepostEndField.label}</label>
                              {renderField(milepostEndField, header[milepostEndField.name], handleHeaderChange)}
                            </div>
                          )}
                          {stationStartField && (
                            <div className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">{stationStartField.label}</label>
                              {renderField(stationStartField, header[stationStartField.name], handleHeaderChange)}
                            </div>
                          )}
                          {stationEndField && (
                            <div className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">{stationEndField.label}</label>
                              {renderField(stationEndField, header[stationEndField.name], handleHeaderChange)}
                            </div>
                          )}
                        </div>
                      </>
                  </div>
                </div>
              );
            }

            // Weather Information Section (matches Environmental)
            if (section.name === 'Weather Information') {
              // console.log('Rendering Weather Information section:', section);
              // console.log('Weather Information sectionConfig:', sectionConfig);
              // console.log('Weather Information fields:', fields);
              
              // Ensure we have the correct fields for SWPPP
              let weatherFields = fields;
              if (config.reportType === 'swppp') {
                const swpppWeatherSection = config.dynamicSections.find(s => s.name === 'Weather Information');
                weatherFields = swpppWeatherSection ? swpppWeatherSection.fields : fields;
                // console.log('SWPPP Weather fields:', weatherFields);
              }
              
              const rainGaugeField = weatherFields.find(f => f.name === 'rain_gauges');
              return (
                <div key={section.name} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
                  {(section.rows || []).map((row, rowIndex) => {
                    // Ensure all expected keys are present in the row
                    const defaultWeatherRow = {
                      weather_conditions: '',
                      temperature: '',
                      precipitation_type: '',
                      soil_conditions: '',
                      rain_gauges: []
                    };
                    const safeRow = { ...defaultWeatherRow, ...row };
                    // console.log('Weather Information row:', safeRow);
                    return (
                      <>
                        {/* Weather fields: 2 per row on md and below, 4 per row on lg+ */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          {weatherFields.filter(Boolean).filter(field => field.name !== 'rain_gauges').map((field, idx) => {
                            if (!field || !field.label) {
                              console.warn('Invalid field in ReportTemplate:', field, idx);
                              return null;
                            }
                            return (
                              <div key={field.name} className="col-span-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  {field.label}
                                </label>
                                {renderField(field, safeRow[field.name], (e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value))}
                              </div>
                            );
                          })}
                        </div>
                        {/* Rain gauges on their own line */}
                        {rainGaugeField && (
                          <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-600 mb-1">
                              {rainGaugeField.label}
                            </label>
                            {/* Column headers for rain gauge subfields, only show if at least one row exists */}
                            {(safeRow[rainGaugeField.name] || []).length > 0 && (
                              <div className="hidden md:flex gap-2 mb-1 w-full">
                                {rainGaugeField.subFields.map((subField, idx) => (
                                  <div key={subField.name} className="flex-1 text-gray-700">
                                    {subField.label}
                                  </div>
                                ))}
                                <div className="w-8" />
                              </div>
                            )}
                            <div className="space-y-2">
                              {(safeRow[rainGaugeField.name] || []).map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center w-full">
                                  {rainGaugeField.subFields.map((subField, subFieldIndex) => (
                                    <div key={`${rainGaugeField.name}-${subField.name}-${subFieldIndex}}`} className="flex-1">
                                      <label className="sr-only">{subField.label}</label>
                                      {renderField(subField, item[subField.name], (e) =>
                                        handleSectionChange(
                                          section.name,
                                          rowIndex,
                                          rainGaugeField.name,
                                          (safeRow[rainGaugeField.name] || []).map((subItem, subIdx) =>
                                            subIdx === idx
                                              ? { ...subItem, [subField.name]: e.target.value }
                                              : subItem
                                          )
                                        )
                                      )}
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSectionChange(
                                        section.name,
                                        rowIndex,
                                        rainGaugeField.name,
                                        (safeRow[rainGaugeField.name] || []).filter((_, subIdx) => subIdx !== idx)
                                      )
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center flex-none"
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
                                    [...(safeRow[rainGaugeField.name] || []), Object.fromEntries(rainGaugeField.subFields.map(sf => [sf.name, '']))]
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
                    );
                  })}
                </div>
              );
            }

            // Custom layout for Crew Daily Summaries
            if (section.name === 'Crew Daily Summaries') {
              const crewFields = fields;
              return (
                <div key={section.name} className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{section.name}</h2>
                  {(section.rows || []).map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                      {/* First row: Crew, Foreman */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Crew</label>
                          {renderField(crewFields.find(f => f.name === 'Crew'), row['Crew'], (e) => handleSectionChange(section.name, rowIndex, 'Crew', e.target.value))}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Foreman</label>
                          {renderField(crewFields.find(f => f.name === 'Foreman'), row['Foreman'], (e) => handleSectionChange(section.name, rowIndex, 'Foreman', e.target.value))}
                        </div>
                      </div>
                      {/* Second row: Milepost Start, Milepost End, Station Start, Station End */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Milepost Start</label>
                          {renderField({ ...crewFields.find(f => f.name === 'Milepost Start'), type: 'text' }, row['Milepost Start'], (e) => handleSectionChange(section.name, rowIndex, 'Milepost Start', e.target.value))}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Milepost End</label>
                          {renderField({ ...crewFields.find(f => f.name === 'Milepost End'), type: 'text' }, row['Milepost End'], (e) => handleSectionChange(section.name, rowIndex, 'Milepost End', e.target.value))}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Start Station</label>
                          {renderField(crewFields.find(f => f.name === 'Start Station'), row['Start Station'], (e) => handleSectionChange(section.name, rowIndex, 'Start Station', e.target.value))}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">End Station</label>
                          {renderField(crewFields.find(f => f.name === 'End Station'), row['End Station'], (e) => handleSectionChange(section.name, rowIndex, 'End Station', e.target.value))}
                        </div>
                      </div>
                      {/* Third row: Summary (true multiline textarea) with trashcan vertically centered */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">Summary</label>
                          <textarea
                            value={row['Summary'] || ''}
                            onChange={e => handleSectionChange(section.name, rowIndex, 'Summary', e.target.value)}
                            className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                            rows={3}
                          />
                        </div>
                        {!sectionConfig.isStatic && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(section.name, rowIndex)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center self-center"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </React.Fragment>
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
                    <div key={`row-${section.name}-${rowIndex}`} className="mb-4 w-full">
                      {/* MOBILE ONLY */}
                      <div className="block lg:hidden">
                        {/* Progress Item label and dropdown */}
                        <div className="w-full mb-2">
                          <label className="block text-sm font-medium text-gray-600 mb-1">{fields[0].label}</label>
                          {renderField(fields[0], row[fields[0].name], (e) => handleSectionChange(section.name, rowIndex, fields[0].name, e.target.value))}
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
                            {renderField(fields[1], row[fields[1].name], (e) => handleSectionChange(section.name, rowIndex, fields[1].name, e.target.value))}
                          </div>
                          <div className="flex-1">
                            {renderField(fields[2], row[fields[2].name], (e) => handleSectionChange(section.name, rowIndex, fields[2].name, e.target.value))}
                          </div>
                          {!sectionConfig.isStatic && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(section.name, rowIndex)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center"
                            >
                              <XMarkIcon className="h-5 w-5" />
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
                            {renderField(fields[0], row[fields[0].name], (e) => handleSectionChange(section.name, rowIndex, fields[0].name, e.target.value))}
                          </div>
                          <div className="flex-1">
                            {renderField(fields[1], row[fields[1].name], (e) => handleSectionChange(section.name, rowIndex, fields[1].name, e.target.value))}
                          </div>
                          <div className="flex-1">
                            {renderField(fields[2], row[fields[2].name], (e) => handleSectionChange(section.name, rowIndex, fields[2].name, e.target.value))}
                          </div>
                          {!sectionConfig.isStatic && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(section.name, rowIndex)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center"
                            >
                              <XMarkIcon className="h-5 w-5" />
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

            // Custom layout for SWPPP Inspection Items
            if (config.reportType === 'swppp' && section.name === 'SWPPP Inspection Items') {
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
                      <div key={`row-${section.name}-${rowIndex}`} className="space-y-4">
                        {/* Line 1: Station Start, Station End, Feature Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {fields.filter(f => ['station_start', 'station_end', 'feature_details'].includes(f.name)).map((field, idx) => (
                            <div key={`field-${field.name}-${idx}`} className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                {field.label}
                              </label>
                              {renderField(field, row[field.name], (e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value))}
                            </div>
                          ))}
                        </div>
                        
                        {/* Line 2: Inspector ID, Inspection Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {fields.filter(f => ['inspector_id', 'inspection_time'].includes(f.name)).map((field, idx) => (
                            <div key={`field-${field.name}-${idx}`} className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                {field.label}
                              </label>
                              {renderField(field, row[field.name], (e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value))}
                            </div>
                          ))}
                        </div>
                        
                        {/* Line 3: ECD Functional?, ECD Needs Maintenance?, Soil Disturbed? (3 dropdowns) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {fields.filter(f => ['ecd_functional', 'ecd_needs_maintenance', 'soil_disturbed'].includes(f.name)).map((field, idx) => (
                            <div key={`field-${field.name}-${idx}`} className="col-span-1">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                {field.label}
                              </label>
                              {renderField(field, row[field.name], (e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value))}
                            </div>
                          ))}
                        </div>
                        
                        {/* Line 4: Comments (100% width) with trashcan vertically centered */}
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            {fields.filter(f => f.name === 'comments').map((field, idx) => (
                              <div key={`field-${field.name}-${idx}`}>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                  {field.label}
                                </label>
                                {renderField(field, row[field.name], e => handleSectionChange(section.name, rowIndex, field.name, e.target.value))}
                              </div>
                            ))}
                          </div>
                          {!sectionConfig.isStatic && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(section.name, rowIndex)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md px-2 py-2 flex items-center justify-center self-center mt-6"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
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
                    <div key={`row-${section.name}-${rowIndex}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {fields.filter(Boolean).map((field, idx) => {
                        if (!field || !field.name || !field.label) {
                          console.warn('Invalid field in ReportTemplate:', field, idx);
                          return null;
                        }
                        if (field.type === 'dynamicArray') {
                          return (
                            <div key={`field-${field.name}-${idx}`} className="col-span-full">
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                {field.label}
                              </label>
                              {renderField(field, row[field.name], (e) =>
                                handleSectionChange(
                                  section.name,
                                  rowIndex,
                                  field.name,
                                  e.target.value
                                )
                              )}
                            </div>
                          );
                        }
                        return (
                          <div key={`field-${field.name}-${idx}`} className="col-span-1">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              {field.label}
                            </label>
                            {renderField(field, row[field.name], (e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value))}
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
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{config.summarySectionTitle || 'Summary'}</h2>
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
                  <label className="block text-sm font-medium text-gray-600 mb-1">Prepared By</label>
                  <input
                    type="text"
                    value={preparedBy}
                    onChange={(e) => setPreparedBy(e.target.value)}
                    className="w-full bg-white border border-gray-600 text-gray-900 placeholder-gray-700 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Signature</label>
                  <div className="mt-1 border border-gray-300 rounded-md">
                    <SignaturePad
                      ref={sigPadRef}
                      canvasProps={{ className: 'w-full h-48 rounded-md' }}
                      onEnd={() => {
                        if (sigPadRef.current) {
                          setSignature(sigPadRef.current.toDataURL());
                        }
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
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={sigDate || ''}
                    onChange={handleSigDateChange}
                    className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload Section */}
          {config.requiresPhotos && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Photos</h2>
              <ReportPhotoSection
                photos={photos}
                onPhotosChange={setPhotos}
                content_type={config.reportType || 'template'}
                object_id={draftId && !String(draftId).startsWith('temp_') ? draftId : null}
                editable={draftId && !String(draftId).startsWith('temp_')}
                onNotification={handlePhotoNotification}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-end">
            <button
              type="button"
              onClick={handleExit}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Exit</span>
            </button>
            {draftId && !String(draftId).startsWith('temp_') && (
              <>
                <button
                  type="button"
                  onClick={typeof onDelete === 'function' ? () => onDelete({ id: draftId }) : handleDelete}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
                <button
                  type="button"
                  onClick={typeof onReview === 'function' ? () => onReview({
                    id: draftId,
                    header,
                    sections,
                    summaries,
                    preparedBy,
                    signature,
                    sigDate,
                    photos
                  }) : handleReview}
                  className="inline-flex items-center px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Review</span>
                </button>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <PencilIcon className="h-5 h-5 mr-2" />
              <span className="hidden sm:inline">{loading ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </form>
      </div>
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
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onReview: PropTypes.func,
  onChange: PropTypes.func
};

export default ReportTemplate; 