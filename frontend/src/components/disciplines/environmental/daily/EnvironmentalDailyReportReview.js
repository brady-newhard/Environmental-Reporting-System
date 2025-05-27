import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getAllDrafts } from '../../../../utils/draftStorage';
import { Box, Typography, Paper, Button, Grid, Divider } from '@mui/material';

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
    { name: 'inspection_type', label: 'Inspection Type' },
    { name: 'inspection_date', label: 'Inspection Date', type: 'date' }
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
    { name: 'notes', label: 'Notes' }
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

  useEffect(() => {
    const loadDraft = async () => {
      setIsLoading(true);
      try {
        // First check if we have the draft in location state
        if (location.state?.draft) {
          console.log('Loading draft from location state:', location.state.draft);
          setDraft(location.state.draft);
          setIsLoading(false);
          return;
        }

        // If not in location state, try to get from API
        const drafts = await getAllDrafts('environmental_daily');
        console.log('Loaded drafts:', drafts);
        console.log('Looking for draft with ID:', id, 'Type:', typeof id);
        
        const foundDraft = drafts.find(d => String(d.id) === String(id));
        console.log('Found draft:', foundDraft);
        
        if (foundDraft) {
          setDraft(foundDraft);
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

    loadDraft();
  }, [id, location.state]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Environmental Daily Report Review</Typography>
        <Typography>Loading draft...</Typography>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }} 
          onClick={() => navigate('/environmental/reports/daily/drafts')}
        >
          Back to Drafts
        </Button>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Environmental Daily Report Review</Typography>
        <Typography>{error}</Typography>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }} 
          onClick={() => navigate('/environmental/reports/daily/drafts')}
        >
          Back to Drafts
        </Button>
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
  const sectionHeader = { fontWeight: 'bold', fontSize: 20, mb: 2 };

  // Render header fields
  const renderHeaderFields = () => (
    <Grid container spacing={2}>
      {config.headerFields.map(field => {
        let value = header[field.name] || '';
        if (field.type === 'date') value = formatDate(value);
        if (!value) value = '—';
        return (
          <Grid item xs={12} sm={6} key={field.name}>
            <Typography><b>{field.label}:</b> {value}</Typography>
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
      <Paper sx={{ p: 2, mb: 2 }} key={sectionConfig.name}>
        <Typography sx={sectionHeader}>{sectionConfig.label}</Typography>
        {Array.isArray(sectionData) && sectionData.length > 0 ? (
          sectionData.map((row, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                {sectionConfig.fields.map(field => (
                  <Grid item xs={12} sm={4} key={field.name}>
                    <Typography><b>{field.label}:</b> {row[field.name] || '—'}</Typography>
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
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography sx={sectionHeader}>Photos</Typography>
      {Array.isArray(photos) && photos.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {photos.map((photo, idx) => {
            // Handle different photo formats:
            // 1. String URL
            // 2. Object with url property
            // 3. Object with file property (base64)
            let photoUrl;
            if (typeof photo === 'string') {
              photoUrl = photo;
            } else if (photo.url) {
              photoUrl = photo.url;
            } else if (photo.file) {
              photoUrl = photo.file;
            }

            if (!photoUrl) {
              console.warn('Invalid photo data:', photo);
              return null;
            }
            
            return (
              <Box key={idx} sx={{ width: 120, height: 120, border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={photoUrl} 
                  alt={`Report Photo ${idx + 1}`} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }} 
                  onError={(e) => {
                    console.error('Error loading photo:', photoUrl);
                    e.target.style.display = 'none';
                  }}
                />
                {photo.location && (
                  <Typography variant="caption" sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', p: 0.5, textAlign: 'center' }}>
                    {photo.location}
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Environmental Daily Report Review</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography sx={sectionHeader}>Project Information</Typography>
        {renderHeaderFields()}
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography sx={sectionHeader}>Weather Data</Typography>
        {renderWeatherFields()}
      </Paper>
      {renderRainGaugeSection()}
      {config.dynamicSections.map(renderDynamicSection)}
      {renderSummaryFields()}
      {renderPhotosSection()}
      {renderSignaturesSection()}
      <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate('/environmental/reports/daily/drafts')}>Back to Drafts</Button>
    </Box>
  );
} 