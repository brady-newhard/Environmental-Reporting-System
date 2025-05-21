import React, { useMemo } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Stack } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styles from './I3DailyUtilityReport.module.css';
import PageHeader from '../../../../components/common/PageHeader';

const I3DailyUtilityReportReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { draftId } = useParams();

  // Smart back button path
  const backPath = state?.from || '/utility/reports/daily/i3/drafts';

  // Try to get draft from state, else from localStorage
  const draft = useMemo(() => {
    if (state && state.draft) return state.draft;
    if (draftId) {
      const data = localStorage.getItem('i3_daily_utility_draft_' + draftId);
      if (data) return JSON.parse(data);
    }
    return null;
  }, [state, draftId]);

  if (!draft) return <Typography sx={{ p: 4, textAlign: 'center' }}>Draft not found. <Button onClick={() => navigate('/utility/reports/daily/i3/drafts')}>Back to Drafts</Button></Typography>;

  const { header, weather, am, pm, rows, generalSummary, landSummary, envSummary, safety, preparedBy, signature, sigDate, photos, equipmentRows } = draft;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <PageHeader
        title="I3 Daily Utility Report Review"
        backPath={backPath}
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }}
      />
      <Paper sx={{ p: 3, bgcolor: '#fff' }}>
        <Typography variant="h4" gutterBottom>I3 Daily Utility Report</Typography>
        {/* Project Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Project Information</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box><b>Project:</b> {header?.project}</Box>
            <Box><b>Spread:</b> {header?.spread}</Box>
            <Box><b>Inspector:</b> {header?.inspector}</Box>
            <Box><b>AFE Number:</b> {header?.afe}</Box>
            <Box><b>Contractor:</b> {header?.contractor}</Box>
            {[1,2,3].map(i => header && header[`sub${i}`] && (
              <Box key={i}><b>Subcontractor {i}:</b> {header[`sub${i}`]}</Box>
            ))}
            <Box><b>Date:</b> {header?.date ? new Date(header.date).toLocaleDateString() : ''}</Box>
            <Box><b>Report No.:</b> {header?.reportNo}</Box>
            <Box><b>Weekday:</b> {header?.weekday}</Box>
            <Box><b>Total Footage:</b> {header?.totalFootage}</Box>
          </Box>
        </Box>
        {/* Weather */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Weather</Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            {['am', 'pm'].map(period => (
              <Box key={period}>
                <Typography variant="subtitle2">{period.toUpperCase()} Weather</Typography>
                <div>Sky Cover: {weather?.[period]?.sky}</div>
                <div>Precipitation: {weather?.[period]?.precip}</div>
                <div>Temp: {weather?.[period]?.temp}°F</div>
              </Box>
            ))}
          </Box>
        </Box>
        {/* Construction Phases Table */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Construction Phases</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Construction Phase</TableCell>
                  <TableCell>Start Sta.</TableCell>
                  <TableCell>End Sta.</TableCell>
                  <TableCell>Daily Footage</TableCell>
                  <TableCell>Cumulative Footage</TableCell>
                  <TableCell>% Complete</TableCell>
                  <TableCell>Contractor Name</TableCell>
                  <TableCell>Number in Crew</TableCell>
                  <TableCell>Total Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows && rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.phase === 'Other' ? row.customPhase : row.phase}</TableCell>
                    <TableCell>{row.startSta}</TableCell>
                    <TableCell>{row.endSta}</TableCell>
                    <TableCell>{row.dailyFootage}</TableCell>
                    <TableCell>{row.cumulativeFootage}</TableCell>
                    <TableCell>{row.percentComplete}</TableCell>
                    <TableCell>{row.contractor}</TableCell>
                    <TableCell>{row.crew}</TableCell>
                    <TableCell>{row.hours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {/* Equipment Table */}
        {equipmentRows && equipmentRows.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Equipment</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Qty of Each</TableCell>
                    <TableCell>Hours Used</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipmentRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.equipment}</TableCell>
                      <TableCell>{row.qty}</TableCell>
                      <TableCell>{row.hoursUsed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {/* Summaries */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Summaries</Typography>
          <Typography><b>General:</b> {generalSummary}</Typography>
          <Typography><b>Land:</b> {landSummary}</Typography>
          <Typography><b>Environmental:</b> {envSummary}</Typography>
          <Typography><b>Safety / Visitors / Events:</b> {safety}</Typography>
        </Box>
        {/* Signature */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Inspector Signature</Typography>
          <Typography><b>Prepared by:</b> {preparedBy}</Typography>
          {signature && (
            <Box sx={{ my: 1 }}>
              <img src={signature} alt="Signature" style={{ maxWidth: 300, border: '1px solid #ccc' }} />
            </Box>
          )}
          <Typography><b>Date:</b> {sigDate}</Typography>
        </Box>
        {/* Photos */}
        {photos && photos.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Photos</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {photos.map((file, idx) => {
                let src = '';
                if (typeof file === 'string') {
                  src = file;
                } else if (file instanceof Blob) {
                  src = URL.createObjectURL(file);
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
        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/utility/reports/daily/i3')}>Edit</Button>
          <Button variant="contained" color="primary">Submit</Button>
          <Button variant="outlined" color="success" onClick={() => {
            // Placeholder: implement save as draft logic here
            alert('Draft saved!');
          }}>Save</Button>
          <Button variant="outlined" color="error" onClick={() => {
            if (window.confirm('Are you sure you want to delete this report?')) {
              // Placeholder: implement delete logic here
              alert('Report deleted.');
              navigate('/'); // Or wherever you want to go after delete
            }
          }}>Delete</Button>
          <Button variant="outlined" onClick={() => {
            if (window.confirm('Are you sure you want to exit? Unsaved changes will be lost.')) {
              navigate('/'); // Or wherever you want to go on exit
            }
          }}>Exit</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default I3DailyUtilityReportReview; 