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
    if (initialData?.sections) {
      return initialData.sections.map(section => ({
        ...section,
        rows: section.rows && section.rows.length > 0 ? section.rows : [section.defaultRow ? section.defaultRow() : {}]
      }));
    }
    return config.dynamicSections.map(section => ({
      name: section.name,
      rows: [section.defaultRow()]
    }));
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
    <div className="min-h-screen bg-background p-4">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">{config.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.headerFields.map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'dropdown' ? (
                  <select
                    name={field.name}
                    value={header[field.name] || ''}
                    onChange={handleHeaderChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required={field.required}
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required={field.required}
                  />
                ) : field.type === 'dynamicArray' ? (
                  <div className="space-y-2">
                    {header[field.name].map((item, index) => (
                      <div key={index} className="flex gap-2">
                        {field.subFields.map((subField) => (
                          <input
                            key={subField.name}
                            type={subField.type === 'number' ? 'number' : 'text'}
                            placeholder={subField.label}
                            value={item[subField.name] || ''}
                            onChange={(e) => {
                              const newItems = [...header[field.name]];
                              newItems[index] = {
                                ...newItems[index],
                                [subField.name]: e.target.value
                              };
                              setHeader({ ...header, [field.name]: newItems });
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = header[field.name].filter((_, i) => i !== index);
                            setHeader({ ...header, [field.name]: newItems });
                          }}
                          className="mt-1 p-1 text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setHeader({
                          ...header,
                          [field.name]: [...header[field.name], { location: '', rain: '', snow: '' }]
                        });
                      }}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add {field.label}
                    </button>
                  </div>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    name={field.name}
                    value={header[field.name] || ''}
                    onChange={handleHeaderChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Sections */}
        {sections && sections.length > 0 && sections.map((section) => (
          <div key={section.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{section.name}</h3>
              <button
                type="button"
                onClick={() => handleAddRow(section.name)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {config.dynamicSections
                      .find(s => s.name === section.name)
                      ?.fields?.map((field) => (
                        <th
                          key={field.name}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {field.label}
                        </th>
                      ))}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {section.rows?.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {config.dynamicSections
                        .find(s => s.name === section.name)
                        ?.fields?.map((field) => (
                          <td key={field.name} className="px-6 py-4 whitespace-nowrap">
                            {field.type === 'dropdown' ? (
                              <select
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                              >
                                <option value="">Select {field.label}</option>
                                {field.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === 'multiline' ? (
                              <textarea
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                rows={3}
                              />
                            ) : (
                              <input
                                type="text"
                                value={row[field.name] || ''}
                                onChange={(e) => handleSectionChange(section.name, rowIndex, field.name, e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                              />
                            )}
                          </td>
                        ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(section.name, rowIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">{config.summarySectionTitle || 'Summary'}</h3>
          <div className="space-y-4">
            {config.summaryFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <textarea
                  value={summaries[field.name] || ''}
                  onChange={(e) => handleSummaryChange(field.name, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  rows={4}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Signature Section */}
        {config.requiresSignature && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Signature</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prepared By
                </label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                  className="mt-2 text-sm text-red-500 hover:text-red-700"
                >
                  Clear Signature
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={sigDate ? format(sigDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setSigDate(new Date(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Photo Section */}
        {config.requiresPhotos && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Photos</h3>
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
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleExit}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Exit
          </button>
          {draftId && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={handleReview}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Review
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

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
    headerFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string,
        required: PropTypes.bool,
        options: PropTypes.arrayOf(PropTypes.string)
      })
    ).isRequired,
    dynamicSections: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        fields: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            type: PropTypes.string
          })
        ).isRequired,
        defaultRow: PropTypes.func.isRequired
      })
    ).isRequired,
    summaryFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        multiline: PropTypes.bool
      })
    ).isRequired,
    requiresSignature: PropTypes.bool,
    requiresPhotos: PropTypes.bool
  }).isRequired,
  initialData: PropTypes.shape({
    header: PropTypes.object,
    sections: PropTypes.array,
    summaries: PropTypes.object,
    preparedBy: PropTypes.string,
    signature: PropTypes.string,
    sigDate: PropTypes.string,
    photos: PropTypes.array,
    id: PropTypes.string
  }),
  onSave: PropTypes.func
};

export default ReportTemplate; 