import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import PageHeader from '../../../../components/common/PageHeader';

const I3DailyUtilityReportDrafts = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    // Get all drafts from localStorage
    const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('i3_daily_utility_draft_'));
    const draftData = draftKeys.map(key => {
      const data = JSON.parse(localStorage.getItem(key));
      return {
        id: key,
        ...data,
        date: new Date(data.header?.date || Date.now()).toLocaleDateString(),
        lastModified: data.lastModified || null,
      };
    });
    // Sort by lastModified desc if available
    draftData.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
    setDrafts(draftData);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      localStorage.removeItem(id);
      setDrafts(drafts.filter(draft => draft.id !== id));
    }
  };

  const handleEdit = (draft) => {
    navigate('/utility/reports/daily/i3', { state: { draft } });
  };

  const handleView = (draft) => {
    const draftId = draft.id.replace('i3_daily_utility_draft_', '');
    navigate(`/utility/reports/daily/i3/review/${draftId}`, {
      state: { from: '/utility/reports/daily/i3/drafts', draft },
    });
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader 
          title="I3 Daily Utility Report Drafts"
          backPath="/utility/reports"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        {drafts.length === 0 ? (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              No draft reports found.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {drafts.map((draft) => (
              <Paper key={draft.id} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Project: {draft.header?.project || '-'}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Inspector: {draft.header?.inspector || '-'}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Date: {draft.header?.date ? new Date(draft.header.date).toLocaleDateString() : '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Modified: {draft.lastModified ? new Date(draft.lastModified).toLocaleString() : '-'}
                  </Typography>
                </Box>
                <Box>
                  <IconButton color="primary" onClick={() => handleView(draft)} size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleEdit(draft)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(draft.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default I3DailyUtilityReportDrafts; 