import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RAIN_GAGE_LOCATIONS = [
  'North Site',
  'South Site',
  'East Site',
  'West Site',
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
  inspection_date: '',
  precipitation_date: '',
  inspector_name: '',
  spread: '',
  precipitation_data: [
    { location: '', rain: '', snow: '' },
  ],
  soil_dry: false,
  soil_wet: false,
  soil_saturated: false,
  soil_frozen: false,
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
        precipitation_date: header.precipitation_date || null,
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
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New SWPPP Report
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={4}>
            {/* Check One */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Check One:</Typography>
            <Box>
              <Checkbox
                checked={header.inspection_type === 'routine'}
                onChange={() => setHeader((prev) => ({ ...prev, inspection_type: 'routine' }))}
                size="small"
              /> Routine Weekly Inspection
            </Box>
            <Box>
              <Checkbox
                checked={header.inspection_type === 'precip'}
                onChange={() => setHeader((prev) => ({ ...prev, inspection_type: 'precip' }))}
                size="small"
              /> Precipitation Event &gt; 0.25"
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            {/* Precipitation Data */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Precipitation Data:</Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              width: '100%'
            }}>
                  {Array.isArray(header.precipitation_data) && header.precipitation_data.map((row, idx) => (
                <Box key={idx} sx={{ 
                  p: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  width: '100%'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Rain Gauge {idx + 1}</Typography>
                        <TextField
                          value={row.location}
                          onChange={e => handlePrecipitationDataChange(idx, 'location', e.target.value)}
                          size="small"
                          placeholder="Rain Gage Location"
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Rain</Typography>
                          <TextField
                            value={row.rain}
                            onChange={e => handlePrecipitationDataChange(idx, 'rain', e.target.value)}
                            size="small"
                        placeholder="Rain (in)"
                        fullWidth
                          />
                        </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Snow</Typography>
                          <TextField
                            value={row.snow}
                            onChange={e => handlePrecipitationDataChange(idx, 'snow', e.target.value)}
                            size="small"
                        placeholder="Snow (in)"
                        fullWidth
                          />
                    </Box>
                        </Box>
                  <Button 
                    color="error" 
                    onClick={() => handleRemoveRainGage(idx)} 
                    disabled={header.precipitation_data.length === 1}
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  >
                          Remove
                        </Button>
                </Box>
              ))}
              <Button 
                onClick={handleAddRainGage} 
                size="small"
                sx={{ width: '200px', alignSelf: 'flex-start' }}
              >
                Add Rain Gage
              </Button>
            </Box>
          </Grid>
          {/* Row 2 */}
          <Grid item xs={12} md={6}>
            {/* Weather Conditions Section */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Weather Conditions:</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Sky Cover</Typography>
            <TextField
              select
              name="weather_conditions"
              value={header.weather_conditions}
              onChange={handleHeaderChange}
              sx={{ width: '100%', mb: 1 }}
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="">Select...</option>
              {WEATHER_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </TextField>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Temperature</Typography>
            <TextField
              label="Temperature (°F)"
              name="temperature"
              value={header.temperature}
              onChange={handleHeaderChange}
              size="small"
              sx={{ width: '100%', mb: 1 }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Precipitation Type</Typography>
            <TextField
              select
              name="precipitation_type"
              value={header.precipitation_type}
              onChange={handleHeaderChange}
              sx={{ width: '100%' }}
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="">Select...</option>
              {PRECIP_TYPE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Soil Conditions */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Soil Conditions:</Typography>
            <Box>
              <Checkbox
                name="soil_dry"
                checked={header.soil_dry}
                onChange={handleHeaderChange}
                size="small"
              /> Dry
            </Box>
            <Box>
              <Checkbox
                name="soil_wet"
                checked={header.soil_wet}
                onChange={handleHeaderChange}
                size="small"
              /> Wet
            </Box>
            <Box>
              <Checkbox
                name="soil_saturated"
                checked={header.soil_saturated}
                onChange={handleHeaderChange}
                size="small"
              /> Saturated
            </Box>
            <Box>
              <Checkbox
                name="soil_frozen"
                checked={header.soil_frozen}
                onChange={handleHeaderChange}
                size="small"
              /> Frozen
            </Box>
          </Grid>
          {/* Row 3 */}
          <Grid item xs={12} sx={{ width: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Additional Comments:</Typography>
            <TextField
              name="additional_comments"
              value={header.additional_comments}
              onChange={handleHeaderChange}
              multiline
              minRows={2}
              fullWidth
              sx={{ width: '100%' }}
              size="small"
              inputProps={{ maxLength: 500 }}
            />
          </Grid>
        </Grid>
        {/* Checklist Items */}
        <Typography variant="h6" gutterBottom>Checklist Items</Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 3
        }}>
              {items.map((item, idx) => (
            <Paper key={idx} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Location</Typography>
                  <Typography>{item.location}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>LL Number</Typography>
                  <Typography>{item.ll_number}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Feature Details</Typography>
                  <Typography>{item.feature_details}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Inspector ID</Typography>
                  <Typography>{item.inspector_id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Soil Disturbed?</Typography>
                  <Typography>{item.soil_presently_disturbed ? 'Yes' : 'No'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Inspection Date</Typography>
                  <Typography>{item.inspection_date}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Inspection Time</Typography>
                  <Typography>{item.inspection_time}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>ECD Functional?</Typography>
                  <Typography>{item.ecd_functional ? 'Yes' : 'No'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>ECD Needs Maintenance?</Typography>
                  <Typography>{item.ecd_needs_maintenance ? 'Yes' : 'No'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Date Corrected</Typography>
                  <Typography>{item.date_corrected}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Comments</Typography>
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
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Add New Item</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="location"
                  value={newItem.location}
                  onChange={handleItemChange}
                  label="Location"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="ll_number"
                  value={newItem.ll_number}
                  onChange={handleItemChange}
                  label="LL Number"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="feature_details"
                  value={newItem.feature_details}
                  onChange={handleItemChange}
                  label="Feature Details"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="inspector_id"
                  value={newItem.inspector_id}
                  onChange={handleItemChange}
                  label="Inspector ID"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Checkbox
                    name="soil_presently_disturbed"
                    checked={newItem.soil_presently_disturbed}
                    onChange={handleItemChange}
                  />
                  <Typography>Soil Disturbed?</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="inspection_date"
                  type="date"
                  value={newItem.inspection_date}
                  onChange={handleItemChange}
                  label="Inspection Date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="inspection_time"
                  type="time"
                  value={newItem.inspection_time}
                  onChange={handleItemChange}
                  label="Inspection Time"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Checkbox
                    name="ecd_functional"
                    checked={newItem.ecd_functional}
                    onChange={handleItemChange}
                  />
                  <Typography>ECD Functional?</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Checkbox
                    name="ecd_needs_maintenance"
                    checked={newItem.ecd_needs_maintenance}
                    onChange={handleItemChange}
                  />
                  <Typography>ECD Needs Maintenance?</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="date_corrected"
                  type="date"
                  value={newItem.date_corrected}
                  onChange={handleItemChange}
                  label="Date Corrected"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="comments"
                  value={newItem.comments}
                  onChange={handleItemChange}
                  label="Comments"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  onClick={handleAddItem}
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Add Item
                </Button>
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