import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialHeader = {
  inspection_type: '',
  inspection_date: '',
  precipitation_date: '',
  inspector_name: '',
  precipitation_rain_gage: false,
  precipitation_rain: false,
  precipitation_snow: false,
  soil_dry: false,
  soil_wet: false,
  soil_saturated: false,
  soil_frozen: false,
  notes: '',
  weather_conditions: '',
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField label="Inspector Name" name="inspector_name" value={header.inspector_name} onChange={handleHeaderChange} />
          <TextField label="Inspection Date" name="inspection_date" type="date" InputLabelProps={{ shrink: true }} value={header.inspection_date} onChange={handleHeaderChange} />
          {/* Add more header fields as needed */}
        </Box>
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