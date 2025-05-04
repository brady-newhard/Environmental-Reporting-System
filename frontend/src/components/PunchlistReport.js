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
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) {
      fetchReport();
      fetchItems();
    }
  }, [reportId]);

  const canEdit = () => {
    if (!report) return false;
    return report.finalized === false && report.author === user?.id;
  };

  const fetchReport = async () => {
    try {
      const response = await api.get(`/punchlists/${reportId}/`);
      setReport(response.data);
      console.log('PunchlistReport loaded:', response.data);
    } catch (error) {
      console.error('Error fetching punchlist report:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get(`/punchlists/${reportId}/items/`);
      setItems(response.data);
      console.log('PunchlistItems loaded:', response.data);
    } catch (error) {
      console.error('Error fetching punchlist items:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const handleFinalize = async () => {
    try {
      await api.patch(`/punchlists/${reportId}/`, { finalized: true });
      fetchReport();
      fetchItems();
    } catch (error) {
      alert('Error finalizing punchlist report.');
    }
  };

  const handleAddItem = async () => {
    try {
      await api.post(`/punchlists/${reportId}/items/`, newItem);
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
      await api.delete(`/punchlists/${reportId}/items/${id}/`);
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
      await api.patch(`/punchlists/${reportId}/items/${editingItemId}/`, editingItem);
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
      await api.patch(`/punchlists/${reportId}/items/${id}/`, updatedData);
      fetchItems();
    } catch (error) {
      console.error('Error updating punchlist item:', error);
    }
  };

  if (loading || !report || !reportId) {
    return <Typography sx={{ mt: 4 }}>Loading Punch List report...</Typography>;
  }

  const showApprovalColumns = report && report.finalized === true;

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
              {showApprovalColumns && <TableCell>Completed</TableCell>}
              {showApprovalColumns && <TableCell>Inspector Signoff</TableCell>}
              {showApprovalColumns && <TableCell>Completed Date</TableCell>}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.item_number}</TableCell>
                {editingItemId === item.id ? (
                  <>
                    <TableCell><TextField name="spread" value={editingItem.spread} onChange={handleEditChange} size="small" disabled={!canEdit()} /></TableCell>
                    <TableCell><TextField name="inspector" value={editingItem.inspector} onChange={handleEditChange} size="small" disabled={!canEdit()} /></TableCell>
                    <TableCell><TextField name="start_station" value={editingItem.start_station} onChange={handleEditChange} size="small" disabled={!canEdit()} /></TableCell>
                    <TableCell><TextField name="end_station" value={editingItem.end_station} onChange={handleEditChange} size="small" disabled={!canEdit()} /></TableCell>
                    <TableCell><TextField name="feature" value={editingItem.feature} onChange={handleEditChange} size="small" disabled={!canEdit()} /></TableCell>
                    <TableCell><TextField name="issue" value={editingItem.issue} onChange={handleEditChange} size="small" disabled={!canEdit()} /></TableCell>
                    <TableCell><TextField name="recommendations" value={editingItem.recommendations} onChange={handleEditChange} size="small" disabled={!canEdit()} /></TableCell>
                    {showApprovalColumns && <TableCell><Checkbox checked={editingItem.completed} disabled /></TableCell>}
                    {showApprovalColumns && <TableCell>{item.inspector_signoff}</TableCell>}
                    {showApprovalColumns && <TableCell>{item.completed_date}</TableCell>}
                    <TableCell>
                      {canEdit() && <IconButton onClick={handleSaveEdit}><SaveIcon /></IconButton>}
                      {canEdit() && <IconButton onClick={handleCancelEdit}><CancelIcon /></IconButton>}
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
                    {showApprovalColumns && <TableCell><Checkbox checked={item.completed} disabled /></TableCell>}
                    {showApprovalColumns && <TableCell>{item.inspector_signoff}</TableCell>}
                    {showApprovalColumns && <TableCell>{item.completed_date}</TableCell>}
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
              disabled={!canEdit()}
            />
            <TextField
              label="Inspector"
              name="inspector"
              value={newItem.inspector}
              onChange={e => setNewItem({ ...newItem, inspector: e.target.value })}
              disabled={!canEdit()}
            />
            <TextField
              label="Start Station"
              name="start_station"
              value={newItem.start_station}
              onChange={e => setNewItem({ ...newItem, start_station: e.target.value })}
              disabled={!canEdit()}
            />
            <TextField
              label="End Station"
              name="end_station"
              value={newItem.end_station}
              onChange={e => setNewItem({ ...newItem, end_station: e.target.value })}
              disabled={!canEdit()}
            />
            <TextField
              label="Feature"
              name="feature"
              value={newItem.feature}
              onChange={e => setNewItem({ ...newItem, feature: e.target.value })}
              disabled={!canEdit()}
            />
            <TextField
              label="Issue"
              name="issue"
              multiline
              value={newItem.issue}
              onChange={e => setNewItem({ ...newItem, issue: e.target.value })}
              disabled={!canEdit()}
            />
            <TextField
              label="Recommendations"
              name="recommendations"
              multiline
              value={newItem.recommendations}
              onChange={e => setNewItem({ ...newItem, recommendations: e.target.value })}
              disabled={!canEdit()}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              type="button"
              onClick={handleAddItem}
              disabled={!canEdit()}
            >
              Add Item
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleFinalize}>
              Submit Final Report
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