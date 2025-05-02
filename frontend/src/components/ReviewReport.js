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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReviewReport = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReport, setEditedReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const draftReport = localStorage.getItem('draftReport');
        if (draftReport) {
          const parsedReport = JSON.parse(draftReport);
          setReport(parsedReport);
          setEditedReport(parsedReport);
        } else {
          const response = await axios.get('http://localhost:8000/api/reports/draft/latest/', {
            withCredentials: true
          });
          setReport(response.data);
          setEditedReport(response.data);
        }

        const storedPhotos = localStorage.getItem('reportPhotos');
        if (storedPhotos) {
          setPhotos(JSON.parse(storedPhotos));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading report data. Please try again.');
      }
    };

    fetchData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Save the edited report to localStorage
      localStorage.setItem('draftReport', JSON.stringify(editedReport));
      setReport(editedReport);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      // Prepare the final report data
      const finalReport = {
        ...editedReport,
        photos: photos.map(photo => ({
          location: photo.location,
          comments: photo.comments,
          file: photo.file,
          preview: photo.preview
        })),
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      // Submit to database
      await axios.post('http://localhost:8000/api/reports/', finalReport, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Clear localStorage after successful submission
      localStorage.removeItem('draftReport');
      localStorage.removeItem('reportPhotos');

      navigate('/reports-dashboard');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
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
      p: 1.5,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/photos')}
            sx={{
              mr: 2,
              backgroundColor: '#000000',
              '&:hover': { backgroundColor: '#333333' },
              color: '#ffffff'
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ color: '#000000', fontWeight: 600 }}>
            Review Report
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
          onClick={isEditing ? handleSave : handleEdit}
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#333333' },
            color: '#ffffff'
          }}
        >
          {isEditing ? 'Save Changes' : 'Edit Report'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {/* Event Information Section */}
        <Box sx={{ 
          flex: 1, 
          bgcolor: '#e0e0e0', 
          p: 1.5, 
          borderRadius: '2px',
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 1, 
            color: '#000000', 
            fontWeight: 700,
            fontSize: '1.1rem',
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
          p: 1.5, 
          borderRadius: '2px',
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 1, 
            color: '#000000', 
            fontWeight: 700,
            fontSize: '1.1rem',
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

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {/* Location Information Section */}
        <Box sx={{ 
          flex: 1, 
          bgcolor: '#e0e0e0', 
          p: 1.5, 
          borderRadius: '2px',
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 1, 
            color: '#000000', 
            fontWeight: 700,
            fontSize: '1.1rem',
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
          p: 1.5, 
          borderRadius: '2px',
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 1, 
            color: '#000000', 
            fontWeight: 700,
            fontSize: '1.1rem',
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
          PHOTOS
        </Typography>
        <Grid container spacing={2}>
          {photos.map((photo) => (
            <Grid item xs={6} key={photo.id}>
              <Box sx={{ 
                bgcolor: '#ffffff',
                p: 1.5,
                borderRadius: '2px',
                border: '1px solid #000000',
                height: '100%'
              }}>
                <Box sx={{ 
                  width: '100%',
                  height: '250px',
                  mb: 1.5,
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
                  color: '#000000'
                }}>
                  Location: {photo.location || 'Not specified'}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#333333',
                  fontSize: '0.875rem'
                }}>
                  {photo.comments || 'No comments'}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/photos')}
          sx={{
            backgroundColor: '#666666',
            '&:hover': { backgroundColor: '#444444' },
            height: '32px',
            color: '#ffffff'
          }}
        >
          Back to Photos
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#333333' },
            height: '32px',
            color: '#ffffff'
          }}
        >
          Submit Report
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewReport;