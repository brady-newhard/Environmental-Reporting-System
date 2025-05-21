import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import PageHeader from '../../../../components/common/PageHeader';

const DailyUtilityReportDrafts = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    // Get all drafts from localStorage
    const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('daily_utility_draft_'));
    const draftData = draftKeys.map(key => {
      const data = JSON.parse(localStorage.getItem(key));
      return {
        id: key,
        ...data,
        date: new Date(data.header?.date || Date.now()).toLocaleDateString(),
      };
    });
    setDrafts(draftData);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      localStorage.removeItem(id);
      setDrafts(drafts.filter(draft => draft.id !== id));
    }
  };

  const handleEdit = (draft) => {
    navigate('/utility/reports/daily/new', { state: { draft } });
  };

  const handleView = (draft) => {
    navigate('/utility/reports/daily/draft/' + draft.id.split('_').pop(), { state: { draft } });
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader 
          title="Daily Utility Report Drafts"
          backPath="/utility"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <Paper sx={{ p: 3, mt: 2 }}>
          {drafts.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              No draft reports found.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Inspector</TableCell>
                    <TableCell>Contractor</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drafts.map((draft) => (
                    <TableRow key={draft.id}>
                      <TableCell>{draft.header?.project}</TableCell>
                      <TableCell>{draft.date}</TableCell>
                      <TableCell>{draft.header?.inspector}</TableCell>
                      <TableCell>{draft.header?.contractor}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleView(draft)} color="primary" size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton onClick={() => handleEdit(draft)} color="primary" size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(draft.id)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default DailyUtilityReportDrafts; 