import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
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
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
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
    }
  }, [config.reportType, loading, isAuthenticated]);

  // ... rest of the component code ...
}; 