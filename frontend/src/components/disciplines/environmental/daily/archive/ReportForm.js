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
import api from '../../../../services/api';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';

const generateReportId = () => {
  const timestamp = Date.now().toString(36).slice(-4);
  const randomStr = Math.random().toString(36).substring(2, 4);
  return `R-${timestamp}${randomStr}`.toUpperCase();
};

const ReportForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    report_id: generateReportId(),
    date: '',
    author: '',
    other_field_staff: '',
    report_type: 'Site Inspection',
    weather_description: '',
    temperature: '',
    precipitation_type: 'None',
    precipitation_inches: '',
    notes: '',
    // Location Information
    route: '',
    spread: '',
    facility: '',
    state: '',
    county: '',
    milepost_start: '',
    milepost_end: '',
    station_start: '',
    station_end: '',
    // Activity Information
    activity_category: '',
    activity_group: '',
    activity_type: '',
    compliance_level: 'Acceptable'
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
      await api.post('/reports/', {
        ...formData,
        report_id: generateReportId(),
        status: 'submitted',
        weather_conditions: formData.weather_description,
        daily_activities: formData.notes
      });
      alert('Report submitted successfully!');
      setFormData({
        report_id: generateReportId(),
        date: '',
        author: '',
        other_field_staff: '',
        report_type: 'Site Inspection',
        weather_description: '',
        temperature: '',
        precipitation_type: 'None',
        precipitation_inches: '',
        notes: '',
        route: '',
        spread: '',
        facility: '',
        state: '',
        county: '',
        milepost_start: '',
        milepost_end: '',
        station_start: '',
        station_end: '',
        activity_category: '',
        activity_group: '',
        activity_type: '',
        compliance_level: 'Acceptable'
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
      await api.post('/reports/draft/', {
        ...formData,
        report_id: generateReportId(),
        status: 'draft'
      });
      navigate('/project-documents');
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
      p: { xs: 1, sm: 1.5 },
      overflow: 'auto'
    }}>
      <PageHeader 
        title="Daily Environmental Report"
        backPath="/environmental/reports"
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }}
      />

      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1, sm: 2 }, 
          mb: { xs: 1, sm: 2 } 
        }}>
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
                name="other_field_staff"
                value={formData.other_field_staff}
                onChange={handleChange}
                sx={inputStyle}
              />
            </Box>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>REPORT TYPE</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  name="report_type"
                  value={formData.report_type}
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
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>WEATHER DESCRIPTION</Typography>
              <TextField
                fullWidth
                name="weather_description"
                value={formData.weather_description}
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
                  name="precipitation_type"
                  value={formData.precipitation_type}
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
                name="precipitation_inches"
                value={formData.precipitation_inches}
                onChange={handleChange}
                sx={inputStyle}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1, sm: 2 }, 
          mb: { xs: 1, sm: 2 } 
        }}>
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
                    name="milepost_start"
                    value={formData.milepost_start}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder="Start"
                  />
                  <TextField
                    fullWidth
                    name="milepost_end"
                    value={formData.milepost_end}
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
                    name="station_start"
                    value={formData.station_start}
                    onChange={handleChange}
                    sx={inputStyle}
                    placeholder="Start"
                  />
                  <TextField
                    fullWidth
                    name="station_end"
                    value={formData.station_end}
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
              ENTER ACTIVITY(IES) IN PROGRESS
            </Typography>
            <Box sx={inputContainerStyle}>
              <Typography sx={labelStyle}>ACTIVITY CATEGORY *</Typography>
              <FormControl fullWidth sx={inputStyle}>
                <Select
                  required
                  name="activity_category"
                  value={formData.activity_category}
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
                  name="activity_group"
                  value={formData.activity_group}
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
                  name="activity_type"
                  value={formData.activity_type}
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
                  name="compliance_level"
                  value={formData.compliance_level}
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
          p: { xs: 1, sm: 1.5 }, 
          borderRadius: '2px',
          mb: { xs: 1, sm: 2 },
          width: '100%'
        }}>
          <Typography variant="subtitle2" sx={{ 
            color: '#000000', 
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            textAlign: 'center',
            width: '100%',
            mb: 1
          }}>
            CLICK TO SELECT TRACTS, ACCESS ROADS, AND ENVIRONMENTAL FEATURES
          </Typography>
          <Box sx={{ 
            height: { xs: '150px', sm: '200px' }, 
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
          p: { xs: 1, sm: 1.5 }, 
          borderRadius: '2px',
          mb: { xs: 1, sm: 2 },
          flex: 1
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 1, 
            color: '#000000', 
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem' },
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
                minHeight: { xs: '150px', sm: '200px' },
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
                padding: { xs: '8px', sm: '12px' },
              }
            }}
          />
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
            onClick={() => navigate('/project-documents')}
            sx={{
              backgroundColor: '#666666',
              '&:hover': { backgroundColor: '#444444' },
              height: { xs: '40px', sm: '32px' },
              color: '#ffffff',
              width: { xs: '100%', sm: 'auto' }
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
              height: { xs: '40px', sm: '32px' },
              color: '#ffffff',
              width: { xs: '100%', sm: 'auto' }
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
              height: { xs: '40px', sm: '32px' },
              color: '#ffffff',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            ADD PHOTOS
          </Button>
        </Box>
      </form>
    </Box>
  );
};

// export default ReportForm; 