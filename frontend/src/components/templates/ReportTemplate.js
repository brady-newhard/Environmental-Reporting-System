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
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PhotoCamera, Save as SaveIcon, Visibility as VisibilityIcon, ExitToApp as ExitToAppIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import PageHeader from '../common/PageHeader';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';

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
    { name: 'precipitation_inches', label: 'Precipitation Inches', required: false }
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    const draftId = `${config.reportType}_draft_${Date.now()}`;
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
    localStorage.setItem(draftId, JSON.stringify(draftData));
    setSnackbarOpen(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', { header, sections, summaries, preparedBy, signature, sigDate, photos });
  };

  // Filter header fields for project and weather
  const projectFields = config.headerFields.filter(f => !['weather_description','temperature','precipitation_type','precipitation_inches'].includes(f.name));
  const weatherFields = config.headerFields.filter(f => ['weather_description','temperature','precipitation_type','precipitation_inches'].includes(f.name));

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
                        value={header[field.name]}
                        onChange={handleHeaderChange}
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
                        value={header.date}
                        onChange={date => setHeader(h => ({ ...h, date }))}
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
                      <TextField
                        label={field.label}
                        name={field.name}
                        value={header[field.name]}
                        onChange={handleHeaderChange}
                        required={field.required}
                        fullWidth
                        sx={{ bgcolor: '#fff' }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Dynamic Sections */}
            {sections.map(section => (
              <Card key={section.name} sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>{section.name}</Typography>
                  <Stack spacing={2}>
                    {section.rows.map((row, rowIndex) => (
                      <Paper key={rowIndex} sx={{ p: 2, position: 'relative' }}>
                        <Grid container spacing={2}>
                          {Object.keys(row).map(field => (
                            <Grid item xs={12} sm={6} md={4} key={field}>
                              <TextField
                                label={field}
                                value={row[field]}
                                onChange={e => handleSectionChange(section.name, rowIndex, field, e.target.value)}
                                fullWidth
                                sx={{ bgcolor: '#fff' }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                        <IconButton
                          onClick={() => handleRemoveRow(section.name, rowIndex)}
                          sx={{ position: 'absolute', bottom: 8, right: 8 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    ))}
                    <Button startIcon={<AddIcon />} onClick={() => handleAddRow(section.name)}>
                      Add Row
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            {/* Summary Section */}
            <Card sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Summaries</Typography>
                <Stack spacing={2}>
                  {config.summaryFields.map(field => (
                    <TextField
                      key={field.name}
                      label={field.label}
                      value={summaries[field.name]}
                      onChange={e => handleSummaryChange(field.name, e.target.value)}
                      multiline={field.multiline}
                      rows={field.multiline ? 2 : 1}
                      fullWidth
                      sx={{ bgcolor: '#fff' }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Signature Section */}
            {config.requiresSignature && (
              <Card sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Inspector Signature</Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Inspector/Report Prepared by"
                      value={preparedBy}
                      onChange={e => setPreparedBy(e.target.value)}
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
                          value={sigDate}
                          onChange={setSigDate}
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
              <Tooltip title="Delete">
                <span>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this draft?')) {
                        const draftKeys = Object.keys(localStorage).filter(key => key.startsWith(`${config.reportType}_draft_`));
                        draftKeys.forEach(key => localStorage.removeItem(key));
                        navigate(`/${config.reportType}/reports/drafts`);
                      }
                    }}
                    sx={{ minWidth: isMobile ? 48 : 120, width: isMobile ? 48 : 'auto', height: 48, p: 0 }}
                    aria-label="Delete"
                  >
                    {!isMobile && 'Delete'}
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Review">
                <span>
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<VisibilityIcon />}
                    onClick={() => {
                      // Find the most recent draftId if it exists
                      const draftKeys = Object.keys(localStorage)
                        .filter(key => key.startsWith(`${config.reportType}_draft_`))
                        .sort((a, b) => parseInt(b.split('_draft_')[1]) - parseInt(a.split('_draft_')[1]));
                      const latestDraftId = draftKeys.length > 0 ? draftKeys[0].replace(`${config.reportType}_draft_`, '') : 'temp';
                      navigate(`/${config.reportType}/reports/review/${latestDraftId}`, {
                        state: { formData: {
                          header,
                          sections,
                          summaries,
                          preparedBy,
                          signature,
                          sigDate,
                          photos
                        } }
                      });
                    }}
                    sx={{ minWidth: isMobile ? 48 : 120, width: isMobile ? 48 : 'auto', height: 48, p: 0 }}
                    aria-label="Review"
                  >
                    {!isMobile && 'Review'}
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Exit">
                <span>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ExitToAppIcon />}
                    onClick={() => {
                      navigate(-1);
                    }}
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Draft saved!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ReportTemplate; 