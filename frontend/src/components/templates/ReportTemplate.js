import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Card,
  CardContent,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PhotoCamera, Save as SaveIcon, Visibility as VisibilityIcon, ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import PageHeader from '../common/PageHeader';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';

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

const ReportTemplate = ({ config = defaultConfig }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const sigPadRef = useRef();
  
  // State management
  const [header, setHeader] = useState(
    config.headerFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), { date: null, reportNo: 'Pending' })
  );
  const [sections, setSections] = useState(
    config.dynamicSections.map(section => ({
      name: section.name,
      rows: [section.defaultRow()]
    }))
  );
  const [summaries, setSummaries] = useState(
    config.summaryFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );
  const [preparedBy, setPreparedBy] = useState('');
  const [signature, setSignature] = useState('');
  const [sigDate, setSigDate] = useState('');
  const [signing, setSigning] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({});
  const [draftId, setDraftId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Check for draftId in URL
    const params = new URLSearchParams(location.search);
    const urlDraftId = params.get('draftId');
    
    // Check for draft data in location state
    const stateDraft = location.state?.formData;

    if (urlDraftId) {
      // Load draft from localStorage
      const draft = localStorage.getItem(`${config.reportType}_draft_${urlDraftId}`);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setFormData(parsedDraft);
        setDraftId(urlDraftId);
        // Initialize form fields with draft data
        setHeader(parsedDraft.header || {});
        setSections(parsedDraft.sections || []);
        setSummaries(parsedDraft.summaries || {});
        setPreparedBy(parsedDraft.preparedBy || '');
        setSignature(parsedDraft.signature || '');
        setSigDate(parsedDraft.sigDate || '');
        setPhotos(parsedDraft.photos || []);
      }
    } else if (stateDraft) {
      // Use draft from navigation state
      setFormData(stateDraft);
      setDraftId(stateDraft.id?.replace(`${config.reportType}_draft_`, ''));
      // Initialize form fields with draft data
      setHeader(stateDraft.header || {});
      setSections(stateDraft.sections || []);
      setSummaries(stateDraft.summaries || {});
      setPreparedBy(stateDraft.preparedBy || '');
      setSignature(stateDraft.signature || '');
      setSigDate(stateDraft.sigDate || '');
      setPhotos(stateDraft.photos || []);
    }
  }, [location, config.reportType]);

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
        rows: section.rows.length > 1 
          ? section.rows.filter((_, idx) => idx !== rowIndex)
          : section.rows
      };
    }));
  };
  const handleSummaryChange = (field, value) => {
    setSummaries({ ...summaries, [field]: value });
  };
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos([...photos, ...files]);
  };
  const handleClearSignature = () => {
    sigPadRef.current?.clear();
    setSignature('');
  };
  const handleSaveDraft = () => {
    const id = draftId || Date.now().toString();
    const draftData = {
      header,
      sections,
      summaries,
      preparedBy,
      signature,
      sigDate,
      photos,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`${config.reportType}_draft_${id}`, JSON.stringify(draftData));
    setDraftId(id);
    enqueueSnackbar('Draft saved successfully', { variant: 'success' });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', { header, sections, summaries, preparedBy, signature, sigDate, photos });
  };

  // Project fields for the Project Information section (custom order)
  const projectFieldNames = [
    'project',
    'date',
    'contractor',
    'spread',
    'facility',
    'inspector',
    'milepost_start',
    'milepost_end',
    'station_start',
    'station_end'
  ];
  const projectFields = config.headerFields.filter(f => projectFieldNames.includes(f.name));
  const weatherFieldNames = [
    'weather_conditions',
    'temperature',
    'precipitation_type',
    'soil_conditions'
  ];
  const weatherFields = config.headerFields.filter(f => weatherFieldNames.includes(f.name));
  const rainGaugeField = config.headerFields.find(f => f.name === 'rain_gauges');
  const additionalCommentsField = config.headerFields.find(f => f.name === 'additional_comments');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = () => {
    if (draftId) {
      const shouldDelete = window.confirm('Are you sure you want to delete this draft? This action cannot be undone.');
      if (shouldDelete) {
        localStorage.removeItem(`${config.reportType}_draft_${draftId}`);
        setDraftId(null);
        setFormData({});
        enqueueSnackbar('Draft deleted successfully', { variant: 'success' });
        navigate(`/${config.reportType}/reports`);
      }
    }
  };

  const handleReview = () => {
    if (draftId) {
      const reviewData = {
        header,
        sections,
        summaries,
        preparedBy,
        signature,
        sigDate,
        photos,
        id: `${config.reportType}_draft_${draftId}`,
      };
      navigate(`${config.reviewPath}/${draftId}`, {
        state: { formData: reviewData }
      });
    }
  };

  const handleExit = () => {
    const shouldSave = window.confirm('Do you want to save your changes before exiting? Click OK to save, or Cancel to exit without saving.');
    if (shouldSave) {
      handleSaveDraft();
    }
    navigate(-1);
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <PageHeader
          title={config.title}
          backPath={`/${config.reportType}/reports`}
          backButtonStyle={{ backgroundColor: '#000000', color: '#ffffff', '&:hover': { backgroundColor: '#333333' } }}
        />
        <Paper sx={{ mt: 2, p: { xs: 1, sm: 3 } }}>
          <form onSubmit={handleSubmit}>
            {/* Header Section */}
            <Card sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Project Information</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  {projectFields.map((field, index) => (
                    <Box
                      key={field.name}
                      sx={{
                        flex: { xs: '1 1 100%', sm: '1 1 48%' },
                        minWidth: { xs: '100%', sm: '48%' },
                        maxWidth: { xs: '100%', sm: '48%' },
                        mb: 2,
                      }}
                    >
                      <TextField
                        label={field.label}
                        name={field.name}
                        value={formData[field.name] || header[field.name]}
                        onChange={(e) => {
                          handleChange(field.name, e.target.value);
                          handleHeaderChange(e);
                        }}
                        required={field.required}
                        fullWidth
                        sx={{ bgcolor: '#fff' }}
                      />
                    </Box>
                  ))}
                  <Box
                    sx={{
                      flex: { xs: '1 1 100%', sm: '1 1 48%' },
                      minWidth: { xs: '100%', sm: '48%' },
                      maxWidth: { xs: '100%', sm: '48%' },
                      mb: 2,
                    }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date"
                        value={formData.date || header.date || null}
                        onChange={(date) => {
                          handleChange('date', date);
                          handleHeaderChange({ target: { name: 'date', value: date } });
                        }}
                        slotProps={{ textField: { fullWidth: true, sx: { bgcolor: '#fff' } } }}
                      />
                    </LocalizationProvider>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            {/* Weather Section */}
            <Card sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Weather Information</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  {weatherFields.map((field, index) => (
                    <Box
                      key={field.name}
                      sx={{
                        flex: { xs: '1 1 100%', sm: '1 1 48%' },
                        minWidth: { xs: '100%', sm: '48%' },
                        maxWidth: { xs: '100%', sm: '48%' },
                        mb: 2,
                      }}
                    >
                      {field.type === 'dropdown' ? (
                        <FormControl fullWidth variant="outlined" sx={{ bgcolor: '#fff' }}>
                          <InputLabel>{field.label}</InputLabel>
                          <Select
                            label={field.label}
                            name={field.name}
                            value={formData[field.name] || header[field.name] || ''}
                            onChange={(e) => {
                              handleChange(field.name, e.target.value);
                              handleHeaderChange(e);
                            }}
                            required={field.required}
                          >
                            <MenuItem value="" disabled>
                              <em>Select {field.label}</em>
                            </MenuItem>
                            {field.options.map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          label={field.label}
                          name={field.name}
                          type={field.type || 'text'}
                          value={formData[field.name] || header[field.name] || ''}
                          onChange={(e) => {
                            handleChange(field.name, e.target.value);
                            handleHeaderChange(e);
                          }}
                          required={field.required}
                          fullWidth
                          sx={{ bgcolor: '#fff' }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
                {/* Rain Gauges dynamic array */}
                {rainGaugeField && (
                  <Paper sx={{ p: 2, bgcolor: '#f8f8f8', borderRadius: 1, mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>Rain Gauge Data</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {(header[rainGaugeField.name] || [{ location: '', rain: '', snow: '' }]).map((row, idx) => (
                        <Box key={idx} sx={{ display: { xs: 'block', sm: 'flex' }, gap: 2, alignItems: 'center', width: '100%', bgcolor: 'transparent', p: 0, borderRadius: 0 }}>
                          {rainGaugeField.subFields.map(subField => (
                            <TextField
                              key={subField.name}
                              label={subField.label}
                              name={subField.name}
                              type={subField.type || 'text'}
                              value={row[subField.name] || ''}
                              onChange={e => {
                                const updatedRows = (header[rainGaugeField.name] || [{ location: '', rain: '', snow: '' }]).map((r, i) =>
                                  i === idx ? { ...r, [subField.name]: e.target.value } : r
                                );
                                setHeader({ ...header, [rainGaugeField.name]: updatedRows });
                              }}
                              size="small"
                              fullWidth
                              sx={{
                                bgcolor: '#fff',
                                flex: {
                                  xs: '1 1 100%',
                                  sm: subField.name === 'location' ? 2 : 1
                                },
                                minWidth: 0,
                                mb: { xs: 2, sm: 0 }
                              }}
                            />
                          ))}
                          <IconButton
                            color="error"
                            onClick={() => {
                              const updatedRows = (header[rainGaugeField.name] || [{ location: '', rain: '', snow: '' }]).filter((_, i) => i !== idx);
                              setHeader({ ...header, [rainGaugeField.name]: updatedRows.length ? updatedRows : [{ location: '', rain: '', snow: '' }] });
                            }}
                            disabled={(header[rainGaugeField.name] || [{ location: '', rain: '', snow: '' }]).length === 1}
                            sx={{ ml: 1 }}
                            aria-label="Remove Rain Gauge"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        onClick={() => {
                          const updatedRows = [...(header[rainGaugeField.name] || [{ location: '', rain: '', snow: '' }]), { location: '', rain: '', snow: '' }];
                          setHeader({ ...header, [rainGaugeField.name]: updatedRows });
                        }}
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        sx={{ width: '200px', alignSelf: 'center', borderColor: 'primary.main', '&:hover': { borderColor: 'primary.dark' } }}
                      >
                        Add Rain Gage
                      </Button>
                    </Box>
                  </Paper>
                )}
              </CardContent>
            </Card>

            {/* Summary Section */}
            <Card sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{config.summarySectionTitle || 'Summaries'}</Typography>
                <Stack spacing={2}>
                  {config.summaryFields.map(field => (
                    <TextField
                      key={field.name}
                      label={field.label}
                      value={summaries[field.name] || formData[field.name]}
                      onChange={(e) => handleSummaryChange(field.name, e.target.value)}
                      multiline={field.multiline}
                      rows={field.multiline ? 2 : 1}
                      fullWidth
                      sx={{ bgcolor: '#fff' }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Dynamic Sections (restored) */}
            {sections.map(section => {
              // Find the section config for field definitions and dropdown options
              const sectionConfig = config.dynamicSections.find(s => s.name === section.name);
              if (!sectionConfig) {
                console.warn(`Section config not found for section: ${section.name}`);
                return null;
              }
              return (
                <Card key={section.name} sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>{section.name}</Typography>
                    <Stack spacing={2}>
                      {section.rows.map((row, rowIndex) => (
                        <Paper key={rowIndex} sx={{ p: 2, position: 'relative' }}>
                          <Box
                            sx={{
                              display: { xs: 'block', sm: 'flex' },
                              alignItems: 'center',
                              gap: 2,
                              width: '100%'
                            }}
                          >
                            {/* Render non-multiline fields in the row */}
                            {(sectionConfig.fields || []).filter(f => f.type !== 'multiline').map((fieldConfig, idx) => {
                              // Crew dropdown with 'Other' logic
                              if (fieldConfig.name === 'Crew') {
                                const isOther = row['Crew'] === 'Other';
                                return (
                                  <Box key={fieldConfig.name} sx={{ flex: 1, minWidth: 0, mb: { xs: 2, sm: 0 } }}>
                                    {isOther ? (
                                      <TextField
                                        label="Custom Crew/Duty"
                                        value={row['CustomCrew'] || ''}
                                        onChange={e => handleSectionChange(section.name, rowIndex, 'CustomCrew', e.target.value)}
                                        fullWidth
                                        sx={{ bgcolor: '#fff' }}
                                      />
                                    ) : (
                                      <FormControl fullWidth variant="outlined" sx={{ bgcolor: '#fff' }}>
                                        <InputLabel>{fieldConfig.label}</InputLabel>
                                        <Select
                                          label={fieldConfig.label}
                                          value={row[fieldConfig.name] || ''}
                                          onChange={e => handleSectionChange(section.name, rowIndex, fieldConfig.name, e.target.value)}
                                        >
                                          <MenuItem value="" disabled>
                                            <em>Select {fieldConfig.label}</em>
                                          </MenuItem>
                                          {sectionConfig.dropdownOptions && sectionConfig.dropdownOptions.map(option => (
                                            <MenuItem key={option} value={option}>{option}</MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    )}
                                  </Box>
                                );
                              }
                              // Standard dropdown or text field
                              return (
                                <Box key={fieldConfig.name} sx={{ flex: 1, minWidth: 0, mb: { xs: 2, sm: 0 } }}>
                                  {fieldConfig.type === 'dropdown' ? (
                                    <FormControl fullWidth variant="outlined" sx={{ bgcolor: '#fff' }}>
                                      <InputLabel>{fieldConfig.label}</InputLabel>
                                      <Select
                                        label={fieldConfig.label}
                                        value={row[fieldConfig.name] || ''}
                                        onChange={e => handleSectionChange(section.name, rowIndex, fieldConfig.name, e.target.value)}
                                      >
                                        <MenuItem value="" disabled>
                                          <em>Select {fieldConfig.label}</em>
                                        </MenuItem>
                                        {sectionConfig.dropdownOptions && sectionConfig.dropdownOptions.map(option => (
                                          <MenuItem key={option} value={option}>{option}</MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  ) : (
                                    <TextField
                                      label={fieldConfig.label}
                                      value={row[fieldConfig.name] || ''}
                                      onChange={e => handleSectionChange(section.name, rowIndex, fieldConfig.name, e.target.value)}
                                      fullWidth
                                      sx={{ bgcolor: '#fff' }}
                                    />
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                          {/* Render multiline fields below the row, always full width */}
                          {(sectionConfig.fields || []).filter(f => f.type === 'multiline').map(fieldConfig => (
                            <Box key={fieldConfig.name} sx={{ width: '100%', mt: 2 }}>
                              <TextField
                                label={fieldConfig.label}
                                value={row[fieldConfig.name] || ''}
                                onChange={e => handleSectionChange(section.name, rowIndex, fieldConfig.name, e.target.value)}
                                fullWidth
                                multiline
                                minRows={2}
                                sx={{ bgcolor: '#fff' }}
                              />
                            </Box>
                          ))}
                          {/* Move delete button here if this is Crew Daily Summaries */}
                          {section.name === 'Crew Daily Summaries' && (
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                              <IconButton
                                onClick={() => handleRemoveRow(section.name, rowIndex)}
                                sx={{ zIndex: 2, bgcolor: '#fff' }}
                                aria-label="Delete Crew Summary"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )}
                          {/* For other sections, keep delete button in the row */}
                          {section.name !== 'Crew Daily Summaries' && (
                            <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                              <IconButton
                                onClick={() => handleRemoveRow(section.name, rowIndex)}
                                sx={{ zIndex: 2, bgcolor: '#fff' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )}
                        </Paper>
                      ))}
                      <Button startIcon={<AddIcon />} onClick={() => handleAddRow(section.name)}>
                        Add Row
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}

            {/* Signature Section */}
            {config.requiresSignature && (
              <Card sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Inspector Signature</Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Inspector/Report Prepared by"
                      value={preparedBy || formData.preparedBy}
                      onChange={(e) => setPreparedBy(e.target.value)}
                      fullWidth
                      sx={{ bgcolor: '#fff' }}
                    />
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        bgcolor: '#fff',
                        position: 'relative'
                      }}
                    >
                      <SignaturePad
                        ref={sigPadRef}
                        canvasProps={{
                          width: '100%',
                          height: '100%',
                          className: 'signature-canvas'
                        }}
                        onEnd={() => setSignature(sigPadRef.current?.toDataURL())}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="outlined" onClick={handleClearSignature}>
                        Clear Signature
                      </Button>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Signature Date"
                          value={sigDate || formData.sigDate || null}
                          onChange={(date) => {
                            setSigDate(date);
                            handleChange('sigDate', date);
                          }}
                          slotProps={{ textField: { fullWidth: true, sx: { bgcolor: '#fff' } } }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Photo Section */}
            {config.requiresPhotos && (
              <Card sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Photos</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                  >
                    Upload Photos
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </Button>
                  {photos.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {photos.map((photo, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 100,
                            height: 100,
                            position: 'relative',
                            '& img': {
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 1
                            }
                          }}
                        >
                          <img
                            src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'white',
                              '&:hover': { bgcolor: 'white' }
                            }}
                            onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3, flexWrap: 'wrap' }}>
              <Tooltip title="Save Draft">
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveDraft}
                    sx={{ minWidth: isMobile ? 48 : 120, width: isMobile ? 48 : 'auto', height: 48, p: 0 }}
                    aria-label="Save Draft"
                  >
                    {!isMobile && 'Save'}
                  </Button>
                </span>
              </Tooltip>
              {draftId && (
                <>
                  <Tooltip title="Delete Draft">
                    <span>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDelete}
                        sx={{ minWidth: isMobile ? 48 : 120, width: isMobile ? 48 : 'auto', height: 48, p: 0 }}
                        aria-label="Delete"
                      >
                        {!isMobile && 'Delete'}
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title="Review Draft">
                    <span>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<VisibilityIcon />}
                        onClick={handleReview}
                        sx={{ minWidth: isMobile ? 48 : 120, width: isMobile ? 48 : 'auto', height: 48, p: 0 }}
                        aria-label="Review"
                      >
                        {!isMobile && 'Review'}
                      </Button>
                    </span>
                  </Tooltip>
                </>
              )}
              <Tooltip title="Exit">
                <span>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ExitToAppIcon />}
                    onClick={handleExit}
                    sx={{ minWidth: isMobile ? 48 : 120, width: isMobile ? 48 : 'auto', height: 48, p: 0 }}
                    aria-label="Exit"
                  >
                    {!isMobile && 'Exit'}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default ReportTemplate; 