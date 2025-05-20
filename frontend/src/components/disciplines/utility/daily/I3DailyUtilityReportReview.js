import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Stack } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './I3DailyUtilityReport.module.css';

const I3DailyUtilityReportReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (!state) return <Typography>No data to review.</Typography>;
  const { header, weather, am, pm, rows, generalSummary, landSummary, envSummary, safety, preparedBy, signature, sigDate, photos } = state;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, bgcolor: '#fff' }}>
        <Typography variant="h4" gutterBottom>I3 Daily Utility Report</Typography>
        {/* Project Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Project Information</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box><b>Project:</b> {header.project}</Box>
            <Box><b>Spread:</b> {header.spread}</Box>
            <Box><b>Inspector:</b> {header.inspector}</Box>
            <Box><b>AFE Number:</b> {header.afe}</Box>
            <Box><b>Contractor:</b> {header.contractor}</Box>
            {[1,2,3].map(i => header[`sub${i}`] && (
              <Box key={i}><b>Subcontractor {i}:</b> {header[`sub${i}`]}</Box>
            ))}
            <Box><b>Date:</b> {header.date ? new Date(header.date).toLocaleDateString() : ''}</Box>
            <Box><b>Report No.:</b> {header.reportNo}</Box>
            <Box><b>Weekday:</b> {header.weekday}</Box>
            <Box><b>Total Footage:</b> {header.totalFootage}</Box>
          </Box>
        </Box>
        {/* Weather */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Weather</Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            {['am', 'pm'].map(period => (
              <Box key={period}>
                <Typography variant="subtitle2">{period.toUpperCase()} Weather</Typography>
                <div>Sky Cover: {weather[period]?.sky}</div>
                <div>Precipitation: {weather[period]?.precip}</div>
                <div>Temp: {weather[period]?.temp}°F</div>
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
                  <TableCell>Equipment</TableCell>
                  <TableCell>Qty of Each</TableCell>
                  <TableCell>Hours Used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => (
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
                    <TableCell>{row.equipment}</TableCell>
                    <TableCell>{row.qty}</TableCell>
                    <TableCell>{row.hoursUsed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {/* Summaries */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Summaries</Typography>
          <Typography><b>General:</b> {generalSummary}</Typography>
          <Typography><b>Land:</b> {landSummary}</Typography>
          <Typography><b>Environmental:</b> {envSummary}</Typography>
        </Box>
        {/* Safety/Visitors/Events */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Safety / Visitors / Events</Typography>
          <Typography>{safety}</Typography>
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
              {photos.map((file, idx) => (
                <img
                  key={idx}
                  src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                  alt={`Photo ${idx + 1}`}
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }}
                />
              ))}
            </Box>
          </Box>
        )}
        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="contained" color="primary">Submit</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default I3DailyUtilityReportReview; 