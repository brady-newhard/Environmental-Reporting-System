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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReviewReport = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const draftReport = localStorage.getItem('draftReport');
        if (draftReport) {
          setReport(JSON.parse(draftReport));
        } else {
          const response = await axios.get('http://localhost:8000/api/reports/draft/latest/', {
            withCredentials: true
          });
          setReport(response.data);
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

  const handleSubmit = async () => {
    try {
      const reportData = {
        ...report,
        photos: photos,
        status: 'submitted'
      };

      await axios.post('http://localhost:8000/api/reports/submit/', reportData, {
        withCredentials: true
      });

      localStorage.removeItem('draftReport');
      localStorage.removeItem('reportPhotos');

      navigate('/reports-dashboard');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    }
  };

  if (!report) return null;

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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>DATE</Typography>
            <Typography>{new Date(report.date).toLocaleDateString()}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>AUTHOR</Typography>
            <Typography>{report.author}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>OTHER FIELD STAFF</Typography>
            <Typography>{report.otherFieldStaff || 'None'}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>REPORT TYPE</Typography>
            <Typography>{report.reportType}</Typography>
          </Box>
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
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>WEATHER DESCRIPTION</Typography>
            <Typography>{report.weatherDescription || 'None'}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>TEMPERATURE</Typography>
            <Typography>{report.temperature || 'None'}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>PRECIPITATION TYPE</Typography>
            <Typography>{report.precipitationType}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>PRECIPITATION INCHES</Typography>
            <Typography>{report.precipitationInches || 'None'}</Typography>
          </Box>
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
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>ROUTE</Typography>
            <Typography>{report.route}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>SPREAD(S)</Typography>
            <Typography>{report.spread}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>FACILITY(IES)</Typography>
            <Typography>{report.facility || 'None'}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>STATE(S)</Typography>
            <Typography>{report.state}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>COUNTY(IES)</Typography>
            <Typography>{report.county}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>MILEPOST</Typography>
            <Typography>{report.milepostStart} - {report.milepostEnd}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>STATION</Typography>
            <Typography>{report.stationStart} - {report.stationEnd}</Typography>
          </Box>
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
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>ACTIVITY CATEGORY</Typography>
            <Typography>{report.activityCategory}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>ACTIVITY GROUP</Typography>
            <Typography>{report.activityGroup}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>ACTIVITY TYPE(S)</Typography>
            <Typography>{report.activityType}</Typography>
          </Box>
          <Box sx={inputContainerStyle}>
            <Typography sx={labelStyle}>COMPLIANCE LEVEL</Typography>
            <Typography>{report.complianceLevel}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Notes Section - Full Width */}
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
        <Box sx={{ 
          bgcolor: '#ffffff', 
          p: 2,
          borderRadius: '2px',
          minHeight: '100px',
          border: '1px solid #000000'
        }}>
          <Typography>{report.notes || 'No notes'}</Typography>
        </Box>
      </Box>

      {/* Photos Section - Full Width */}
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