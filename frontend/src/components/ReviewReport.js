import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const generateReportId = () => {
  const timestamp = Date.now().toString(36).slice(-4);
  const randomStr = Math.random().toString(36).substring(2, 4);
  return `R-${timestamp}${randomStr}`.toUpperCase();
};

const ReviewReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReport, setEditedReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First try to get the report from localStorage (draft)
        const draftReport = JSON.parse(localStorage.getItem('draftReport'));
        const storedPhotos = JSON.parse(localStorage.getItem('reportPhotos') || '[]');
        
        if (draftReport && id === 'draft') {
          setReport(draftReport);
          setEditedReport(draftReport);
          setPhotos(storedPhotos);
        } else {
          // If not a draft, fetch from API
          const response = await api.get(`/reports/${id}/`);
          setReport(response.data);
          setEditedReport(response.data);

          const photosResponse = await api.get(`/reports/${id}/photos/`);
          setPhotos(photosResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading report data. Please try again.');
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (id === 'draft') {
        // For draft reports, update localStorage
        localStorage.setItem('draftReport', JSON.stringify(editedReport));
        setReport(editedReport);
        setIsEditing(false);
        alert('Changes saved successfully!');
      } else {
        // For saved reports, update the database
        await api.put(`/reports/${id}/`, editedReport);
        setReport(editedReport);
        setIsEditing(false);
        alert('Changes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Original report data:', editedReport);
      
      // Construct location from available fields
      const locationParts = [];
      if (editedReport.route) locationParts.push(`Route: ${editedReport.route}`);
      if (editedReport.spread) locationParts.push(`Spread: ${editedReport.spread}`);
      if (editedReport.facility) locationParts.push(`Facility: ${editedReport.facility}`);
      if (editedReport.state) locationParts.push(`State: ${editedReport.state}`);
      if (editedReport.county) locationParts.push(`County: ${editedReport.county}`);
      if (editedReport.milepost_start && editedReport.milepost_end) {
        locationParts.push(`Milepost: ${editedReport.milepost_start}-${editedReport.milepost_end}`);
      }
      if (editedReport.station_start && editedReport.station_end) {
        locationParts.push(`Station: ${editedReport.station_start}-${editedReport.station_end}`);
      }

      const location = locationParts.join(', ') || 'Location not specified';

      const reportData = {
        date: editedReport.date || new Date().toISOString().split('T')[0],
        location: location,
        weather_conditions: editedReport.weather_description || 'No weather conditions specified',
        daily_activities: editedReport.notes || 'No daily activities specified',
        report_type: editedReport.report_type || '',
        facility: editedReport.facility || '',
        route: editedReport.route || '',
        spread: editedReport.spread || '',
        compliance_level: editedReport.compliance_level || '',
        activity_category: editedReport.activity_category || '',
        activity_group: editedReport.activity_group || '',
        activity_type: editedReport.activity_type || '',
        milepost_start: editedReport.milepost_start || '',
        milepost_end: editedReport.milepost_end || '',
        station_start: editedReport.station_start || '',
        station_end: editedReport.station_end || '',
        status: 'submitted'
      };

      console.log('Prepared report data:', reportData);

      let response;
      if (id === 'draft') {
        console.log('Creating new report...');
        response = await api.post('/reports/', reportData);
        console.log('Create response:', response.data);
        
        // Clear draft data from localStorage
        localStorage.removeItem('draftReport');
        localStorage.removeItem('reportPhotos');
      } else {
        console.log('Updating existing report...');
        response = await api.put(`/reports/${id}/`, reportData);
        console.log('Update response:', response.data);
      }
      
      alert('Report submitted successfully!');
      navigate('/reports-dashboard');
    } catch (error) {
      console.error('Error submitting report:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: error.config?.data,
        headers: error.config?.headers
      });
      
      let errorMessage = 'Error submitting report. ';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage += JSON.stringify(error.response.data);
        } else {
          errorMessage += error.response.data;
        }
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleChange = (field) => (event) => {
    setEditedReport({
      ...editedReport,
      [field]: event.target.value
    });
  };

  if (!report || !editedReport) return null;

  const renderField = (label, field, type = 'text') => {
    const value = isEditing ? editedReport[field] : report[field];
    
    return (
      <Box sx={inputContainerStyle}>
        <Typography sx={labelStyle}>{label}</Typography>
        {isEditing ? (
          <TextField
            fullWidth
            type={type}
            value={value || ''}
            onChange={handleChange(field)}
            size="small"
            sx={{
              bgcolor: '#ffffff',
              '& .MuiOutlinedInput-root': {
                height: type === 'text' ? '40px' : 'auto'
              }
            }}
          />
        ) : (
          <Typography>{value || 'None'}</Typography>
        )}
      </Box>
    );
  };

  const renderSelect = (label, field, options) => {
    const value = isEditing ? editedReport[field] : report[field];
    
    return (
      <Box sx={inputContainerStyle}>
        <Typography sx={labelStyle}>{label}</Typography>
        {isEditing ? (
          <FormControl fullWidth size="small">
            <Select
              value={value || ''}
              onChange={handleChange(field)}
              sx={{ bgcolor: '#ffffff', height: '40px' }}
            >
              {options.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Typography>{value || 'None'}</Typography>
        )}
      </Box>
    );
  };

  const labelStyle = {
    width: '150px',
    display: 'flex',
    alignItems: 'center',
    color: '#000000',
    fontWeight: 600,
    fontSize: '0.875rem'
  };

  const inputContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    gap: '16px'
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f5f5f5',
      p: { xs: 1, sm: 1.5 },
      overflow: 'auto'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
          <IconButton
          onClick={() => navigate('/reports-dashboard')}
          sx={{
            mr: { xs: 1, sm: 2 },
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#333333' },
            color: '#ffffff'
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ 
          color: '#000000', 
          fontWeight: 600,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          Review Report
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 } }}>
        {/* Event Information Section */}
        <Box sx={{ 
          flex: 1, 
          bgcolor: '#e0e0e0', 
          p: { xs: 1, sm: 1.5 }, 
          borderRadius: '2px',
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 1, 
            color: '#000000', 
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            textAlign: 'center',
            width: '100%'
          }}>
            EVENT INFORMATION
          </Typography>
          {renderField('DATE', 'date', 'date')}
          {renderField('AUTHOR', 'author')}
          {renderField('OTHER FIELD STAFF', 'otherFieldStaff')}
          {renderSelect('REPORT TYPE', 'reportType', ['Site Inspection', 'Other'])}
        </Box>

        {/* Weather Information Section */}
        <Box sx={{ 
          flex: 1, 
          bgcolor: '#e0e0e0', 
          p: { xs: 1, sm: 1.5 }, 
          borderRadius: '2px',
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 1, 
            color: '#000000', 
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            textAlign: 'center',
            width: '100%'
          }}>
            WEATHER INFORMATION
          </Typography>
          {renderField('WEATHER DESCRIPTION', 'weatherDescription')}
          {renderField('TEMPERATURE', 'temperature')}
          {renderSelect('PRECIPITATION TYPE', 'precipitationType', ['None', 'Rain', 'Snow'])}
          {renderField('PRECIPITATION INCHES', 'precipitationInches')}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 } }}>
        {/* Location Information Section */}
        <Box sx={{ 
          flex: 1, 
          bgcolor: '#e0e0e0', 
          p: { xs: 1, sm: 1.5 }, 
          borderRadius: '2px',
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 1, 
            color: '#000000', 
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            textAlign: 'center',
            width: '100%'
          }}>
            LOCATION INFORMATION
          </Typography>
          {renderSelect('ROUTE', 'route', ['AP-1'])}
          {renderField('SPREAD(S)', 'spread')}
          {renderField('FACILITY(IES)', 'facility')}
          {renderField('STATE(S)', 'state')}
          {renderField('COUNTY(IES)', 'county')}
          {renderField('MILEPOST START', 'milepostStart')}
          {renderField('MILEPOST END', 'milepostEnd')}
          {renderField('STATION START', 'stationStart')}
          {renderField('STATION END', 'stationEnd')}
        </Box>

        {/* Activity Information Section */}
        <Box sx={{ 
          flex: 1, 
          bgcolor: '#e0e0e0', 
          p: { xs: 1, sm: 1.5 }, 
          borderRadius: '2px',
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 1, 
            color: '#000000', 
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            textAlign: 'center',
            width: '100%'
          }}>
            ACTIVITY(IES) IN PROGRESS
          </Typography>
          {renderSelect('ACTIVITY CATEGORY', 'activityCategory', ['Construction'])}
          {renderField('ACTIVITY GROUP', 'activityGroup')}
          {renderField('ACTIVITY TYPE(S)', 'activityType')}
          {renderSelect('COMPLIANCE LEVEL', 'complianceLevel', ['Acceptable', 'Unacceptable'])}
        </Box>
      </Box>

      {/* Notes Section */}
      <Box sx={{ 
        bgcolor: '#e0e0e0', 
        p: 1.5, 
        borderRadius: '2px',
        mb: 2
      }}>
        <Typography variant="subtitle2" sx={{ 
          mb: 1, 
          color: '#000000', 
          fontWeight: 700,
          fontSize: '1.1rem',
          textAlign: 'center',
          width: '100%'
        }}>
          NOTES
        </Typography>
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editedReport.notes || ''}
            onChange={handleChange('notes')}
            sx={{ 
              bgcolor: '#ffffff',
              '& .MuiOutlinedInput-root': {
                minHeight: '100px'
              }
            }}
          />
        ) : (
          <Box sx={{ 
            bgcolor: '#ffffff', 
            p: 2,
            borderRadius: '2px',
            minHeight: '100px',
            border: '1px solid #000000'
          }}>
            <Typography>{report.notes || 'No notes'}</Typography>
          </Box>
        )}
      </Box>

      {/* Photos Section */}
      <Box sx={{ 
        bgcolor: '#e0e0e0', 
        p: { xs: 1, sm: 1.5 }, 
        borderRadius: '2px',
        mb: { xs: 1, sm: 2 }
      }}>
        <Typography variant="subtitle2" sx={{ 
          mb: 1, 
          color: '#000000', 
          fontWeight: 700,
          fontSize: { xs: '1rem', sm: '1.1rem' },
          textAlign: 'center',
          width: '100%'
        }}>
          PHOTOS
        </Typography>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          {photos.map((photo) => (
            <Grid item xs={12} sm={6} key={photo.id}>
              <Box sx={{ 
                bgcolor: '#ffffff',
                p: { xs: 1, sm: 1.5 },
                borderRadius: '2px',
                border: '1px solid #000000',
                height: '100%'
              }}>
                <Box sx={{ 
                  width: '100%',
                  height: { xs: '200px', sm: '250px' },
                  mb: { xs: 1, sm: 1.5 },
                  position: 'relative'
                }}>
                  <img
                    src={photo.preview}
                    alt="Report photo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      backgroundColor: '#f5f5f5'
                    }}
                  />
                </Box>
                <Typography variant="subtitle2" sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  color: '#000000',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                  Location: {photo.location || 'Not specified'}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#333333',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}>
                  {photo.comments || 'No comments'}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 2 },
        justifyContent: 'space-between'
      }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate('/reports-dashboard')}
          sx={{
            backgroundColor: '#666666',
            '&:hover': { backgroundColor: '#444444' },
            height: { xs: '40px', sm: '32px' },
            color: '#ffffff',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          BACK
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#333333' },
            height: { xs: '40px', sm: '32px' },
            color: '#ffffff',
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          SAVE CHANGES
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewReport;