import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getAllDrafts } from '../../../../utils/draftStorage';
import { Box, Typography, Paper, Button, Grid, Divider } from '@mui/material';
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

  // Get the back path from location state or default to drafts
  const backPath = location.state?.from || '/environmental/reports/daily/drafts';

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
        <Grid container spacing={2}>
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
              <Grid item xs={12} sm={6} key={idx}>
                <Box sx={{
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  bgcolor: '#fafafa',
                  p: 1
                }}>
                  <Box sx={{
                    width: '100%',
                    height: 220,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    background: '#eee',
                    position: 'relative',
                  }}>
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`Report Photo ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.style.display = 'none';
                          const placeholder = document.createElement('div');
                          placeholder.innerText = 'Image not available';
                          placeholder.style.textAlign = 'center';
                          placeholder.style.width = '100%';
                          placeholder.style.color = '#888';
                          e.target.parentNode.appendChild(placeholder);
                        }}
                      />
                    ) : (
                      <Typography color="text.secondary">Image not available</Typography>
                    )}
                  </Box>
                  {location && (
                    <Typography variant="caption" sx={{ width: '100%', textAlign: 'center', color: '#333', fontWeight: 500 }}>
                      Location: {location}
                    </Typography>
                  )}
                  {comments && (
                    <Typography variant="caption" sx={{ width: '100%', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                      {comments}
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
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
    </Box>
  );
} 