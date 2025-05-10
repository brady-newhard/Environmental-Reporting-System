import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import axios from 'axios';

const PunchlistReport = ({ reportId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [items, setItems] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    start_station: '',
    end_station: '',
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
      const response = await axios.get(`/api/reports/${reportId}/`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`/api/reports/${reportId}/punchlist_items/`);
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await axios.post(`/api/reports/${reportId}/punchlist_items/`, newItem);
      setItems([...items, response.data]);
      setNewItem({
        start_station: '',
        end_station: '',
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
      const response = await axios.put(`/api/reports/${reportId}/punchlist_items/${editingItem.id}/`, editingItem);
      setItems(items.map(item => item.id === editingItem.id ? response.data : item));
      setEditingItem(null);
    } catch (error) {
      console.error('Error editing item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`/api/reports/${reportId}/punchlist_items/${itemId}/`);
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleFinalize = async () => {
    try {
      await axios.post(`/api/reports/${reportId}/finalize/`);
      fetchReport();
    } catch (error) {
      console.error('Error finalizing report:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 3,
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      transform: isMobile ? 'scale(1)' : 'none',
      transformOrigin: 'top left'
    }}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
        Punchlist Report
      </Typography>

      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 4,
          width: '100%',
          overflowX: 'auto'
        }}
      >
        <Table size={isMobile ? "small" : "medium"}>
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
                    <TableCell>{item.start_station}</TableCell>
                    <TableCell>{item.end_station}</TableCell>
                    <TableCell>{item.feature}</TableCell>
                    <TableCell>{item.issue}</TableCell>
                    <TableCell>{item.recommendations}</TableCell>
                    <TableCell>
                  <Button
                    size="small"
                    onClick={() => setEditingItem(item)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </Button>
                    </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!report?.is_finalized && (
        <Paper sx={{ 
          p: isMobile ? 1 : 3,
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden'
        }}>
          <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
            Add New Item
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Location Information
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2, 
              mb: 2 
            }}>
              <TextField
                label="Start Station"
                value={newItem.start_station}
                onChange={(e) => setNewItem({ ...newItem, start_station: e.target.value })}
                fullWidth
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                label="End Station"
                value={newItem.end_station}
                onChange={(e) => setNewItem({ ...newItem, end_station: e.target.value })}
                fullWidth
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                label="Feature"
                value={newItem.feature}
                onChange={(e) => setNewItem({ ...newItem, feature: e.target.value })}
                fullWidth
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
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
              size={isMobile ? "small" : "medium"}
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
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
              size={isMobile ? "small" : "medium"}
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'flex-end',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddItem}
              fullWidth={isMobile}
            >
              Add Item
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFinalize}
              fullWidth={isMobile}
            >
              Submit Final Report
            </Button>
          </Box>
        </Paper>
      )}

      <Dialog 
        open={Boolean(editingItem)} 
        onClose={() => setEditingItem(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            pt: 2 
          }}>
            <TextField
              label="Start Station"
              value={editingItem?.start_station || ''}
              onChange={(e) => setEditingItem({ ...editingItem, start_station: e.target.value })}
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="End Station"
              value={editingItem?.end_station || ''}
              onChange={(e) => setEditingItem({ ...editingItem, end_station: e.target.value })}
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="Feature"
              value={editingItem?.feature || ''}
              onChange={(e) => setEditingItem({ ...editingItem, feature: e.target.value })}
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="Issue"
              value={editingItem?.issue || ''}
              onChange={(e) => setEditingItem({ ...editingItem, issue: e.target.value })}
              multiline
              rows={3}
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              label="Recommendations"
              value={editingItem?.recommendations || ''}
              onChange={(e) => setEditingItem({ ...editingItem, recommendations: e.target.value })}
              multiline
              rows={3}
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingItem(null)}>Cancel</Button>
          <Button onClick={handleEditItem} color="primary">
            Save
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PunchlistReport; 