import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const generateReportId = () => {
  const timestamp = Date.now().toString(36).slice(-4);
  const randomStr = Math.random().toString(36).substring(2, 4);
  return `R-${timestamp}${randomStr}`.toUpperCase();
};

const ReportForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reportId: generateReportId(),
    date: '',
    author: '',
    otherFieldStaff: '',
    reportType: 'Site Inspection',
    weatherDescription: '',
    temperature: '',
    precipitationType: 'None',
    precipitationInches: '',
    notes: '',
    // Location Information
    route: '',
    spread: '',
    facility: '',
    state: '',
    county: '',
    milepostStart: '',
    milepostEnd: '',
    stationStart: '',
    stationEnd: '',
    // Activity Information
    activityCategory: '',
    activityGroup: '',
    activityType: '',
    complianceLevel: 'Acceptable'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/reports/', {
        ...formData,
        reportId: generateReportId(),
        status: 'submitted'
      }, {
        withCredentials: true
      });
      alert('Report submitted successfully!');
      setFormData({
        reportId: generateReportId(),
        date: '',
        author: '',
        otherFieldStaff: '',
        reportType: 'Site Inspection',
        weatherDescription: '',
        temperature: '',
        precipitationType: 'None',
        precipitationInches: '',
        notes: '',
        route: '',
        spread: '',
        facility: '',
        state: '',
        county: '',
        milepostStart: '',
        milepostEnd: '',
        stationStart: '',
        stationEnd: '',
        activityCategory: '',
        activityGroup: '',
        activityType: '',
        complianceLevel: 'Acceptable'
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    // Store form data in localStorage before navigating
    localStorage.setItem('draftReport', JSON.stringify(formData));
    navigate('/photos');
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/reports/draft/', {
        ...formData,
        reportId: generateReportId(),
        status: 'draft'
      }, {
        withCredentials: true
      });
      navigate('/reports-dashboard');
    } catch (error) {
      console.error('Error saving draft report:', error);
      alert('Error saving draft report. Please try again.');
    }
  };

  const inputStyle = {
    backgroundColor: '#fff',
    borderRadius: '2px',
    '& .MuiOutlinedInput-root': {
      height: '40px'
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#000000'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#000000'
    },
    flex: 1
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton
          onClick={() => navigate('/reports-dashboard')}
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
          New Report
        </Typography>
      </Box>

      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
              <Typography sx={labelStyle}>DATE *</Typography>
              <TextField
                required
                fullWidth
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={inputStyle}
              />
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>AUTHOR *</Typography>
              <TextField
                required
                fullWidth
                name="author"
                value={formData.author}
                onChange={handleChange}
                sx={inputStyle}
              />
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>OTHER FIELD STAFF</Typography>
              <TextField
                fullWidth
                name="otherFieldStaff"
                value={formData.otherFieldStaff}
                onChange={handleChange}
                sx={inputStyle}
              />
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>REPORT TYPE</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  name="reportType"
                  value={formData.reportType}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="Site Inspection">Site Inspection</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
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
              <TextField
                fullWidth
                name="weatherDescription"
                value={formData.weatherDescription}
                onChange={handleChange}
                sx={inputStyle}
              />
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>TEMPERATURE</Typography>
              <TextField
                fullWidth
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                sx={inputStyle}
              />
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>PRECIPITATION TYPE</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  name="precipitationType"
                  value={formData.precipitationType}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="None">None</MenuItem>
                  <MenuItem value="Rain">Rain</MenuItem>
                  <MenuItem value="Snow">Snow</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>PRECIPITATION INCHES</Typography>
              <TextField
                fullWidth
                name="precipitationInches"
                value={formData.precipitationInches}
                onChange={handleChange}
                sx={inputStyle}
              />
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
              <Typography sx={labelStyle}>ROUTE *</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  required
                  name="route"
                  value={formData.route}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="AP-1">AP-1</MenuItem>
                  {/* Add more routes as needed */}
                </Select>
              </FormControl>
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>SPREAD(S) *</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  required
                  name="spread"
                  value={formData.spread}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="">Select Spread</MenuItem>
                  {/* Add spread options */}
                </Select>
              </FormControl>
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>FACILITY(IES)</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  name="facility"
                  value={formData.facility}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="">Select Facility</MenuItem>
                  {/* Add facility options */}
                </Select>
              </FormControl>
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>STATE(S) *</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  required
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="">Select State</MenuItem>
                  {/* Add state options */}
                </Select>
              </FormControl>
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>COUNTY(IES) *</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  required
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="">Select County</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Box sx={inputContainerStyle}>
                <Typography sx={labelStyle}>MILEPOST</Typography>
                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                  <TextField
                    fullWidth
                    name="milepostStart"
                    value={formData.milepostStart}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder="Start"
                  />
                  <TextField
                    fullWidth
                    name="milepostEnd"
                    value={formData.milepostEnd}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder="End"
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Box sx={inputContainerStyle}>
                <Typography sx={labelStyle}>STATION</Typography>
                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                  <TextField
                    fullWidth
                    name="stationStart"
                    value={formData.stationStart}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder="Start"
                  />
                  <TextField
                    fullWidth
                    name="stationEnd"
                    value={formData.stationEnd}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder="End"
                  />
                </Box>
              </Box>
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
              ENTER ACTIVITY(IES) IN PROGRESS
            </Typography>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>ACTIVITY CATEGORY *</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  required
                  name="activityCategory"
                  value={formData.activityCategory}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="Construction">Construction</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>ACTIVITY GROUP *</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  required
                  name="activityGroup"
                  value={formData.activityGroup}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="">Select Activity Group</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>ACTIVITY TYPE(S) *</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  required
                  name="activityType"
                  value={formData.activityType}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="">Select Activity Type</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>COMPLIANCE LEVEL</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  name="complianceLevel"
                  value={formData.complianceLevel}
                  onChange={handleChange}
                  sx={{ height: '40px' }}
                >
                  <MenuItem value="Acceptable">Acceptable</MenuItem>
                  <MenuItem value="Unacceptable">Unacceptable</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* Feature Selection Area - Full Width */}
        <Box sx={{ 
          bgcolor: '#e0e0e0', 
          p: 1.5, 
          borderRadius: '2px',
          mb: 2,
          width: '100%'
        }}>
          <Typography variant="subtitle2" sx={{ 
            color: '#000000', 
            fontWeight: 700,
            fontSize: '1.1rem',
            textAlign: 'center',
            width: '100%',
            mb: 1
          }}>
            CLICK TO SELECT TRACTS, ACCESS ROADS, AND ENVIRONMENTAL FEATURES
          </Typography>
          <Box sx={{ 
            height: '200px', 
            bgcolor: '#f5f5f5', 
            borderRadius: '2px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Typography sx={{ color: '#666' }}>Feature selection area</Typography>
          </Box>
        </Box>

        {/* Notes Section - Full Width */}
        <Box sx={{ 
          bgcolor: '#e0e0e0', 
          p: 1.5, 
          borderRadius: '2px',
          mb: 2,
          flex: 1
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
          <TextField
            fullWidth
            multiline
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter your notes here..."
            sx={{ 
              backgroundColor: '#fff', 
              borderRadius: '2px',
              '& .MuiOutlinedInput-root': {
                minHeight: '200px',
                '& fieldset': {
                  borderColor: '#000000',
                },
                '&:hover fieldset': {
                  borderColor: '#000000',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#000000',
                },
              },
              '& .MuiInputBase-input': {
                padding: '12px',
              }
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/reports-dashboard')}
            sx={{
              backgroundColor: '#666666',
              '&:hover': { backgroundColor: '#444444' },
              height: '32px',
              color: '#ffffff'
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveProgress}
            sx={{
              backgroundColor: '#666666',
              '&:hover': { backgroundColor: '#444444' },
              height: '32px',
              color: '#ffffff'
            }}
          >
            SAVE PROGRESS & EXIT
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            onClick={handleNextStep}
            sx={{
              backgroundColor: '#000000',
              '&:hover': { backgroundColor: '#333333' },
              height: '32px',
              color: '#ffffff'
            }}
          >
            ADD PHOTOS
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ReportForm; 