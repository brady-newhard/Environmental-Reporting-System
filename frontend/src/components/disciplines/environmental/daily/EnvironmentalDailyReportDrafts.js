import React, { useEffect, useState } from 'react';
import { getAllDrafts, deleteDraft } from '../../../../utils/draftUtils';
import { Box, Card, CardContent, CardActions, Button, Typography, IconButton, Chip } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function EnvironmentalDailyReportDrafts() {
  const [drafts, setDrafts] = useState([]);
  const navigate = useNavigate();
  const reportType = 'environmental';

  useEffect(() => {
    const loadDrafts = async () => {
      try {
        const loadedDrafts = await getAllDrafts(reportType);
        console.log('Loaded drafts:', loadedDrafts);
        // The API returns an array of objects with id and data properties
        const formattedDrafts = loadedDrafts.map(draft => ({
          ...draft.data,
          id: draft.id, // Ensure the ID is preserved in the root object
          photos: draft.data.photos || [] // Ensure photos array exists
        }));
        console.log('Formatted drafts:', formattedDrafts);
        setDrafts(formattedDrafts);
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    };
    loadDrafts();
  }, []);

  const handleDelete = async (draft) => {
    try {
      await deleteDraft(reportType, draft.id);
      const updatedDrafts = await getAllDrafts(reportType);
      const formattedDrafts = updatedDrafts.map(draft => ({
        ...draft.data,
        id: draft.id, // Ensure the ID is preserved in the root object
        photos: draft.data.photos || [] // Ensure photos array exists
      }));
      setDrafts(formattedDrafts);
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const handleEdit = (draft) => {
    console.log('Navigating to edit with draft:', draft);
    navigate(`/environmental/reports/daily/edit/${draft.id}`, {
      state: { draft }
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Environmental Daily Report Drafts</Typography>
      {drafts.map((draft, index) => (
        <Card key={`draft-${draft.id || index}`} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Project: {draft.header?.project || 'N/A'}</Typography>
            <Typography>Date: {draft.header?.date ? new Date(draft.header.date).toLocaleDateString() : 'N/A'}</Typography>
            <Typography>Inspector: {draft.header?.inspector || 'N/A'}</Typography>
            <Typography>Spread: {draft.header?.spread || 'N/A'}</Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleEdit(draft)}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
            <IconButton 
              onClick={() => {
                console.log('Navigating to review with draft:', draft);
                navigate(`/environmental/reports/daily/review/${draft.id}`, {
                  state: { 
                    draft: {
                      ...draft,
                      id: draft.id,
                      photos: draft.photos || []
                    }
                  }
                });
              }} 
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(draft)} color="error"><DeleteIcon /></IconButton>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
} 