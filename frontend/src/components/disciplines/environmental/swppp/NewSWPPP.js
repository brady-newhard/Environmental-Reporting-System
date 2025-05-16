import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, FormControl, InputLabel, Select, MenuItem, Divider, IconButton } from '@mui/material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import SaveIcon from '@mui/icons-material/Save';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import SendIcon from '@mui/icons-material/Send';
import api from '../../../../services/api';
import axios from 'axios';
import PageHeader from '../../../../components/common/PageHeader';

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
  const location = useLocation();
  const [header, setHeader] = useState(initialHeader);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState(initialItem);
  const [submitting, setSubmitting] = useState(false);
  const [newItemPhotos, setNewItemPhotos] = useState([]);
  const [photoComments, setPhotoComments] = useState([]);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [isDraft, setIsDraft] = useState(false);

  const clearForm = () => {
    setHeader(initialHeader);
    setItems([]);
    setNewItem(initialItem);
    setNewItemPhotos([]);
    setPhotoComments([]);
    setDraftId(null);
    setIsDraft(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const draftIdParam = params.get('draftId');
    if (draftIdParam) {
      const draft = JSON.parse(localStorage.getItem(`swppp_draft_${draftIdParam}`));
      if (draft) {
        setHeader(draft.header);
        setItems(draft.items);
        setDraftId(draft.id);
        setIsDraft(true);
      }
    } else {
      clearForm();
    }
  }, [location.search]);

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
    // Add the item to the local state
    setItems([...items, { ...newItem, photos: [...newItemPhotos], photoComments: [...photoComments] }]);
    setNewItem(initialItem);
    setNewItemPhotos([]);
    setPhotoComments([]);
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

  const handleEditItem = (idx) => {
    const itemToEdit = items[idx];
    setNewItem({
      location: itemToEdit.location,
      ll_number: itemToEdit.ll_number,
      feature_details: itemToEdit.feature_details,
      inspector_id: itemToEdit.inspector_id,
      soil_presently_disturbed: itemToEdit.soil_presently_disturbed,
      inspection_date: itemToEdit.inspection_date,
      inspection_time: itemToEdit.inspection_time,
      ecd_functional: itemToEdit.ecd_functional,
      ecd_needs_maintenance: itemToEdit.ecd_needs_maintenance,
      date_corrected: itemToEdit.date_corrected,
      comments: itemToEdit.comments
    });
    setNewItemPhotos(itemToEdit.photos || []);
    setPhotoComments(itemToEdit.photoComments || []);
    setEditingItemIndex(idx);
  };

  const handleUpdateItem = () => {
    if (editingItemIndex === null) return;

    const updatedItems = [...items];
    updatedItems[editingItemIndex] = {
      ...newItem,
      photos: [...newItemPhotos],
      photoComments: [...photoComments]
    };
    setItems(updatedItems);
    setNewItem(initialItem);
    setNewItemPhotos([]);
    setPhotoComments([]);
    setEditingItemIndex(null);
  };

  const handleCancelEdit = () => {
    setNewItem(initialItem);
    setNewItemPhotos([]);
    setPhotoComments([]);
    setEditingItemIndex(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Create the SWPPP report
      const response = await axios.post('/api/environmental/swppp/reports/', {
        ...header,
        inspection_date: header.inspection_date || null,
        precipitation_date: header.precipitation_date || null
      });
      const newReportId = response.data.id;
      
      // Create each item with its photos
      for (const item of items) {
        // First add the item
        const itemResponse = await axios.post(`/api/environmental/swppp/reports/${newReportId}/items/`, {
          location: item.location,
          ll_number: item.ll_number,
          feature_details: item.feature_details,
          inspector_id: item.inspector_id,
          soil_presently_disturbed: item.soil_presently_disturbed,
          inspection_date: item.inspection_date,
          inspection_time: item.inspection_time,
          ecd_functional: item.ecd_functional,
          ecd_needs_maintenance: item.ecd_needs_maintenance,
          date_corrected: item.date_corrected,
          comments: item.comments
        });

        // Then upload any photos associated with this item
        if (item.photos && item.photos.length > 0) {
          const photoPromises = item.photos.map(async (photo, index) => {
            const formData = new FormData();
            formData.append('image', photo instanceof File ? photo : await fetch(photo).then(r => r.blob()));
            formData.append('location', item.location);
            formData.append('description', item.photoComments[index] || '');

            return axios.post(`/api/environmental/swppp/reports/${newReportId}/photos/`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          });

          await Promise.all(photoPromises);
        }
      }
      
      // Clean up any draft data
      if (draftId) {
        localStorage.removeItem(`swppp_draft_${draftId}`);
      }
      
      navigate(`/swppp-report/${newReportId}`);
    } catch (error) {
      alert('Error submitting SWPPP report.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = () => {
    const draft = {
      id: draftId || Date.now().toString(),
      header,
      items: items.map(item => ({
        ...item,
        photos: item.photos.map(photo => {
          if (photo instanceof File) {
            return URL.createObjectURL(photo);
          }
          return photo;
        })
      })),
      lastModified: new Date().toISOString()
    };
    localStorage.setItem(`swppp_draft_${draft.id}`, JSON.stringify(draft));
    setDraftId(draft.id);
    setIsDraft(true);
  };

  const handleExit = () => {
    if (!isDraft) {
      if (window.confirm('You have unsaved changes. Would you like to save before exiting?')) {
        saveDraft();
      }
    }
    navigate('/reports');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete?')) {
      if (draftId) {
        localStorage.removeItem(`swppp_draft_${draftId}`);
      }
      navigate('/reports');
    }
  };

  return (
    <Box sx={{ mt: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <PageHeader 
        title="SWPPP Report"
        backPath="/environmental/reports"
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }}
      />
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
        {items.length > 0 && (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table sx={{ 
              '& .MuiTableCell-root': {
                borderRight: '1px solid rgba(224, 224, 224, 1)',
                '&:last-child': {
                  borderRight: 'none'
                }
              }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Station Start</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Station End</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Inspector ID</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Soil Disturbed?</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Inspection Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Inspection Time</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>ECD Functional?</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'normal', maxWidth: '100px' }}>ECD Needs<br />Maintenance?</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '25%' }}>Comments</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Photos</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell align="center">{item.location}</TableCell>
                    <TableCell align="center">{item.ll_number}</TableCell>
                    <TableCell align="center">{item.inspector_id}</TableCell>
                    <TableCell align="center">{item.soil_presently_disturbed ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{item.inspection_date}</TableCell>
                    <TableCell align="center">{item.inspection_time}</TableCell>
                    <TableCell align="center">{item.ecd_functional ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'normal', maxWidth: '100px' }}>{item.ecd_needs_maintenance ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="center" sx={{ width: '25%' }}>{item.comments}</TableCell>
                    <TableCell align="center">
                      {item.photos && item.photos.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {item.photos.map((photo, photoIdx) => (
                            <Box
                              key={photoIdx}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                '&:hover': {
                                  opacity: 0.9
                                }
                              }}
                              onClick={() => { setSelectedPhotoIdx(photoIdx); setPhotoDialogOpen(true); }}
                            >
                              <img
                                src={photo instanceof File ? URL.createObjectURL(photo) : photo}
                                alt={`Preview ${photoIdx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        'No photos'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditItem(idx)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteItem(idx)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {/* Add New Item Form */}
        <Paper sx={{ p: 3, bgcolor: '#f5f5f5', width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            {editingItemIndex !== null ? 'Edit Item' : 'Add New Item'}
          </Typography>
          <Grid container spacing={2} sx={{ width: '100%' }}>
            {/* Row 1: Inspector ID, Station Start, Station End - responsive */}
            <Grid item xs={12} container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="inspector_id"
                  value={newItem.inspector_id}
                  onChange={handleItemChange}
                  label="Inspector ID"
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="location"
                  value={newItem.location}
                  onChange={handleItemChange}
                  label="Station Start"
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="ll_number"
                  value={newItem.ll_number}
                  onChange={handleItemChange}
                  label="Station End"
                  size="small"
                  fullWidth
                />
              </Grid>
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
              {newItemPhotos.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Photo Preview:</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {newItemPhotos.map((photo, idx) => (
                      <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 130 }}>
                        <Typography variant="caption" sx={{ mb: 0.5 }}>{`Photo ${idx + 1}`}</Typography>
                        <Box
                          sx={{
                            width: 120,
                            height: 120,
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.9
                            }
                          }}
                          onClick={() => { setSelectedPhotoIdx(idx); setPhotoDialogOpen(true); }}
                        >
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${idx + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setNewItemPhotos(photos => photos.filter((_, i) => i !== idx));
                            setPhotoComments(comments => comments.filter((_, i) => i !== idx));
                          }}
                          sx={{ mt: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                  {/* Large photo dialog */}
                  <Dialog 
                    open={photoDialogOpen} 
                    onClose={() => setPhotoDialogOpen(false)} 
                    maxWidth="md" 
                    fullWidth
                    PaperProps={{
                      sx: {
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        width: 'auto',
                        height: 'auto',
                        position: 'relative'
                      }
                    }}
                  >
                    <IconButton
                      onClick={() => setPhotoDialogOpen(false)}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        zIndex: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                    <DialogTitle>
                      {selectedPhotoIdx !== null ? `Photo ${selectedPhotoIdx + 1}` : 'Photo'}
                    </DialogTitle>
                    <DialogContent
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 2,
                        gap: 2,
                        height: 'auto'
                      }}
                    >
                      {selectedPhotoIdx !== null && newItemPhotos[selectedPhotoIdx] && (
                        <Box
                          sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              height: 'auto',
                              maxHeight: '60vh',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <img
                              src={URL.createObjectURL(newItemPhotos[selectedPhotoIdx])}
                              alt={`Large Preview`}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '60vh',
                                objectFit: 'contain',
                                borderRadius: 8
                              }}
                            />
                          </Box>
                          <TextField
                            size="small"
                            placeholder="Add comment"
                            value={photoComments[selectedPhotoIdx] || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setPhotoComments(comments => {
                                const newComments = [...comments];
                                newComments[selectedPhotoIdx] = val;
                                return newComments;
                              });
                            }}
                            fullWidth
                            label="Photo Comment"
                            multiline
                            rows={3}
                            sx={{ 
                              '& .MuiInputBase-root': {
                                maxHeight: '120px'
                              }
                            }}
                          />
                        </Box>
                      )}
                    </DialogContent>
                  </Dialog>
                </Box>
              )}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  mt: 2,
                  width: '100%',
                }}
              >
                <Button variant="outlined" component="label" fullWidth>
                  Add Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    hidden
                    onChange={e => {
                      const files = Array.from(e.target.files);
                      setNewItemPhotos(prev => [...prev, ...files]);
                    }}
                  />
                </Button>
                {editingItemIndex !== null ? (
                  <>
                    <Button onClick={handleUpdateItem} variant="contained" color="primary" fullWidth>
                      Update Item
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outlined" color="error" fullWidth>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAddItem} variant="contained" fullWidth>
                    Add Item
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            p: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              size="large"
              fullWidth
              sx={{ minHeight: 48, flex: 1, minWidth: 0 }}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              onClick={saveDraft}
              size="large"
              fullWidth
              sx={{ minHeight: 48, flex: 1, minWidth: 0 }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={handleExit}
              size="large"
              fullWidth
              sx={{ minHeight: 48, flex: 1, minWidth: 0 }}
            >
              Exit
            </Button>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitting || items.length === 0}
              fullWidth
              sx={{ mt: 2 }}
              size="large"
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewSWPPP; 