import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const PunchlistReport = ({ reportId }) => {
  const [items, setItems] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    startStation: '',
    endStation: '',
    feature: '',
    issue: '',
    recommendations: '',
  });

  useEffect(() => {
    fetchReport();
    fetchItems();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`/api/reports/${reportId}`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`/api/reports/${reportId}/items`);
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await axios.post(`/api/reports/${reportId}/items`, newItem);
      setItems([...items, response.data]);
      setNewItem({
        startStation: '',
        endStation: '',
        feature: '',
        issue: '',
        recommendations: '',
      });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleEditItem = async () => {
    try {
      const response = await axios.put(`/api/reports/${reportId}/items/${editingItem.id}`, editingItem);
      setItems(items.map(item => item.id === editingItem.id ? response.data : item));
      setEditingItem(null);
    } catch (error) {
      console.error('Error editing item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`/api/reports/${reportId}/items/${itemId}`);
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleFinalize = async () => {
    try {
      await axios.put(`/api/reports/${reportId}/finalize`);
      fetchReport();
    } catch (error) {
      console.error('Error finalizing report:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Punchlist Report
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Start Station</TableCell>
              <TableCell>End Station</TableCell>
              <TableCell>Feature</TableCell>
              <TableCell>Issue</TableCell>
              <TableCell>Recommendations</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.startStation}</TableCell>
                <TableCell>{item.endStation}</TableCell>
                <TableCell>{item.feature}</TableCell>
                <TableCell>{item.issue}</TableCell>
                <TableCell>{item.recommendations}</TableCell>
                <TableCell>
                  <IconButton onClick={() => setEditingItem(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!report?.finalized && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Item
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Location Information
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Start Station"
                value={newItem.startStation}
                onChange={(e) => setNewItem({ ...newItem, startStation: e.target.value })}
                fullWidth
              />
              <TextField
                label="End Station"
                value={newItem.endStation}
                onChange={(e) => setNewItem({ ...newItem, endStation: e.target.value })}
                fullWidth
              />
              <TextField
                label="Feature"
                value={newItem.feature}
                onChange={(e) => setNewItem({ ...newItem, feature: e.target.value })}
                fullWidth
              />
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Issue Details
            </Typography>
            <TextField
              label="Issue"
              value={newItem.issue}
              onChange={(e) => setNewItem({ ...newItem, issue: e.target.value })}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recommendations
            </Typography>
            <TextField
              label="Recommendations"
              value={newItem.recommendations}
              onChange={(e) => setNewItem({ ...newItem, recommendations: e.target.value })}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleAddItem}>
              Add Item
            </Button>
            <Button variant="contained" color="primary" onClick={handleFinalize}>
              Submit Final Report
            </Button>
          </Box>
        </Box>
      )}

      <Dialog open={!!editingItem} onClose={() => setEditingItem(null)}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Start Station"
              value={editingItem?.startStation || ''}
              onChange={(e) => setEditingItem({ ...editingItem, startStation: e.target.value })}
              fullWidth
            />
            <TextField
              label="End Station"
              value={editingItem?.endStation || ''}
              onChange={(e) => setEditingItem({ ...editingItem, endStation: e.target.value })}
              fullWidth
            />
            <TextField
              label="Feature"
              value={editingItem?.feature || ''}
              onChange={(e) => setEditingItem({ ...editingItem, feature: e.target.value })}
              fullWidth
            />
            <TextField
              label="Issue"
              value={editingItem?.issue || ''}
              onChange={(e) => setEditingItem({ ...editingItem, issue: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Recommendations"
              value={editingItem?.recommendations || ''}
              onChange={(e) => setEditingItem({ ...editingItem, recommendations: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingItem(null)}>Cancel</Button>
          <Button onClick={handleEditItem} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PunchlistReport; 