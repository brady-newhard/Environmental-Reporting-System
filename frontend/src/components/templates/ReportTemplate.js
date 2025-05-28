import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
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
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PhotoCamera, Save as SaveIcon, Visibility as VisibilityIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import PageHeader from '../common/PageHeader';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import ReportPhotoSection from '../common/ReportPhotoSection';
import axios from '../../utils/axios';
import { message } from 'antd';
import { uploadPhoto } from '../../utils/photoUtils';
import { getDraft, saveDraft } from '../../utils/draftUtils';
import { useAuth } from '../../contexts/AuthContext';

console.log('ReportTemplate loaded');

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
      // Initialize rain_gauges as an empty array if it's a dynamicArray type
      if (field.type === 'dynamicArray') {
        return { ...acc, [field.name]: [] };
      }
      return { ...acc, [field.name]: '' };
    }, { date: null, reportNo: 'Pending' });
    
    // If we have initialData, merge it with defaultHeader, ensuring rain_gauges is an array
    if (initialData?.header) {
      const mergedHeader = { ...defaultHeader, ...initialData.header };
      // Ensure rain_gauges is an array
      if (config.headerFields.some(field => field.type === 'dynamicArray')) {
        config.headerFields.forEach(field => {
          if (field.type === 'dynamicArray') {
            mergedHeader[field.name] = Array.isArray(mergedHeader[field.name]) 
              ? mergedHeader[field.name] 
              : [];
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Update state when initialData changes
  useEffect(() => {
    if (!initialData) return;
    
    console.log('ReportTemplate initialData changed:', initialData);
    
    // Update header with default values for required fields
    const defaultHeader = config.headerFields.reduce((acc, field) => {
      // Initialize rain_gauges as an empty array if it's a dynamicArray type
      if (field.type === 'dynamicArray') {
        return { ...acc, [field.name]: [] };
      }
      return { ...acc, [field.name]: '' };
    }, { date: null, reportNo: 'Pending' });

    const updatedHeader = {
      ...defaultHeader,
      ...initialData.header
    };
    console.log('Updated header:', updatedHeader);
    setHeader(updatedHeader);

    // Update sections
    if (initialData.sections) {
      const updatedSections = initialData.sections.map(section => ({
        ...section,
        rows: section.rows && section.rows.length > 0 ? section.rows : [section.defaultRow ? section.defaultRow() : {}]
      }));
      console.log('Updated sections:', updatedSections);
      setSections(updatedSections);
    }

    // Update summaries
    if (initialData.summaries) {
      const updatedSummaries = {
        ...summaries,
        ...initialData.summaries
      };
      console.log('Updated summaries:', updatedSummaries);
      setSummaries(updatedSummaries);
    }

    // Update other fields
    if (initialData.preparedBy) setPreparedBy(initialData.preparedBy);
    if (initialData.signature) setSignature(initialData.signature);
    if (initialData.sigDate) setSigDate(new Date(initialData.sigDate));
    if (initialData.photos) setPhotos(initialData.photos);
    if (initialData.id) setDraftId(initialData.id);
  }, [initialData]);

  // Initialize state with default values from config
  useEffect(() => {
    if (!initialData) {
      const defaultHeader = config.headerFields.reduce((acc, field) => {
        // Initialize rain_gauges as an empty array if it's a dynamicArray type
        if (field.type === 'dynamicArray') {
          return { ...acc, [field.name]: [] };
        }
        return { ...acc, [field.name]: '' };
      }, { date: null, reportNo: 'Pending' });
      setHeader(defaultHeader);

      const defaultSections = config.dynamicSections.map(section => ({
        name: section.name,
        rows: [section.defaultRow()]
      }));
      setSections(defaultSections);

      const defaultSummaries = config.summaryFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {});
      setSummaries(defaultSummaries);
    }
  }, []);

  // DEBUG: Log state on every render
  useEffect(() => {
  console.log('ReportTemplate state:', {
    header,
    sections,
    summaries,
    preparedBy,
    signature,
    sigDate,
    photos,
    draftId
  });
  }, [header, sections, summaries, preparedBy, signature, sigDate, photos, draftId]);

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
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (typeof onSave === 'function') {
      onSave({
        header,
        sections,
        summaries,
        photos,
        signature,
        sigDate,
        id: draftId,
      });
    }
  };
  const handleSave = async () => {
    console.log('Save button clicked');
    console.log('onSave prop:', onSave);
    if (typeof onSave !== 'function') {
      console.error('onSave prop is not a function:', onSave);
      enqueueSnackbar('Error: Save functionality not available', { variant: 'error' });
      return;
    }

    try {
      console.log('Starting save operation...');
      setLoading(true);
      const formData = {
        header,
        sections,
        summaries,
        photos,
        signature,
        sigDate,
        preparedBy,
        id: draftId,
      };
      console.log('Saving form data:', formData);
      const savedId = await onSave(formData);
      console.log('Save operation completed successfully');
      
      // Update local state with the saved data
      if (savedId) {
        setDraftId(savedId);
        // Don't reset the form data since we want to keep the current values
        enqueueSnackbar('Draft saved successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      enqueueSnackbar('Error saving draft: ' + (error.message || 'Unknown error'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === 'preparedBy') {
      setPreparedBy(value);
    } else if (field === 'sigDate') {
      setSigDate(value);
    }
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

  const handleDelete = async () => {
    if (!id) return;
    try {
      await axios.delete(`/api/drafts/${id}/`);
      message.success('Draft deleted successfully');
      setDraftId(null);
      navigate(`/${config.reportType}/drafts`);
    } catch (error) {
      console.error('Error deleting draft:', error);
      message.error('Failed to delete draft');
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
        id: draftId,
      };
      // Store in localStorage for backup
      const localKey = `${config.reportType}_draft_${draftId}`;
      localStorage.setItem(localKey, JSON.stringify(reviewData));
      
      navigate(`${config.reviewPath}/${draftId}`, {
        state: { formData: reviewData }
      });
    }
  };

  const handleExit = () => {
    const shouldSave = window.confirm('Do you want to save your changes before exiting? Click OK to save, or Cancel to exit without saving.');
    if (shouldSave) {
      handleSave();
    }
    navigate(-1);
  };

  return (
    <Box sx={{ width: { xs: '100%', sm: '100%' }, maxWidth: { xs: '100%', sm: 1400 }, mx: 0, px: { xs: 1, sm: 2 }, py: 3, mt: 1, mb: 1, pb: { xs: 6, sm: 6 }, bgcolor: '#f5f5f5', borderRadius: 2, overflowX: 'hidden', boxSizing: 'border-box' }}>
        <PageHeader
          title={config.title}
          backPath={`/${config.reportType}/reports`}
          backButtonStyle={{ backgroundColor: '#000000', color: '#ffffff', '&:hover': { backgroundColor: '#333333' } }}
        />
      <Paper sx={{ width: '100%', boxShadow: 'none', p: 0, bgcolor: 'transparent' }}>
          <FormControl component="form" onSubmit={handleFormSubmit} layout="vertical">
          <Grid container spacing={3} direction="column">
            {/* Project Information Section */}
            <Grid item xs={12} sx={{ mx: { xs: 0, sm: 1 }, mt: 2 }}>
              <Card sx={{ width: { xs: 'calc(100% - 8px)', sm: '100%' }, ml: { xs: 'auto', sm: 0 }, mr: { xs: 'auto', sm: 0 }, p: 0, boxSizing: 'border-box', overflowX: { xs: 'hidden', sm: 'visible' }, boxShadow: 'none', borderRadius: { xs: 0, sm: 2 }, bgcolor: '#fff' }}>
                <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Project Information</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
                        value={header[field.name] || ''}
                        onChange={(e) => {
                          handleChange(field.name, e.target.value);
                          handleHeaderChange(e);
                        }}
                        required={field.required}
                        fullWidth
                        variant="outlined"
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
                        value={header.date ? new Date(header.date) : null}
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
            </Grid>

            {/* Weather Information Section (Rain Gauge Data INSIDE) */}
            <Grid item xs={12} sx={{ mx: { xs: 0, sm: 1 } }}>
              <Card sx={{ width: { xs: 'calc(100% - 8px)', sm: '100%' }, ml: { xs: 'auto', sm: 0 }, mr: { xs: 'auto', sm: 0 }, p: 0, boxSizing: 'border-box', overflowX: { xs: 'hidden', sm: 'visible' }, boxShadow: 'none', borderRadius: { xs: 0, sm: 2 }, bgcolor: '#fff' }}>
                <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Weather Information</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
                            value={header[field.name] || ''}
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
                          value={header[field.name] || ''}
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
                  {rainGaugeField && rainGaugeField.subFields && (
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
                            <Box sx={{ fontSize: 42 }}><DeleteIcon sx={{ fontSize: 'inherit' }} /></Box>
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
                        startIcon={<Box sx={{ fontSize: 42 }}><AddIcon sx={{ fontSize: 'inherit' }} /></Box>}
                        sx={{ width: '200px', alignSelf: 'center', borderColor: 'primary.main', '&:hover': { borderColor: 'primary.dark' } }}
                      >
                        Add Rain Gage
                      </Button>
                    </Box>
                  </Paper>
                )}
              </CardContent>
            </Card>
            </Grid>

            {/* Environmental Summary Section */}
            <Grid item xs={12} sx={{ mx: { xs: 0, sm: 1 } }}>
              <Card sx={{ width: { xs: 'calc(100% - 8px)', sm: '100%' }, ml: { xs: 'auto', sm: 0 }, mr: { xs: 'auto', sm: 0 }, p: 0, boxSizing: 'border-box', overflowX: { xs: 'hidden', sm: 'visible' }, boxShadow: 'none', borderRadius: { xs: 0, sm: 2 }, bgcolor: '#fff' }}>
                <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{config.summarySectionTitle || 'Summaries'}</Typography>
                <Stack spacing={2}>
                  {config.summaryFields.map(field => (
                      <TextField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        value={summaries[field.name] || ''}
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
            </Grid>

            {/* Crew Daily Summaries Section */}
            {sections.map(section => {
              if (section.name !== 'Crew Daily Summaries') return null;
              const sectionConfig = config.dynamicSections.find(s => s.name === section.name);
              if (!sectionConfig) return null;
              return (
                <Grid item xs={12} sx={{ mx: { xs: 0, sm: 1 }, mt: { xs: 0.5, sm: 2 } }} key={section.name}>
                  <Card sx={{ width: { xs: 'calc(100% - 8px)', sm: '100%' }, ml: { xs: 'auto', sm: 0 }, mr: { xs: 'auto', sm: 0 }, p: 0, boxSizing: 'border-box', overflowX: { xs: 'hidden', sm: 'visible' }, boxShadow: 'none', borderRadius: { xs: 0, sm: 2 }, bgcolor: '#fff' }}>
                    <CardContent sx={{ p: 2, width: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>{section.name}</Typography>
                      {section.rows.map((row, rowIndex) => (
                        <Paper key={rowIndex} sx={{ p: 2, mb: 2, position: 'relative', width: '100%', bgcolor: '#f5f5f5' }}>
                          <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 2, width: '100%', minWidth: 0 }}>
                            {sectionConfig.fields.filter(f => f.name !== 'Summary').map(fieldConfig => (
                              <Box
                                key={fieldConfig.name}
                                sx={{
                                  flex: { xs: '1 1 100%', sm: '1 1 25%' },
                                  minWidth: 0,
                                  maxWidth: { xs: '100%', sm: '25%' }
                                }}
                              >
                                <TextField
                                  label={fieldConfig.label}
                                  name={fieldConfig.name}
                                  value={row[fieldConfig.name] || ''}
                                  onChange={e => handleSectionChange(section.name, rowIndex, fieldConfig.name, e.target.value)}
                                  fullWidth
                                  sx={{ bgcolor: '#fff' }}
                                />
                              </Box>
                            ))}
                          </Box>
                          <Box sx={{ width: '100%', mt: 2 }}>
                            <TextField
                              label="Summary"
                              name="Summary"
                              value={row['Summary'] || ''}
                              onChange={e => handleSectionChange(section.name, rowIndex, 'Summary', e.target.value)}
                              fullWidth
                              multiline
                              minRows={2}
                              sx={{ bgcolor: '#fff' }}
                            />
                          </Box>
                          {section.rows.length > 1 && (
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, mt: 1 }}>
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveRow(section.name, rowIndex)}
                                aria-label={`Remove ${section.name} row`}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )}
                        </Paper>
                      ))}
                      <Button startIcon={<Box sx={{ fontSize: 42 }}><AddIcon sx={{ fontSize: 'inherit' }} /></Box>} onClick={() => handleAddRow(section.name)}>
                        Add Row
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}

            {/* Daily Progress Section */}
            {sections.map(section => {
              if (section.name !== 'Daily Progress') return null;
              const sectionConfig = config.dynamicSections.find(s => s.name === section.name);
              if (!sectionConfig) return null;
              return (
                <Grid item xs={12} sx={{ mx: { xs: 0, sm: 1 }, mt: 2 }} key={section.name}>
                  <Card sx={{ width: { xs: 'calc(100% - 8px)', sm: '100%' }, ml: { xs: 'auto', sm: 0 }, mr: { xs: 'auto', sm: 0 }, p: 0, boxSizing: 'border-box', overflowX: { xs: 'hidden', sm: 'visible' }, boxShadow: 'none', borderRadius: { xs: 0, sm: 2 }, bgcolor: '#fff' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>{section.name}</Typography>
                      {section.rows.map((row, rowIndex) => (
                        <Paper key={rowIndex} sx={{ p: 2, mb: 2, position: 'relative', width: '100%', bgcolor: '#f5f5f5' }}>
                          <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 2, width: '100%', minWidth: 0 }}>
                            {sectionConfig.fields.map(fieldConfig => (
                              <Box
                                key={fieldConfig.name}
                                sx={{
                                  flex: { xs: '1 1 100%', sm: '1 1 33.33%' },
                                  minWidth: 0,
                                  maxWidth: { xs: '100%', sm: '33.33%' }
                                }}
                              >
                              <TextField
                                label={fieldConfig.label}
                                name={fieldConfig.name}
                                value={row[fieldConfig.name] || ''}
                                onChange={e => handleSectionChange(section.name, rowIndex, fieldConfig.name, e.target.value)}
                                fullWidth
                                sx={{ bgcolor: '#fff' }}
                              />
                            </Box>
                          ))}
                            {/* Delete button for row */}
                            {section.rows.length > 1 && (
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveRow(section.name, rowIndex)}
                                sx={{ alignSelf: 'center', ml: 1 }}
                                aria-label={`Remove ${section.name} row`}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        </Paper>
                      ))}
                      <Button startIcon={<Box sx={{ fontSize: 42 }}><AddIcon sx={{ fontSize: 'inherit' }} /></Box>} onClick={() => handleAddRow(section.name)}>
                        Add Row
                      </Button>
                  </CardContent>
                </Card>
                </Grid>
              );
            })}

            {/* Signature Section */}
            {config.requiresSignature && (
              <Grid item xs={12} sx={{ mx: { xs: 0, sm: 1 }, mt: 2 }}>
                <Card sx={{ width: { xs: 'calc(100% - 8px)', sm: '100%' }, ml: { xs: 'auto', sm: 0 }, mr: { xs: 'auto', sm: 0 }, p: 0, boxSizing: 'border-box', overflowX: { xs: 'hidden', sm: 'visible' }, boxShadow: 'none', borderRadius: { xs: 0, sm: 2 }, bgcolor: '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Inspector Signature</Typography>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        flex: { xs: '1 1 100%', sm: '1 1 48%' },
                        minWidth: { xs: '100%', sm: '48%' },
                        maxWidth: { xs: '100%', sm: '48%' },
                        mb: 2,
                      }}
                    >
                      <TextField
                        label="Inspector/Report Prepared by"
                        name="preparedBy"
                          value={preparedBy}
                          onChange={(e) => handleChange('preparedBy', e.target.value)}
                        fullWidth
                        sx={{ bgcolor: '#fff' }}
                      />
                    </Box>
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
                          name="sigDate"
                            value={sigDate}
                            onChange={(date) => handleChange('sigDate', date)}
                          slotProps={{ textField: { fullWidth: true, sx: { bgcolor: '#fff' } } }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              </Grid>
            )}

            {/* Photo Section */}
            {config.requiresPhotos && (
              <Grid item xs={12} sx={{ mx: { xs: 0, sm: 1 }, mt: 2 }}>
                <Card sx={{ width: { xs: 'calc(100% - 8px)', sm: '100%' }, ml: { xs: 'auto', sm: 0 }, mr: { xs: 'auto', sm: 0 }, p: 0, boxSizing: 'border-box', overflowX: { xs: 'hidden', sm: 'visible' }, boxShadow: 'none', borderRadius: { xs: 0, sm: 2 }, bgcolor: '#fff' }}>
                  <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Photos</Typography>
                  <ReportPhotoSection photos={photos} onPhotosChange={setPhotos} editable={true} />
                </CardContent>
              </Card>
              </Grid>
            )}

            {/* Action Buttons at the bottom */}
            <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 3,
              px: { xs: 3, sm: 4 },
              pb: { xs: 2, sm: 3 }
            }}>
              <Button
                variant={isMobile ? "text" : "contained"}
                color={isMobile ? "success" : "primary"}
                onClick={handleSave}
                disabled={loading}
                sx={{ 
                  minWidth: isMobile ? 40 : 120,
                  height: isMobile ? 40 : 48,
                  p: isMobile ? 0 : 1
                }}
              >
                <SaveIcon sx={{ fontSize: 42, mr: !isMobile ? 1 : 0 }} />
                {!isMobile && 'Save'}
              </Button>
              {id && (
                <>
                  <Button
                    variant={isMobile ? "text" : "contained"}
                    color="error"
                    onClick={handleDelete}
                    sx={{ 
                      minWidth: isMobile ? 40 : 120,
                      height: isMobile ? 40 : 48,
                      p: isMobile ? 0 : 1
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 42, mr: !isMobile ? 1 : 0 }} />
                    {!isMobile && 'Delete'}
                  </Button>
                  {draftId && (
                    <Button
                      variant={isMobile ? "text" : "contained"}
                      color={isMobile ? "info" : "primary"}
                      onClick={handleReview}
                      sx={{ 
                        minWidth: isMobile ? 40 : 120,
                        height: isMobile ? 40 : 48,
                        p: isMobile ? 0 : 1
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: 42, mr: !isMobile ? 1 : 0 }} />
                      {!isMobile && 'Review'}
                    </Button>
                  )}
                </>
              )}
              <Button
                variant={isMobile ? "text" : "contained"}
                color="secondary"
                onClick={handleExit}
                sx={{ 
                  minWidth: isMobile ? 40 : 120,
                  height: isMobile ? 40 : 48,
                  p: isMobile ? 0 : 1
                }}
              >
                <CloseIcon sx={{ fontSize: 42, mr: !isMobile ? 1 : 0 }} />
                {!isMobile && 'Exit'}
              </Button>
            </Box>
            </Grid>
          </Grid>
          </FormControl>
        </Paper>
    </Box>
  );
};

ReportTemplate.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string.isRequired,
    reportType: PropTypes.string.isRequired,
    headerFields: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      required: PropTypes.bool
    })).isRequired,
    dynamicSections: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      dropdownLabel: PropTypes.string,
      dropdownName: PropTypes.string,
      dropdownOptions: PropTypes.arrayOf(PropTypes.string),
      fields: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        type: PropTypes.string
      })).isRequired,
      defaultRow: PropTypes.func.isRequired
    })).isRequired,
    summaryFields: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      multiline: PropTypes.bool
    })).isRequired,
    requiresSignature: PropTypes.bool,
    requiresPhotos: PropTypes.bool,
    reviewPath: PropTypes.string,
    editPath: PropTypes.string
  }),
  initialData: PropTypes.shape({
    header: PropTypes.object,
    sections: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      rows: PropTypes.arrayOf(PropTypes.object).isRequired
    })),
    summaries: PropTypes.object,
    photos: PropTypes.array,
    signature: PropTypes.string,
    sigDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    preparedBy: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onSave: PropTypes.func.isRequired
};

export default ReportTemplate; 