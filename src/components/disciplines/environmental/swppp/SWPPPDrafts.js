import { useAuth } from '../../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAllDrafts, deleteDraft } from '../../../../utils/draftUtils';

const SWPPPDrafts = () => {
  const { isAuthenticated, loading } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDrafts() {
      try {
        const drafts = await getAllDrafts('swppp');
        setDrafts(drafts.sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0)));
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    }
    if (!loading && isAuthenticated) {
      loadDrafts();
    }
  }, [loading, isAuthenticated]);

  // ... rest of the component code ...
} 