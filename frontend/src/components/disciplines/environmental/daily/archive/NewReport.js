import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ProgressChartTable } from './ProgressChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NewReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reportType: '',
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/reports/', {
        ...formData,
        daily_activities: formData.description,
        weather_conditions: 'N/A',
      });
      navigate(`/project-documents`);
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Error creating report. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            onClick={() => navigate('/environmental/reports')}
            sx={{
              minWidth: '40px',
              width: '40px',
              height: '40px',
              backgroundColor: 'black',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
              borderRadius: '50%',
              p: 0,
            }}
          >
            <ArrowBackIcon />
          </Button>
          <Typography variant="h4" gutterBottom>
            Create New Report
          </Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    name="reportType"
                    value={formData.reportType}
                    onChange={handleChange}
                    label="Report Type"
                    required
                  >
                    <MenuItem value="Daily">Daily Report</MenuItem>
                    <MenuItem value="Progress">Progress Report</MenuItem>
                    <MenuItem value="Variance">Variance Report</MenuItem>
                    <MenuItem value="SWPPP">SWPPP Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{
                      backgroundColor: '#000000',
                      '&:hover': { backgroundColor: '#333333' },
                    }}
                  >
                    Create Report
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/environmental/reports')}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
        {formData.reportType === 'Progress' && (
          <Box sx={{ mt: 4 }}>
            <ProgressChartTable />
          </Box>
        )}
      </Box>
    </Container>
  );
};

// export default NewReport; 