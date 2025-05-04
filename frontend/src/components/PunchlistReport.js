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
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PunchlistReport = ({ reportId: initialReportId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reportId, setReportId] = useState(initialReportId);
  const [items, setItems] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(!initialReportId);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItem, setEditingItem] = useState({});
  const [newItem, setNewItem] = useState({
    spread: '',
    inspector: '',
    start_station: '',
    end_station: '',
    feature: '',
    issue: '',
    recommendations: '',
  });

  useEffect(() => {
    if (!reportId) {
      const createPunchListReport = async () => {
        try {
          setLoading(true);
          const today = new Date().toISOString().split('T')[0];
          const response = await api.post('/reports/', {
            report_type: 'Punch List',
            daily_activities: '',
            weather_conditions: 'N/A',
            title: 'Punch List',
            description: '',
            location: '',
            date: today,
          });
          setReportId(response.data.id);
          setLoading(false);
          console.log('Created Punch List report with id:', response.data.id);
        } catch (error) {
          setLoading(false);
          console.error('Error creating Punch List report:', error);
        }
      };
      createPunchListReport();
    }
  }, [reportId]);

  useEffect(() => {
    console.log('PunchlistReport mounted, reportId:', reportId);
    if (reportId) {
      fetchReport();
      fetchItems();
    }
  }, [reportId]);

  useEffect(() => {
    console.log('PunchlistReport items:', items, 'reportId:', reportId);
    if (items.length === 0 && reportId) {
      const addTestItems = async () => {
        try {
          console.log('Attempting to add test items for reportId:', reportId);
          const res1 = await api.post(`/reports/${reportId}/punchlist-items/`, {
            spread: 'Test Spread 1',
            inspector: 'Test Inspector 1',
            start_station: '100',
            end_station: '200',
            feature: 'Test Feature 1',
            issue: 'Test Issue 1',
            recommendations: 'Test Rec 1',
          });
          console.log('Test item 1 response:', res1);
          const res2 = await api.post(`/reports/${reportId}/punchlist-items/`, {
            spread: 'Test Spread 2',
            inspector: 'Test Inspector 2',
            start_station: '300',
            end_station: '400',
            feature: 'Test Feature 2',
            issue: 'Test Issue 2',
            recommendations: 'Test Rec 2',
          });
          console.log('Test item 2 response:', res2);
          fetchItems();
        } catch (error) {
          console.error('Error adding test punchlist items:', error);
          alert('Error adding test punchlist items: ' + (error.response?.data ? JSON.stringify(error.response.data) : error.message));
        }
      };
      addTestItems();
    }
    // eslint-disable-next-line
  }, [items, reportId]);

  const fetchReport = async () => {
    try {
      const response = await api.get(`/reports/${reportId}/`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get(`/reports/${reportId}/punchlist-items/`);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching punchlist items:', error);
    }
  };

  // TEMP: Always allow editing for testing
  const canEdit = () => true;

  const handleAddItem = async () => {
    console.log('Add Item button clicked', newItem);
    try {
      await api.post(`/reports/${reportId}/punchlist-items/`, newItem);
      setNewItem({
        spread: '',
        inspector: '',
        start_station: '',
        end_station: '',
        feature: '',
        issue: '',
        recommendations: '',
      });
      fetchItems();
    } catch (error) {
      console.error('Error adding punchlist item:', error);
      let errorMsg = 'Error adding punchlist item.';
      if (error.response && error.response.data) {
        errorMsg += ' ' + JSON.stringify(error.response.data);
      }
      alert(errorMsg);
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

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setEditingItem(item);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItem({});
  };

  const handleSaveEdit = async () => {
    try {
      await api.patch(`/reports/${reportId}/punchlist-items/${editingItemId}/`, editingItem);
      setEditingItemId(null);
      setEditingItem({});
      fetchItems();
    } catch (error) {
      console.error('Error saving punchlist item:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingItem(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateItem = async (id, updatedData) => {
    try {
      await api.patch(`/reports/${reportId}/punchlist-items/${id}/`, updatedData);
      fetchItems();
    } catch (error) {
      console.error('Error updating punchlist item:', error);
    }
  };

  if (loading || !reportId) {
    return <Typography sx={{ mt: 4 }}>Loading Punch List report...</Typography>;
  }

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
                {editingItemId === item.id ? (
                  <>
                    <TableCell><TextField name="spread" value={editingItem.spread} onChange={handleEditChange} size="small" /></TableCell>
                    <TableCell><TextField name="inspector" value={editingItem.inspector} onChange={handleEditChange} size="small" /></TableCell>
                    <TableCell><TextField name="start_station" value={editingItem.start_station} onChange={handleEditChange} size="small" /></TableCell>
                    <TableCell><TextField name="end_station" value={editingItem.end_station} onChange={handleEditChange} size="small" /></TableCell>
                    <TableCell><TextField name="feature" value={editingItem.feature} onChange={handleEditChange} size="small" /></TableCell>
                    <TableCell><TextField name="issue" value={editingItem.issue} onChange={handleEditChange} size="small" /></TableCell>
                    <TableCell><TextField name="recommendations" value={editingItem.recommendations} onChange={handleEditChange} size="small" /></TableCell>
                    <TableCell><Checkbox checked={editingItem.completed} onChange={e => setEditingItem(prev => ({ ...prev, completed: e.target.checked }))} /></TableCell>
                    <TableCell>{item.inspector_signoff}</TableCell>
                    <TableCell>{item.completed_date}</TableCell>
                    <TableCell>
                      <IconButton onClick={handleSaveEdit}><SaveIcon /></IconButton>
                      <IconButton onClick={handleCancelEdit}><CancelIcon /></IconButton>
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
                      <Checkbox
                        checked={item.completed}
                        onChange={() => canEdit() && handleUpdateItem(item.id, { completed: !item.completed })}
                        disabled={!canEdit()}
                      />
                    </TableCell>
                    <TableCell>{item.inspector_signoff}</TableCell>
                    <TableCell>{item.completed_date}</TableCell>
                    <TableCell>
                      {canEdit() && (
                        <>
                          <IconButton onClick={() => handleEditItem(item)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteItem(item.id)}><DeleteIcon /></IconButton>
                        </>
                      )}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {canEdit() ? (
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
              onClick={() => { console.log('Add Item button clicked', newItem); handleAddItem(); }}
            >
              Add Item
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography color="error" sx={{ mt: 4 }}>
          You do not have permission to add items or this punchlist is finalized.
        </Typography>
      )}
    </Box>
  );
};

export default PunchlistReport; 