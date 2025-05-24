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
import ReportPhotoSection from '../common/ReportPhotoSection';

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

  // Helper to format date fields
  const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (!isNaN(d)) return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    return value;
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
        
        {/* Project Information Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Project Information</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {config.headerFields.filter(f => [
              'project', 'contractor', 'inspector', 'date', 'spread', 'facility', 'milepost_start', 'milepost_end', 'station_start', 'station_end'
            ].includes(f.name)).map(field => (
              <Box key={field.name} sx={{ minWidth: 180 }}>
                <b>{field.label}:</b> {field.type === 'date' ? formatDate(data.header?.[field.name]) : (data.header?.[field.name] || '')}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Weather Information Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Weather Information</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {config.headerFields.filter(f => [
              'weather_conditions', 'temperature', 'precipitation_type', 'soil_conditions'
            ].includes(f.name)).map(field => (
              <Box key={field.name} sx={{ minWidth: 180 }}>
                <b>{field.label}:</b> {data.header?.[field.name] || ''}
              </Box>
            ))}
          </Box>
          {/* Rain Gauges */}
          {data.header?.rain_gauges && data.header.rain_gauges.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Rain Gauge Data</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Rain (in)</TableCell>
                      <TableCell>Snow (in)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.header.rain_gauges.map((gauge, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{gauge.location}</TableCell>
                        <TableCell>{gauge.rain}</TableCell>
                        <TableCell>{gauge.snow}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          {/* Additional Comments */}
          {data.header?.additional_comments && (
            <Box sx={{ mt: 2 }}>
              <b>Additional Comments:</b> {data.header.additional_comments}
            </Box>
          )}
        </Box>

        {/* Dynamic Sections (Crew Daily Summaries with Summary as its own row) */}
        {data.sections.map(section => (
          <Box key={section.name} sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>{section.name}</Typography>
            {section.name === 'Crew Daily Summaries' ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {section.rows.length > 0 && Object.keys(section.rows[0]).filter(f => f !== 'Summary').map(field => (
                        <TableCell key={field}>{field}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {section.rows.map((row, idx) => (
                      <React.Fragment key={idx}>
                        <TableRow>
                          {Object.entries(row).filter(([k]) => k !== 'Summary').map(([k, v]) => (
                            <TableCell key={k}>{v}</TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={Object.keys(row).length - 1}>
                            <b>Summary:</b> {row.Summary}
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {section.rows.length > 0 && Object.keys(section.rows[0]).map(field => (
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
            )}
          </Box>
        ))}

        {/* Summaries */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Environmental Inspection Summary</Typography>
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

        {/* Photos Section (2-column grid, full size, wrapped text) */}
        {config.requiresPhotos && data.photos && data.photos.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Photos</Typography>
            <ReportPhotoSection
              photos={data.photos}
              editable={false}
              gridProps={{ columns: 2, fullSize: true, wrapText: true }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ReportTemplateReview; 