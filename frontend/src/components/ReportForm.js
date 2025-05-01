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
} from '@mui/material';
import axios from 'axios';

const ReportForm = () => {
  const [formData, setFormData] = useState({
    date: '',
    author: '',
    otherFieldStaff: '',
    reportType: 'Site Inspection',
    weatherDescription: '',
    temperature: '',
    precipitationType: 'None',
    precipitationInches: '',
    notes: ''
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
      await axios.post('http://localhost:8000/api/reports/', formData, {
        withCredentials: true
      });
      alert('Report submitted successfully!');
      setFormData({
        date: '',
        author: '',
        otherFieldStaff: '',
        reportType: 'Site Inspection',
        weatherDescription: '',
        temperature: '',
        precipitationType: 'None',
        precipitationInches: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
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
      <Typography 
        variant="subtitle1" 
        sx={{ 
          color: '#fff', 
          backgroundColor: '#000000', 
          p: 1,
          mb: 1.5,
          borderRadius: '2px',
          fontWeight: 600
        }}
      >
        STEP 1: ENTER BASIC REPORT INFORMATION
      </Typography>

      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {/* Event Information Section */}
          <Box sx={{ 
            flex: 1, 
            bgcolor: '#e0e0e0', 
            p: 1.5, 
            borderRadius: '2px',
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#000000', fontWeight: 600 }}>
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
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#000000', fontWeight: 600 }}>
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

        {/* Notes Section - Full Width */}
        <Box sx={{ 
          bgcolor: '#e0e0e0', 
          p: 1.5, 
          borderRadius: '2px',
          mb: 2,
          flex: 1
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#000000', fontWeight: 600 }}>
            NOTES
          </Typography>
          <TextField
            fullWidth
            multiline
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            sx={{ 
              backgroundColor: '#fff', 
              borderRadius: '2px',
              height: 'calc(100% - 30px)',
              '& .MuiOutlinedInput-root': {
                height: '100%'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#000000'
              }
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            size="small"
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
            sx={{
              backgroundColor: '#000000',
              '&:hover': { backgroundColor: '#333333' },
              height: '32px',
              color: '#ffffff'
            }}
          >
            NEXT STEP
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ReportForm; 