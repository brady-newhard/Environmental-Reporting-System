import React from 'react';
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
  Divider
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import { Edit as EditIcon, ExitToApp as ExitToAppIcon, CheckCircle as SubmitIcon } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const ReportTemplateReview = ({ config }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { draftId } = useParams();
  let data = location.state?.formData;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // If no data in state, try to load from localStorage
  if (!data && draftId && config && config.reportType) {
    const localKey = `${config.reportType}_draft_${draftId}`;
    const localData = localStorage.getItem(localKey);
    if (localData) {
      data = JSON.parse(localData);
    }
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No report data provided.</Typography>
      </Box>
    );
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    const editPath = config.editPath || `/${config.reportType}/reports/new`;
    let path = editPath;
    if (draftId) {
      path += `?draftId=${draftId}`;
    }
    navigate(path, { state: { formData: data } });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <PageHeader
        title={`${config.title} Review`}
        backPath={handleBack}
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }}
      />
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 3, flexWrap: 'wrap' }}>
        <Tooltip title="Edit">
          <span>
            <Button
              variant="contained"
              color="info"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ minWidth: isMobile ? 48 : 120, width: isMobile ? 48 : 'auto', height: 48, p: 0 }}
              aria-label="Edit"
            >
              {!isMobile && 'Edit'}
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Exit">
          <span>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ExitToAppIcon />}
              onClick={handleBack}
              sx={{ minWidth: isMobile ? 48 : 120, width: isMobile ? 48 : 'auto', height: 48, p: 0 }}
              aria-label="Exit"
            >
              {!isMobile && 'Exit'}
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Submit">
          <span>
            <Button
              variant="contained"
              color="success"
              startIcon={<SubmitIcon />}
              onClick={() => {
                // Placeholder: handle final submission logic here
                alert('Report submitted!');
              }}
              sx={{ minWidth: isMobile ? 48 : 120, width: isMobile ? 48 : 'auto', height: 48, p: 0 }}
              aria-label="Submit"
            >
              {!isMobile && 'Submit'}
            </Button>
          </span>
        </Tooltip>
      </Box>
      <Paper sx={{ p: 3, bgcolor: '#fff' }}>
        <Typography variant="h4" gutterBottom>{config.title}</Typography>
        
        {/* Project Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Project Information</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {config.headerFields.map(field => (
              <Box key={field.name}>
                <b>{field.label}:</b> {data.header?.[field.name]}
              </Box>
            ))}
            <Box><b>Date:</b> {data.header?.date ? new Date(data.header.date).toLocaleDateString() : ''}</Box>
            <Box><b>Report No.:</b> {data.header?.reportNo}</Box>
          </Box>
        </Box>

        {/* Dynamic Sections */}
        {data.sections.map(section => (
          <Box key={section.name} sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>{section.name}</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {Object.keys(section.rows[0]).map(field => (
                      <TableCell key={field}>{field}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {section.rows.map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.values(row).map((value, fieldIdx) => (
                        <TableCell key={fieldIdx}>{value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

        {/* Summaries */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Summaries</Typography>
          {config.summaryFields.map(field => (
            <Typography key={field.name}>
              <b>{field.label}:</b> {data.summaries?.[field.name]}
            </Typography>
          ))}
        </Box>

        {/* Signature */}
        {config.requiresSignature && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Inspector Signature</Typography>
            <Typography><b>Prepared by:</b> {data.preparedBy}</Typography>
            {data.signature && (
              <Box sx={{ my: 1 }}>
                <img src={data.signature} alt="Signature" style={{ maxWidth: 300, border: '1px solid #ccc' }} />
              </Box>
            )}
            <Typography><b>Date:</b> {data.sigDate}</Typography>
          </Box>
        )}

        {/* Photos */}
        {config.requiresPhotos && data.photos && data.photos.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Photos</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {data.photos.map((photo, idx) => {
                let src = '';
                if (typeof photo === 'string') {
                  src = photo;
                } else if (photo instanceof Blob) {
                  src = URL.createObjectURL(photo);
                }
                if (!src) return null;
                return (
                  <img
                    key={idx}
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }}
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ReportTemplateReview; 