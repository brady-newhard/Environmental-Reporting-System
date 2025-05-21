import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import { ProgressChartTable } from './ProgressChart';

const ACTIVITY_TITLES = [
  'Access Roads',
  'Felling',
  'Clearing',
  'Grading',
  'Ditch',
  'Stringing',
  'Bending',
  'Welding',
  'Coating',
  'Lowering-in',
  'Backfill',
  'Clean up',
  'Stabilization',
  'Re-Vegetation',
];

const NewProgressReport = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Progress Chart
        </Typography>
        <Paper sx={{ p: 3 }}>
          <ProgressChartTable activityTitles={ACTIVITY_TITLES} />
        </Paper>
      </Box>
    </Container>
  );
};

export default NewProgressReport; 