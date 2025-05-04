import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Checkbox,
  Typography,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const PunchlistReport = ({ reportId }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    item_number: '',
    spread: '',
    inspector: '',
    start_station: '',
    end_station: '',
    feature: '',
    issue: '',
    recommendations: '',
    completed: false,
  });

  useEffect(() => {
    if (reportId) {
      fetchItems();
    }
  }, [reportId]);

  const fetchItems = async () => {
    try {
      const response = await api.get(`/reports/${reportId}/punchlist-items/`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching punchlist items:', error);
    }
  };

  const handleAddItem = async () => {
    try {
      await api.post(`/reports/${reportId}/punchlist-items/`, newItem);
      setNewItem({
        item_number: '',
        spread: '',
        inspector: '',
        start_station: '',
        end_station: '',
        feature: '',
        issue: '',
        recommendations: '',
        completed: false,
      });
      fetchItems();
    } catch (error) {
      console.error('Error adding punchlist item:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/reports/${reportId}/punchlist-items/${id}/`);
      fetchItems();
    } catch (error) {
      console.error('Error deleting punchlist item:', error);
    }
  };

  const handleUpdateItem = async (id, updatedData) => {
    try {
      await api.patch(`/reports/${reportId}/punchlist-items/${id}/`, updatedData);
      fetchItems();
    } catch (error) {
      console.error('Error updating punchlist item:', error);
    }
  };

  const handleCheckboxChange = (item) => {
    handleUpdateItem(item.id, { completed: !item.completed });
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Punchlist Report
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item #</TableCell>
              <TableCell>Spread</TableCell>
              <TableCell>Inspector</TableCell>
              <TableCell>Start Station</TableCell>
              <TableCell>End Station</TableCell>
              <TableCell>Feature</TableCell>
              <TableCell>Issue</TableCell>
              <TableCell>Recommendations</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Inspector Signoff</TableCell>
              <TableCell>Completed Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.item_number}</TableCell>
                <TableCell>{item.spread}</TableCell>
                <TableCell>{item.inspector}</TableCell>
                <TableCell>{item.start_station}</TableCell>
                <TableCell>{item.end_station}</TableCell>
                <TableCell>{item.feature}</TableCell>
                <TableCell>{item.issue}</TableCell>
                <TableCell>{item.recommendations}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={item.completed}
                    onChange={() => handleCheckboxChange(item)}
                  />
                </TableCell>
                <TableCell>{item.inspector_signoff}</TableCell>
                <TableCell>{item.completed_date}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
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
            label="Item #"
            value={newItem.item_number}
            onChange={(e) => setNewItem({ ...newItem, item_number: e.target.value })}
          />
          <TextField
            label="Spread"
            value={newItem.spread}
            onChange={(e) => setNewItem({ ...newItem, spread: e.target.value })}
          />
          <TextField
            label="Inspector"
            value={newItem.inspector}
            onChange={(e) => setNewItem({ ...newItem, inspector: e.target.value })}
          />
          <TextField
            label="Start Station"
            value={newItem.start_station}
            onChange={(e) => setNewItem({ ...newItem, start_station: e.target.value })}
          />
          <TextField
            label="End Station"
            value={newItem.end_station}
            onChange={(e) => setNewItem({ ...newItem, end_station: e.target.value })}
          />
          <TextField
            label="Feature"
            value={newItem.feature}
            onChange={(e) => setNewItem({ ...newItem, feature: e.target.value })}
          />
          <TextField
            label="Issue"
            multiline
            value={newItem.issue}
            onChange={(e) => setNewItem({ ...newItem, issue: e.target.value })}
          />
          <TextField
            label="Recommendations"
            multiline
            value={newItem.recommendations}
            onChange={(e) => setNewItem({ ...newItem, recommendations: e.target.value })}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
          >
            Add Item
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PunchlistReport; 