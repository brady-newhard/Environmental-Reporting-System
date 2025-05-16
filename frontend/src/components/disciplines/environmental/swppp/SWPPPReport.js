import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import api from '../../../../services/api';
import axios from 'axios';

const SWPPPReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get(`/api/environmental/swppp/reports/${reportId}/`);
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching SWPPP report:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  if (loading) {
    return <Typography sx={{ mt: 4 }}>Loading SWPPP Report...</Typography>;
  }
  if (!report) {
    return <Typography sx={{ mt: 4 }}>Report not found.</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          SWPPP Report
        </Typography>
        <div style={{ color: 'red', fontWeight: 'bold' }}>TEST123</div>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={() => navigate(`/swppp-report/${reportId}/photos`)}
          sx={{ minWidth: 160 }}
        >
          Add Photos
        </Button>
      </Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        {/* Header Fields Display */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Typography>Inspector Name: {report.inspector_name}</Typography>
          <Typography>Inspection Date: {report.inspection_date}</Typography>
          {/* Add more header fields as needed */}
        </Box>
        {/* Checklist Table */}
        <Typography variant="h6" gutterBottom>Checklist Items</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell>LL Number</TableCell>
                <TableCell>Feature Details</TableCell>
                <TableCell>Inspector ID</TableCell>
                <TableCell>Soil Disturbed?</TableCell>
                <TableCell>Inspection Date</TableCell>
                <TableCell>Inspection Time</TableCell>
                <TableCell>ECD Functional?</TableCell>
                <TableCell>ECD Needs Maintenance?</TableCell>
                <TableCell>Date Corrected</TableCell>
                <TableCell>Comments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.items && report.items.length > 0 ? (
                report.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.ll_number}</TableCell>
                    <TableCell>{item.feature_details}</TableCell>
                    <TableCell>{item.inspector_id}</TableCell>
                    <TableCell>{item.soil_presently_disturbed ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{item.inspection_date}</TableCell>
                    <TableCell>{item.inspection_time}</TableCell>
                    <TableCell>{item.ecd_functional ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{item.ecd_needs_maintenance ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{item.date_corrected}</TableCell>
                    <TableCell>{item.comments}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11}>No checklist items.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SWPPPReport; 