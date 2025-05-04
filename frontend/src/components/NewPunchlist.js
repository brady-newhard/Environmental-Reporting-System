import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const NewPunchlist = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    spread: '',
    inspector: '',
    start_station: '',
    end_station: '',
    feature: '',
    issue: '',
    recommendations: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingItem, setEditingItem] = useState({});

  const handleAddItem = () => {
    setItems([...items, newItem]);
    setNewItem({
      spread: '',
      inspector: '',
      start_station: '',
      end_station: '',
      feature: '',
      issue: '',
      recommendations: '',
    });
  };

  const handleDeleteItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleEditItem = (idx, updatedItem) => {
    setItems(items.map((item, i) => (i === idx ? updatedItem : item)));
  };

  const handleEditClick = (idx) => {
    setEditingIdx(idx);
    setEditingItem(items[idx]);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    setItems(items.map((item, i) => (i === editingIdx ? editingItem : item)));
    setEditingIdx(null);
    setEditingItem({});
  };

  const handleCancelEdit = () => {
    setEditingIdx(null);
    setEditingItem({});
  };

  const handleSubmitFinal = async () => {
    setSubmitting(true);
    try {
      // Create the PunchlistReport (metadata is backend-only, so minimal info)
      const response = await api.post('/punchlists/', {
        title: 'Punchlist', // or auto-generate if you want
        date: new Date().toISOString().split('T')[0],
      });
      const punchlistReportId = response.data.id;
      // Log the items payload for debugging
      console.log('Submitting punchlist items:', items);
      // Batch submit items to the new endpoint
      await api.post(`/punchlists/${punchlistReportId}/items/batch/`, { items });
      navigate(`/punchlist-report/${punchlistReportId}`);
    } catch (error) {
      console.error('Error submitting punchlist report:', error);
      alert('Error submitting punchlist report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Punch List
        </Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Punchlist Items
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Spread</TableCell>
                  <TableCell>Inspector</TableCell>
                  <TableCell>Start Station</TableCell>
                  <TableCell>End Station</TableCell>
                  <TableCell>Feature</TableCell>
                  <TableCell>Issue</TableCell>
                  <TableCell>Recommendations</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    {editingIdx === idx ? (
                      <>
                        <TableCell><TextField name="spread" value={editingItem.spread} onChange={handleEditChange} size="small" /></TableCell>
                        <TableCell><TextField name="inspector" value={editingItem.inspector} onChange={handleEditChange} size="small" /></TableCell>
                        <TableCell><TextField name="start_station" value={editingItem.start_station} onChange={handleEditChange} size="small" /></TableCell>
                        <TableCell><TextField name="end_station" value={editingItem.end_station} onChange={handleEditChange} size="small" /></TableCell>
                        <TableCell><TextField name="feature" value={editingItem.feature} onChange={handleEditChange} size="small" /></TableCell>
                        <TableCell><TextField name="issue" value={editingItem.issue} onChange={handleEditChange} size="small" /></TableCell>
                        <TableCell><TextField name="recommendations" value={editingItem.recommendations} onChange={handleEditChange} size="small" /></TableCell>
                        <TableCell>
                          <Button color="primary" onClick={handleSaveEdit}>Save</Button>
                          <Button color="inherit" onClick={handleCancelEdit}>Cancel</Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{item.spread}</TableCell>
                        <TableCell>{item.inspector}</TableCell>
                        <TableCell>{item.start_station}</TableCell>
                        <TableCell>{item.end_station}</TableCell>
                        <TableCell>{item.feature}</TableCell>
                        <TableCell>{item.issue}</TableCell>
                        <TableCell>{item.recommendations}</TableCell>
                        <TableCell>
                          <Button color="primary" onClick={() => handleEditClick(idx)}>Edit</Button>
                          <Button color="error" onClick={() => handleDeleteItem(idx)}>Delete</Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Add New Item
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="Spread"
                name="spread"
                value={newItem.spread}
                onChange={e => setNewItem({ ...newItem, spread: e.target.value })}
              />
              <TextField
                label="Inspector"
                name="inspector"
                value={newItem.inspector}
                onChange={e => setNewItem({ ...newItem, inspector: e.target.value })}
              />
              <TextField
                label="Start Station"
                name="start_station"
                value={newItem.start_station}
                onChange={e => setNewItem({ ...newItem, start_station: e.target.value })}
              />
              <TextField
                label="End Station"
                name="end_station"
                value={newItem.end_station}
                onChange={e => setNewItem({ ...newItem, end_station: e.target.value })}
              />
              <TextField
                label="Feature"
                name="feature"
                value={newItem.feature}
                onChange={e => setNewItem({ ...newItem, feature: e.target.value })}
              />
              <TextField
                label="Issue"
                name="issue"
                multiline
                value={newItem.issue}
                onChange={e => setNewItem({ ...newItem, issue: e.target.value })}
              />
              <TextField
                label="Recommendations"
                name="recommendations"
                multiline
                value={newItem.recommendations}
                onChange={e => setNewItem({ ...newItem, recommendations: e.target.value })}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                type="button"
                onClick={handleAddItem}
              >
                Add Item
              </Button>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/reports-dashboard')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitFinal}
            disabled={submitting || items.length === 0}
          >
            Submit Final Report
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NewPunchlist; 