import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../services/api';

const RAIN_GAGE_LOCATIONS = [
  'North Site',
  'South Site',
  'East Site',
  'West Site',
];

const INSPECTION_TYPES = [
  'Routine Weekly Inspection',
  'Precipitation Event > 0.25"'
];

const WEATHER_OPTIONS = [
  'Sunny',
  'Mostly Sunny',
  'Partly Sunny',
  'Cloudy',
  'Overcast',
];

const PRECIP_TYPE_OPTIONS = [
  'none', 'drizzle', 'rain', 'snow', 'sleet', 'hail'
];

const initialHeader = {
  inspection_type: '',
  project: '',
  spread: '',
  contractor: '',
  inspector: '',
  inspection_date: '',
  precipitation_data: [
    { location: '', rain: '', snow: '' },
  ],
  soil_conditions: '',
  weather_conditions: '',
  temperature: '',
  precipitation_type: '',
  additional_comments: '',
};

const initialItem = {
  location: '',
  ll_number: '',
  feature_details: '',
  inspector_id: '',
  soil_presently_disturbed: false,
  inspection_date: '',
  inspection_time: '',
  ecd_functional: false,
  ecd_needs_maintenance: false,
  date_corrected: '',
  comments: '',
};

const NewSWPPP = () => {
  const navigate = useNavigate();
  const [header, setHeader] = useState(initialHeader);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(initialItem);
  const [submitting, setSubmitting] = useState(false);

  const handleHeaderChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHeader((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddItem = () => {
    setItems([...items, newItem]);
    setNewItem(initialItem);
  };

  const handleDeleteItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handlePrecipitationDataChange = (idx, field, value) => {
    setHeader(prev => ({
      ...prev,
      precipitation_data: prev.precipitation_data.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      ),
    }));
  };

  const handleAddRainGage = () => {
    setHeader(prev => ({
      ...prev,
      precipitation_data: [
        ...prev.precipitation_data,
        { location: '', rain: '', snow: '' },
      ],
    }));
  };

  const handleRemoveRainGage = (idx) => {
    setHeader(prev => ({
      ...prev,
      precipitation_data: prev.precipitation_data.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Create the SWPPP report
      const response = await api.post('/swppp/reports/', {
        ...header,
        inspection_date: header.inspection_date || null,
      });
      const reportId = response.data.id;
      // Create each item
      for (const item of items) {
        await api.post(`/swppp/reports/${reportId}/items/`, item);
      }
      navigate(`/swppp-report/${reportId}`);
    } catch (error) {
      alert('Error submitting SWPPP report.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          onClick={() => navigate('/reports')}
          sx={{ 
            minWidth: '40px',
            width: '40px',
            height: '40px',
            backgroundColor: 'black',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
            borderRadius: '50%',
            p: 0
          }}
        >
          <ArrowBackIcon />
        </Button>
        <Typography variant="h4">
          Create New SWPPP Report
        </Typography>
      </Box>
      <Paper sx={{ p: { xs: 2, sm: 4, md: 6 }, mb: 4 }}>
        {/* Inspection Type Section */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Inspection Type
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <FormControl fullWidth size="small" sx={{ maxWidth: 300 }}>
            <InputLabel id="inspection-type-label">Inspection Type</InputLabel>
            <Select
              labelId="inspection-type-label"
              label="Inspection Type"
              value={header.inspection_type}
              onChange={e => setHeader(prev => ({ ...prev, inspection_type: e.target.value }))}
              size="small"
            >
              {INSPECTION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="inspection_date"
            type="date"
            value={header.inspection_date}
            onChange={handleHeaderChange}
            size="small"
            fullWidth
            label="Date"
            InputLabelProps={{ shrink: true }}
            sx={{ maxWidth: 200 }}
          />
        </Box>
        {/* Project Information Section */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Project Information
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              name="project"
              value={header.project}
              onChange={handleHeaderChange}
              size="small"
              fullWidth
              label="Project"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              name="spread"
              value={header.spread}
              onChange={handleHeaderChange}
              size="small"
              fullWidth
              label="Spread"
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              name="contractor"
              value={header.contractor}
              onChange={handleHeaderChange}
              size="small"
              fullWidth
              label="Contractor"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              name="inspector"
              value={header.inspector}
              onChange={handleHeaderChange}
              size="small"
              fullWidth
              label="Inspector"
            />
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />
        {/* Site Conditions Section */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Site Conditions
        </Typography>
        <Box sx={{ width: '100%', display: 'block', mb: 2 }}>
          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid item xs={12} sm={3} sx={{ minWidth: 180 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="weather-conditions-label">Sky Cover</InputLabel>
                <Select
                  labelId="weather-conditions-label"
                  label="Sky Cover"
                  value={header.weather_conditions}
                  onChange={handleHeaderChange}
                  name="weather_conditions"
                  fullWidth
                >
                  {WEATHER_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3} sx={{ minWidth: 180 }}>
              <TextField
                label="Temperature (°F)"
                name="temperature"
                value={header.temperature}
                onChange={handleHeaderChange}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={3} sx={{ minWidth: 180 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="precipitation-type-label">Precipitation Type</InputLabel>
                <Select
                  labelId="precipitation-type-label"
                  label="Precipitation Type"
                  value={header.precipitation_type}
                  onChange={handleHeaderChange}
                  name="precipitation_type"
                  fullWidth
                >
                  {PRECIP_TYPE_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3} sx={{ minWidth: 180 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="soil-conditions-label">Soil Conditions</InputLabel>
                <Select
                  labelId="soil-conditions-label"
                  label="Soil Conditions"
                  value={header.soil_conditions}
                  onChange={handleHeaderChange}
                  name="soil_conditions"
                  fullWidth
                >
                  <MenuItem value="Dry">Dry</MenuItem>
                  <MenuItem value="Wet">Wet</MenuItem>
                  <MenuItem value="Saturated">Saturated</MenuItem>
                  <MenuItem value="Frozen">Frozen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        <TableContainer sx={{ mb: 4 }}>
          <Table size="small" sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
            <TableBody>
              {/* Precipitation Data Row (Rain Gauge) */}
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Array.isArray(header.precipitation_data) && header.precipitation_data.map((row, idx) => (
                      <Box key={idx} sx={{ 
                        p: 2,
                        bgcolor: '#f5f5f5',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <TextField
                              value={row.location}
                              onChange={e => handlePrecipitationDataChange(idx, 'location', e.target.value)}
                              size="small"
                              fullWidth
                              label={`Rain Gauge Location ${idx + 1}`}
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              value={row.rain}
                              onChange={e => handlePrecipitationDataChange(idx, 'rain', e.target.value)}
                              size="small"
                              fullWidth
                              label="Rain (in)"
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              value={row.snow}
                              onChange={e => handlePrecipitationDataChange(idx, 'snow', e.target.value)}
                              size="small"
                              fullWidth
                              label="Snow (in)"
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Button 
                              color="error" 
                              onClick={() => handleRemoveRainGage(idx)} 
                              disabled={header.precipitation_data.length === 1}
                              size="small"
                              sx={{ mt: { xs: 2, md: 0 } }}
                            >
                              Remove
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    <Button 
                      onClick={handleAddRainGage} 
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      sx={{ 
                        width: '200px', 
                        alignSelf: 'flex-start',
                        borderColor: 'primary.main',
                        '&:hover': {
                          borderColor: 'primary.dark',
                        }
                      }}
                    >
                      Add Rain Gage
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
              {/* Additional Comments Row */}
              <TableRow>
                <TableCell colSpan={4}>
                  <TextField
                    name="additional_comments"
                    value={header.additional_comments}
                    onChange={handleHeaderChange}
                    multiline
                    minRows={2}
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 500 }}
                    label="Additional Comments"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 3 }} />
        {/* Checklist Items Section */}
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Checklist Items</Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 3,
          width: '100%'
        }}>
          {items.map((item, idx) => (
            <Paper key={idx} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Location</Typography>
                  <Typography>{item.location}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>LL Number</Typography>
                  <Typography>{item.ll_number}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Inspector ID</Typography>
                  <Typography>{item.inspector_id}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Feature Details</Typography>
                  <Typography>{item.feature_details}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
                      <InputLabel id={`soil-disturbed-label`}>Soil Disturbed?</InputLabel>
                      <Select
                        labelId={`soil-disturbed-label`}
                        name="soil_presently_disturbed"
                        value={item.soil_presently_disturbed ? 'Yes' : 'No'}
                        label="Soil Disturbed?"
                        onChange={e => {
                          // Handle soil disturbed change
                        }}
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField 
                      label="Inspection Date" 
                      value={item.inspection_date}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                    <TextField 
                      label="Inspection Time" 
                      value={item.inspection_time}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1, minWidth: 200 }}
                    />
                    <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
                      <InputLabel id={`ecd-functional-label`}>ECD Functional?</InputLabel>
                      <Select
                        labelId={`ecd-functional-label`}
                        name="ecd_functional"
                        value={item.ecd_functional ? 'Yes' : 'No'}
                        label="ECD Functional?"
                        onChange={e => {
                          // Handle ECD functional change
                        }}
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
                      <InputLabel id={`ecd-needs-maintenance-label`}>ECD Needs Maintenance?</InputLabel>
                      <Select
                        labelId={`ecd-needs-maintenance-label`}
                        name="ecd_needs_maintenance"
                        value={item.ecd_needs_maintenance ? 'Yes' : 'No'}
                        label="ECD Needs Maintenance?"
                        onChange={e => {
                          // Handle ECD needs maintenance change
                        }}
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Comments</Typography>
                  <Typography>{item.comments}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    color="error" 
                    onClick={() => handleDeleteItem(idx)}
                    sx={{ mt: 1 }}
                  >
                    Delete
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
          {/* Add New Item Form */}
          <Paper sx={{ p: 3, bgcolor: '#f5f5f5', width: '100%' }}>
            <Grid container spacing={2} sx={{ width: '100%' }}>
              {/* Row 1: Inspector ID, Station Start, Station End - each 25% width */}
              <Grid item xs={12} md={3} sx={{ width: '25%' }}>
                <TextField 
                  name="inspector_id" 
                  value={newItem.inspector_id} 
                  onChange={handleItemChange} 
                  label="Inspector ID" 
                  fullWidth 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12} md={3} sx={{ width: '25%' }}>
                <TextField 
                  name="location" 
                  value={newItem.location} 
                  onChange={handleItemChange} 
                  label="Station Start" 
                  fullWidth 
                  size="small" 
                />
              </Grid>
              <Grid item xs={12} md={3} sx={{ width: '25%' }}>
                <TextField 
                  name="ll_number" 
                  value={newItem.ll_number} 
                  onChange={handleItemChange} 
                  label="Station End" 
                  fullWidth 
                  size="small" 
                />
              </Grid>
              {/* Row 2: Five fields with adjusted widths */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: '100%' }}>
                  <FormControl size="small" sx={{ flex: '1 1 18%', minWidth: 150 }}>
                    <InputLabel id="soil-disturbed-label">Soil Disturbed?</InputLabel>
                    <Select
                      labelId="soil-disturbed-label"
                      name="soil_presently_disturbed"
                      value={newItem.soil_presently_disturbed ? 'Yes' : 'No'}
                      label="Soil Disturbed?"
                      onChange={e => setNewItem(prev => ({ ...prev, soil_presently_disturbed: e.target.value === 'Yes' }))}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField 
                    name="inspection_date" 
                    type="date" 
                    value={newItem.inspection_date} 
                    onChange={handleItemChange} 
                    label="Inspection Date" 
                    size="small" 
                    InputLabelProps={{ shrink: true }} 
                    sx={{ flex: '1 1 18%', minWidth: 150 }} 
                  />
                  <TextField 
                    name="inspection_time" 
                    type="time" 
                    value={newItem.inspection_time} 
                    onChange={handleItemChange} 
                    label="Inspection Time" 
                    size="small" 
                    InputLabelProps={{ shrink: true }} 
                    sx={{ flex: '1 1 18%', minWidth: 150 }} 
                  />
                  <FormControl size="small" sx={{ flex: '1 1 18%', minWidth: 150 }}>
                    <InputLabel id="ecd-functional-label">ECD Functional?</InputLabel>
                    <Select
                      labelId="ecd-functional-label"
                      name="ecd_functional"
                      value={newItem.ecd_functional ? 'Yes' : 'No'}
                      label="ECD Functional?"
                      onChange={e => setNewItem(prev => ({ ...prev, ecd_functional: e.target.value === 'Yes' }))}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ flex: '1 1 18%', minWidth: 150 }}>
                    <InputLabel id="ecd-needs-maintenance-label">ECD Needs Maintenance?</InputLabel>
                    <Select
                      labelId="ecd-needs-maintenance-label"
                      name="ecd_needs_maintenance"
                      value={newItem.ecd_needs_maintenance ? 'Yes' : 'No'}
                      label="ECD Needs Maintenance?"
                      onChange={e => setNewItem(prev => ({ ...prev, ecd_needs_maintenance: e.target.value === 'Yes' }))}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Row 3: Comments - Full width, force 100% width */}
              <Grid item xs={12} sx={{ width: '100%' }}>
                <TextField 
                  name="comments" 
                  value={newItem.comments} 
                  onChange={handleItemChange} 
                  label="Comments" 
                  fullWidth 
                  multiline 
                  rows={2} 
                  size="small" 
                  sx={{ width: '100%' }}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="outlined" component="label">
                    Add Photo
                    <input type="file" accept="image/*" capture="environment" hidden onChange={e => { /* handle photo upload here */ }} />
                  </Button>
                  <Button onClick={handleAddItem} variant="contained">
                    Add Item
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 4 }} 
          onClick={handleSubmit} 
          disabled={submitting || items.length === 0}
        >
          Submit Final Report
        </Button>
      </Paper>
    </Box>
  );
};

export default NewSWPPP; 