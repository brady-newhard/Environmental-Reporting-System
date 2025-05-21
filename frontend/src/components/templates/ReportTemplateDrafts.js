import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';

const ReportTemplateDrafts = ({ config }) => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    // Load all drafts from localStorage with the correct prefix
    const draftKeys = Object.keys(localStorage).filter(key => key.startsWith(`${config.reportType}_draft_`));
    const draftData = draftKeys.map(key => {
      const data = JSON.parse(localStorage.getItem(key));
      return {
        id: key,
        ...data,
        date: data.header?.date ? new Date(data.header.date).toLocaleDateString() : '-',
        lastModified: data.savedAt || null,
      };
    });
    // Sort by lastModified desc
    draftData.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
    setDrafts(draftData);
  }, [config.reportType]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      localStorage.removeItem(id);
      setDrafts(drafts.filter(draft => draft.id !== id));
    }
  };

  const handleEdit = (draft) => {
    const draftId = draft.id.replace(`${config.reportType}_draft_`, '');
    navigate(`${config.editPath}?draftId=${draftId}`, {
      state: { 
        formData: draft,
        from: `${config.reportType}/reports/drafts`
      }
    });
  };

  const handleView = (draft) => {
    const draftId = draft.id.replace(`${config.reportType}_draft_`, '');
    navigate(`${config.reviewPath}/${draftId}`, {
      state: { from: `${config.reportType}/reports/drafts`, formData: draft },
    });
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader 
          title={`${config.title} Drafts`}
          backPath={`/${config.reportType}/reports`}
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
                    Date: {draft.date}
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

export default ReportTemplateDrafts; 