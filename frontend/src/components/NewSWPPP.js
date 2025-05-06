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
        {/* Header Fields */}
        <Grid container spacing={2} mb={2}>
          {/* Row 1 */}
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
          <Grid item xs={12} md={4}>
            {/* Inspector Name/ID */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Date</Typography>
            <TextField
              label="Date"
              name="inspection_date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={header.inspection_date}
              onChange={handleHeaderChange}
              size="small"
              sx={{ width: '100%', mb: 1 }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Inspector Name</Typography>
            <TextField
              label="Inspector Name"
              name="inspector_name"
              value={header.inspector_name}
              onChange={handleHeaderChange}
              size="small"
              sx={{ width: '100%', mb: 1 }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Spread</Typography>
            <TextField
              label="Spread"
              name="spread"
              value={header.spread}
              onChange={handleHeaderChange}
              size="small"
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            {/* Precipitation Data Table */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Precipitation Data:</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rain Gage</TableCell>
                    <TableCell>Rain</TableCell>
                    <TableCell>Snow</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(header.precipitation_data) && header.precipitation_data.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <TextField
                          value={row.location}
                          onChange={e => handlePrecipitationDataChange(idx, 'location', e.target.value)}
                          size="small"
                          placeholder="Rain Gage Location"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            value={row.rain}
                            onChange={e => handlePrecipitationDataChange(idx, 'rain', e.target.value)}
                            size="small"
                            inputProps={{ maxLength: 4, style: { width: 50 } }}
                          />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>(in)</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            value={row.snow}
                            onChange={e => handlePrecipitationDataChange(idx, 'snow', e.target.value)}
                            size="small"
                            inputProps={{ maxLength: 4, style: { width: 50 } }}
                          />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>(in)</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button color="error" onClick={() => handleRemoveRainGage(idx)} disabled={header.precipitation_data.length === 1} size="small">
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Button onClick={handleAddRainGage} size="small">Add Rain Gage</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
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
        {/* Checklist Table */}
        <Typography variant="h6" gutterBottom>Checklist Items</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell>LL Number</TableCell>
                <TableCell>Feature Details</TableCell>
                <TableCell>Inspector ID</TableCell>
                <TableCell>Soil Disturbed?</TableCell>
                <TableCell>Inspection Date</TableCell>
                <TableCell>Inspection Time</TableCell>
                <TableCell>ECD Functional?</TableCell>
                <TableCell>ECD Needs Maintenance?</TableCell>
                <TableCell>Date Corrected</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.ll_number}</TableCell>
                  <TableCell>{item.feature_details}</TableCell>
                  <TableCell>{item.inspector_id}</TableCell>
                  <TableCell><Checkbox checked={item.soil_presently_disturbed} disabled /></TableCell>
                  <TableCell>{item.inspection_date}</TableCell>
                  <TableCell>{item.inspection_time}</TableCell>
                  <TableCell><Checkbox checked={item.ecd_functional} disabled /></TableCell>
                  <TableCell><Checkbox checked={item.ecd_needs_maintenance} disabled /></TableCell>
                  <TableCell>{item.date_corrected}</TableCell>
                  <TableCell>{item.comments}</TableCell>
                  <TableCell><Button color="error" onClick={() => handleDeleteItem(idx)}>Delete</Button></TableCell>
                </TableRow>
              ))}
              {/* Add Item Row */}
              <TableRow>
                <TableCell><TextField name="location" value={newItem.location} onChange={handleItemChange} /></TableCell>
                <TableCell><TextField name="ll_number" value={newItem.ll_number} onChange={handleItemChange} /></TableCell>
                <TableCell><TextField name="feature_details" value={newItem.feature_details} onChange={handleItemChange} /></TableCell>
                <TableCell><TextField name="inspector_id" value={newItem.inspector_id} onChange={handleItemChange} /></TableCell>
                <TableCell><Checkbox name="soil_presently_disturbed" checked={newItem.soil_presently_disturbed} onChange={handleItemChange} /></TableCell>
                <TableCell><TextField name="inspection_date" type="date" InputLabelProps={{ shrink: true }} value={newItem.inspection_date} onChange={handleItemChange} /></TableCell>
                <TableCell><TextField name="inspection_time" type="time" InputLabelProps={{ shrink: true }} value={newItem.inspection_time} onChange={handleItemChange} /></TableCell>
                <TableCell><Checkbox name="ecd_functional" checked={newItem.ecd_functional} onChange={handleItemChange} /></TableCell>
                <TableCell><Checkbox name="ecd_needs_maintenance" checked={newItem.ecd_needs_maintenance} onChange={handleItemChange} /></TableCell>
                <TableCell><TextField name="date_corrected" type="date" InputLabelProps={{ shrink: true }} value={newItem.date_corrected} onChange={handleItemChange} /></TableCell>
                <TableCell><TextField name="comments" value={newItem.comments} onChange={handleItemChange} /></TableCell>
                <TableCell><Button onClick={handleAddItem}>Add</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit} disabled={submitting || items.length === 0}>
          Submit Final Report
        </Button>
      </Paper>
    </Box>
  );
};

export default NewSWPPP; 