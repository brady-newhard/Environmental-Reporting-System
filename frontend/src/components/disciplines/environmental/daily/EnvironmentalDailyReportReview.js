import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { loadDraft } from '../../../../utils/draftUtils';
import { Box, Typography, Paper, Button, Grid, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import PageHeader from '../../../../components/common/PageHeader';

const config = {
  headerFields: [
    { name: 'project', label: 'Project' },
    { name: 'spread', label: 'Spread' },
    { name: 'contractor', label: 'Contractor' },
    { name: 'inspector', label: 'Inspector' },
    { name: 'milepost_start', label: 'Milepost Start' },
    { name: 'milepost_end', label: 'Milepost End' },
    { name: 'station_start', label: 'Station Start' },
    { name: 'station_end', label: 'Station End' },
    { name: 'date', label: 'Date', type: 'date' }
  ],
  weatherFields: [
    { name: 'weather_conditions', label: 'Sky Cover' },
    { name: 'temperature', label: 'Temperature (°F)' },
    { name: 'precipitation_type', label: 'Precipitation Type' },
    { name: 'soil_conditions', label: 'Soil Conditions' }
  ],
  rainGaugeFields: [
    { name: 'location', label: 'Rain Gauge Location' },
    { name: 'rain', label: 'Rain (in)' },
    { name: 'snow', label: 'Snow (in)' }
  ],
  dynamicSections: [
    {
      name: 'Crew Daily Summaries',
      label: 'Crew Daily Summaries',
      fields: [
        { name: 'Crew', label: 'Crew' },
        { name: 'Foreman', label: 'Foreman' },
        { name: 'Start Station', label: 'Start Station' },
        { name: 'End Station', label: 'End Station' },
        { name: 'Summary', label: 'Summary' }
      ]
    },
    {
      name: 'Daily Progress',
      label: 'Daily Progress',
      fields: [
        { name: 'Phase', label: 'Progress Item' },
        { name: 'Start Station', label: 'Start Station' },
        { name: 'End Station', label: 'End Station' }
      ]
    }
  ],
  summaryFields: [
    { name: 'notes', label: 'Environmental Summary' }
  ]
};

export default function EnvironmentalDailyReportReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportType = 'environmental';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get the back path from location state or default to drafts
  const backPath = location.state?.from || '/environmental/reports/daily/drafts';

  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      try {
        // Load draft using the new storage system
        const loadedDraft = await loadDraft('environmental', id);
        console.log('Loaded draft:', loadedDraft);
        
        if (loadedDraft) {
          setDraft(loadedDraft);
        } else {
          console.log('Draft not found with ID:', id);
          setError('Draft not found');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        setError('Error loading draft');
      } finally {
        setIsLoading(false);
      }
    };

    loadDraftData();
  }, [id]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader 
          title="Environmental Daily Report Review"
          backPath={backPath}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <Typography>Loading draft...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <PageHeader 
          title="Environmental Daily Report Review"
          backPath={backPath}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <Typography>{error}</Typography>
      </Box>
    );
  }

  const header = draft.header || {};
  const sections = draft.sections || [];
  const summaries = draft.summaries || {};
  const photos = draft.photos || [];
  const signature = draft.signature || '';
  const sigDate = draft.sigDate || draft.sig_date || '';

  // Helper to format date as MM/DD/YYYY
  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d)) return value;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  // Section header style
  const sectionHeader = { fontWeight: 'bold', fontSize: { xs: 16, sm: 20 }, mb: 2 };

  // Render header fields
  const renderHeaderFields = () => (
    <Grid container spacing={2}>
      {config.headerFields.map(field => {
        let value = header[field.name] || '';
        if (field.type === 'date') value = formatDate(value);
        if (!value) value = '—';
        return (
          <Grid item xs={12} sm={6} key={field.name}>
            <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}><b>{field.label}:</b> {value}</Typography>
          </Grid>
        );
      })}
    </Grid>
  );

  // Render weather fields
  const renderWeatherFields = () => (
    <Grid container spacing={2}>
      {config.weatherFields.map(field => {
        let value = header[field.name] || '';
        if (!value) value = '—';
        return (
          <Grid item xs={12} sm={6} key={field.name}>
            <Typography><b>{field.label}:</b> {value}</Typography>
          </Grid>
        );
      })}
    </Grid>
  );

  // Render rain gauge data
  const renderRainGaugeSection = () => {
    const rainGauges = header.rain_gauges || [];
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography sx={sectionHeader}>Rain Gauge Data</Typography>
        {Array.isArray(rainGauges) && rainGauges.length > 0 ? (
          rainGauges.map((gauge, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                {config.rainGaugeFields.map(field => (
                  <Grid item xs={12} sm={4} key={field.name}>
                    <Typography><b>{field.label}:</b> {gauge[field.name] || '—'}</Typography>
                  </Grid>
                ))}
              </Grid>
              {idx < rainGauges.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No entries</Typography>
        )}
      </Paper>
    );
  };

  // Render dynamic sections
  const renderDynamicSection = (sectionConfig) => {
    const section = sections.find(s => s.name === sectionConfig.name) || { rows: [] };
    const sectionData = section.rows || [];
    return (
      <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 2 }} key={sectionConfig.name}>
        <Typography sx={sectionHeader}>{sectionConfig.label}</Typography>
        {Array.isArray(sectionData) && sectionData.length > 0 ? (
          sectionData.map((row, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                {sectionConfig.fields.map(field => (
                  <Grid item xs={12} sm={4} key={field.name}>
                    <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}><b>{field.label}:</b> {row[field.name] || '—'}</Typography>
                  </Grid>
                ))}
              </Grid>
              {idx < sectionData.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">No entries</Typography>
        )}
      </Paper>
    );
  };

  // Render summary fields
  const renderSummaryFields = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography sx={sectionHeader}>Notes</Typography>
      {config.summaryFields.map(field => (
        <Box key={field.name}>
          <Typography>{summaries[field.name] || '—'}</Typography>
        </Box>
      ))}
    </Paper>
  );

  // Render photos section
  const renderPhotosSection = () => (
    <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
      <Typography sx={sectionHeader}>Photos</Typography>
      {Array.isArray(photos) && photos.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {photos.map((photo, idx) => {
            let photoUrl;
            if (typeof photo === 'string') {
              photoUrl = photo;
            } else if (photo.url) {
              photoUrl = photo.url;
            } else if (photo.file) {
              photoUrl = photo.file;
            }

            const location = photo.location || '';
            const comments = photo.comments || photo.comment || '';

            return (
              <Box
                key={idx}
                sx={{
                  flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 6px)' },
                  maxWidth: { xs: '100%', sm: 'calc(50% - 6px)' },
                  minWidth: 0,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1.5px solid #bbb',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  background: '#fafafa',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    overflow: 'hidden',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={`Report Photo ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                        maxHeight: '220px',
                      }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Typography color="text.secondary">Image not available</Typography>
                  )}
                </Box>
                {location && (
                  <Typography variant="caption" sx={{ width: '100%', textAlign: 'center', color: '#333', fontWeight: 500, fontSize: { xs: 12, sm: 14 } }}>
                    Location: {location}
                  </Typography>
                )}
                {comments && (
                  <Typography variant="caption" sx={{ width: '100%', textAlign: 'center', color: '#666', fontStyle: 'italic', fontSize: { xs: 12, sm: 14 } }}>
                    {comments}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography color="text.secondary">No photos</Typography>
      )}
    </Paper>
  );

  // Render signatures section
  const renderSignaturesSection = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography sx={sectionHeader}>Signatures</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography><b>Signature:</b> {signature || '—'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography><b>Date:</b> {formatDate(sigDate)}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  // Button handlers
  const handleEdit = () => {
    navigate(`/environmental/reports/daily/edit/${id}`, { state: { draft } });
  };

  const handleExit = () => {
    navigate(backPath);
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      // Assume deleteDraft is imported from utils
      await import('../../../../utils/draftUtils').then(utils => utils.deleteDraft('environmental_daily', id));
      setSnackbar({ open: true, message: 'Draft deleted successfully.', severity: 'success' });
      setTimeout(() => navigate('/environmental/reports/daily/drafts'), 1000);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete draft.', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    setSubmitDialogOpen(false);
    try {
      // Placeholder: Replace with actual submit API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setSnackbar({ open: true, message: 'Draft submitted successfully.', severity: 'success' });
      setTimeout(() => navigate('/environmental/reports/daily/drafts'), 1000);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to submit draft.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <PageHeader 
        title="Environmental Daily Report Review"
        backPath={backPath}
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }}
      />
      <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
        <Typography sx={sectionHeader}>Project Information</Typography>
        {renderHeaderFields()}
      </Paper>
      <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
        <Typography sx={sectionHeader}>Weather Data</Typography>
        {renderWeatherFields()}
      </Paper>
      {renderRainGaugeSection()}
      {config.dynamicSections.map(renderDynamicSection)}
      {renderSummaryFields()}
      {renderPhotosSection()}
      {renderSignaturesSection()}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'center', sm: 'flex-end' }, mt: 3 }}>
        <Button variant="outlined" color="primary" onClick={handleEdit} sx={{ minWidth: { xs: 100, sm: 120 }, fontSize: { xs: 14, sm: 16 } }}>Edit</Button>
        <Button variant="outlined" color="inherit" onClick={handleExit} sx={{ minWidth: { xs: 100, sm: 120 }, fontSize: { xs: 14, sm: 16 } }}>Exit</Button>
        <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)} sx={{ minWidth: { xs: 100, sm: 120 }, fontSize: { xs: 14, sm: 16 } }}>Delete</Button>
        <Button variant="contained" color="success" onClick={() => setSubmitDialogOpen(true)} sx={{ minWidth: { xs: 100, sm: 120 }, fontSize: { xs: 14, sm: 16 } }}>Submit</Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Draft?</DialogTitle>
        <DialogContent>Are you sure you want to delete this draft? This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Submit Draft?</DialogTitle>
        <DialogContent>Are you sure you want to submit this draft as a final report?</DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} color="success">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 