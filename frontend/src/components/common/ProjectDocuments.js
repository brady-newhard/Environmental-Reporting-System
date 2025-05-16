import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Container,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Assignment as PermitIcon,
  Architecture as DrawingIcon,
  FormatListBulleted as ListIcon,
  TrendingUp as ProgressIcon,
  Warning as VarianceIcon,
  Water as SWPPPIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from './PageHeader';
import ProgressChart from './ProgressChart';

const DocumentItem = ({ document, onDelete, onSelect, isSelected }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ListItem 
      button 
      onClick={() => onSelect(document)}
      selected={isSelected}
      sx={{
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        py: isMobile ? 2 : 1,
      }}
    >
      <ListItemText
        primary={document.title || 'Document'}
        secondary={`Last Modified: ${new Date(document.date).toLocaleDateString()}`}
        sx={{
          mb: isMobile ? 1 : 0,
          '& .MuiTypography-root': {
            fontSize: isMobile ? '0.9rem' : '1rem',
          }
        }}
      />
      <ListItemSecondaryAction sx={{
        position: isMobile ? 'relative' : 'absolute',
        right: isMobile ? 0 : 16,
        top: isMobile ? 'auto' : '50%',
        transform: isMobile ? 'none' : 'translateY(-50%)',
        display: 'flex',
        gap: 1,
      }}>
        <IconButton
          edge="end"
          onClick={() => navigate(`/document/${document.id}`)}
          size={isMobile ? "small" : "medium"}
        >
          <EditIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
        <IconButton
          edge="end"
          onClick={() => onDelete(document.id)}
          size={isMobile ? "small" : "medium"}
        >
          <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const DocumentTypeCard = ({ title, icon: IconComponent, description, path }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card sx={{
      height: isMobile ? 180 : 200,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#fff',
      borderRadius: '2px',
      '&:hover': {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    }}>
      <CardContent sx={{ 
        flex: 1,
        p: isMobile ? 1.5 : 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        '&:last-child': { pb: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          gap: 1,
          minHeight: isMobile ? 60 : 80
        }}>
          <IconComponent sx={{ 
            color: '#000000',
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            mt: 0.5,
            flexShrink: 0
          }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#000000', 
                fontWeight: 600,
                fontSize: isMobile ? '1rem' : '1.1rem',
                wordBreak: 'break-word',
                mb: 0.5
              }}
            >
            {title}
          </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666666',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {description}
            </Typography>
          </Box>
          <IconButton
            size="small"
            sx={{ 
              color: '#666666',
              mt: 0.5,
              flexShrink: 0,
              p: isMobile ? 0.5 : 1
            }}
            onClick={() => navigate(path)}
          >
            <ChevronRightIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Box>
      </CardContent>
      <Box sx={{ p: isMobile ? 1.5 : 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(path)}
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#333333' },
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 500,
            height: isMobile ? 32 : 36,
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}
        >
          View {title}
        </Button>
      </Box>
    </Card>
  );
};

const ProjectDocuments = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/reports/');
        setDocuments(response.data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  const handleDeleteDocument = async (documentId) => {
    try {
      await api.delete(`/reports/${documentId}/`);
      setDocuments(documents.filter(doc => doc.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
    }
  };

  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
  };

  const documentTypes = [
    {
      title: 'Project Permits',
      icon: PermitIcon,
      description: 'View and manage project permits and certifications.',
      path: '/permits',
    },
    {
      title: 'Project Drawings',
      icon: DrawingIcon,
      description: 'Access project drawings and specifications.',
      path: '/drawings',
    },
    {
      title: 'Project Documents',
      icon: DocumentIcon,
      description: 'View project documentation and reports.',
      path: '/documents',
    },
    {
      title: 'Specifications',
      icon: ListIcon,
      description: 'Access project specifications and standards.',
      path: '/specifications',
    }
  ];

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      bgcolor: '#f5f5f5', 
      minHeight: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <PageHeader title="Project Documents" />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}>
            {documentTypes.map((type, index) => (
              <DocumentTypeCard
                key={index}
                title={type.title}
                icon={type.icon}
                description={type.description}
                path={type.path}
              />
            ))}
          </Box>
        </Grid>

        {documents.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ mt: 3 }}>
                <List>
                {documents.map((doc, index) => (
                  <React.Fragment key={doc.id}>
                    <DocumentItem
                      document={doc}
                      onDelete={handleDeleteDocument}
                      onSelect={handleSelectDocument}
                      isSelected={selectedDocument?.id === doc.id}
                    />
                    {index < documents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
          </Paper>
          </Grid>
        )}
      </Grid>
      </Box>
  );
};

export default ProjectDocuments; 