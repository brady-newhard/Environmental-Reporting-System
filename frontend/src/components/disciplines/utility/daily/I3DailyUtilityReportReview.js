import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Stack } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './I3DailyUtilityReport.module.css';

const I3DailyUtilityReportReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (!state) return <Typography>No data to review.</Typography>;
  const { header, weather, am, pm, rows, generalSummary, landSummary, envSummary, safety, visitors, preparedBy, signature, sigDate } = state;

  return (
    <Box className={styles.root}>
      <Paper className={styles.paper}>
        <Typography variant="h5" sx={{ mb: 2 }}>I3 Daily Utility Report - Review</Typography>
        <Box className={styles.headerSection}>
          <Typography><b>PROJECT:</b> {header.project}</Typography>
          <Box className={styles.headerGrid}>
            <Typography>Inspector: {header.inspector}</Typography>
            <Typography>AFE Number: {header.afe}</Typography>
            <Typography>Contractor: {header.contractor}</Typography>
            <Typography>Subcontractor: {header.sub1}</Typography>
            <Typography>Subcontractor: {header.sub2}</Typography>
            <Typography>Subcontractor: {header.sub3}</Typography>
            <Typography>Date: {header.date}</Typography>
            <Typography>Report No.: {header.reportNo}</Typography>
            <Typography>Weekday: {header.weekday}</Typography>
            <Typography>Total Footage: {header.totalFootage}</Typography>
          </Box>
          <Box className={styles.weatherSection}>
            <Typography variant="subtitle2">WEATHER</Typography>
            <Typography>Clear: {weather.clear ? 'Yes' : 'No'}</Typography>
            <Typography>Cloudy: {weather.cloudy ? 'Yes' : 'No'}</Typography>
            <Typography>Rain: {weather.rain ? 'Yes' : 'No'}</Typography>
            <Typography>Snow: {weather.snow ? 'Yes' : 'No'}</Typography>
            <Typography>Temp: {weather.temp}</Typography>
            <Typography>AM: {am ? 'Yes' : 'No'} | PM: {pm ? 'Yes' : 'No'}</Typography>
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>CONSTRUCTION PHASE</TableCell>
                <TableCell>START STA.</TableCell>
                <TableCell>END STA.</TableCell>
                <TableCell>DAILY FOOTAGE</TableCell>
                <TableCell>CUMULATIVE FOOTAGE</TableCell>
                <TableCell>% Complete</TableCell>
                <TableCell>CONTRACTOR NAME</TableCell>
                <TableCell>NUMBER IN CREW</TableCell>
                <TableCell>TOTAL HOURS</TableCell>
                <TableCell>EQUIPMENT</TableCell>
                <TableCell>QTY OF EACH</TableCell>
                <TableCell>HOURS USED</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.phase}</TableCell>
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
        <Box className={styles.summarySection}>
          <Typography><b>GENERAL SUMMARY:</b> {generalSummary}</Typography>
          <Typography><b>LAND SUMMARY:</b> {landSummary}</Typography>
          <Typography><b>ENVIRONMENTAL SUMMARY:</b> {envSummary}</Typography>
        </Box>
        <Typography className={styles.photoNote} sx={{ color: 'red', fontWeight: 'bold', mt: 2, mb: 2 }}>
          EMAIL PHOTOGRAPHS IN ORIGINAL FORMAT, AS ATTACHMENTS, ALONG WITH DAILY REPORT TO JOE AND CONNIE. ALL PHOTOS MUST BE LABELED WITH LOCATION, DATE, AND DESCRIPTION.
        </Typography>
        <Box className={styles.footerSection}>
          <Typography><b>SAFETY CONCERNS / VISITORS / EVENTS:</b> {safety}</Typography>
          <Typography><b>Inspector/Report Prepared by:</b> {preparedBy}</Typography>
          <Typography><b>Inspector's Signature:</b> {signature}</Typography>
          <Typography><b>Date:</b> {sigDate}</Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="contained" color="primary">Submit</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default I3DailyUtilityReportReview; 