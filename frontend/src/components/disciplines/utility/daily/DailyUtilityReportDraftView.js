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
  Divider,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';

const DailyUtilityReportDraftView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { draft } = location.state || {};

  if (!draft) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No draft data found.</Typography>
      </Box>
    );
  }

  // Only show items with any user input
  const filledItems = (draft.items || []).filter(item => (
    item.startSta || item.endSta || item.dailyQty || item.comments || item.unitQty
  ));

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader 
          title="Daily Utility Report Draft"
          backPath="/utility/reports/daily/drafts"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>Daily Utility Report</Typography>
          <Divider sx={{ mb: 2 }} />
          
          {/* Project Info */}
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><b>Project</b></TableCell>
                  <TableCell>{draft.header?.project}</TableCell>
                  <TableCell><b>Spread</b></TableCell>
                  <TableCell>{draft.header?.spread}</TableCell>
                  <TableCell><b>Date</b></TableCell>
                  <TableCell>{draft.header?.date ? new Date(draft.header.date).toLocaleDateString() : ''}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><b>Inspector</b></TableCell>
                  <TableCell>{draft.header?.inspector}</TableCell>
                  <TableCell><b>Contractor</b></TableCell>
                  <TableCell>{draft.header?.contractor}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Items Table */}
          {filledItems.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>Items</Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Item #</b></TableCell>
                      <TableCell><b>Description</b></TableCell>
                      <TableCell><b>Unit</b></TableCell>
                      <TableCell><b>Unit Qty</b></TableCell>
                      <TableCell><b>Start Sta.</b></TableCell>
                      <TableCell><b>End Sta.</b></TableCell>
                      <TableCell><b>Daily Qty</b></TableCell>
                      <TableCell><b>Comments</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filledItems.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.item}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{row.unit}</TableCell>
                        <TableCell>{row.unitQty}</TableCell>
                        <TableCell>{row.startSta}</TableCell>
                        <TableCell>{row.endSta}</TableCell>
                        <TableCell>{row.dailyQty}</TableCell>
                        <TableCell>{row.comments}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Comments */}
          {draft.comments && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Comments</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>{draft.comments}</Paper>
            </Box>
          )}

          {/* Signatures */}
          <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
            {/* Inspector */}
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Inspector</Typography>
              <Typography>Name: {draft.signatures?.inspector}</Typography>
              {draft.inspectorSig && (
                <Box sx={{ border: '1px solid #222', borderRadius: 1, mt: 1, mb: 1, p: 1, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', overflow: 'hidden' }}>
                  <img src={draft.inspectorSig} alt="Inspector Signature" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </Box>
              )}
              <Typography>Date: {draft.signatures?.inspectorDate ? new Date(draft.signatures.inspectorDate).toLocaleDateString() : ''}</Typography>
            </Box>
            {/* Foreman */}
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Foreman</Typography>
              <Typography>Name: {draft.signatures?.contractor}</Typography>
              {draft.foremanSig && (
                <Box sx={{ border: '1px solid #222', borderRadius: 1, mt: 1, mb: 1, p: 1, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', overflow: 'hidden' }}>
                  <img src={draft.foremanSig} alt="Foreman Signature" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                </Box>
              )}
              <Typography>Date: {draft.signatures?.contractorDate ? new Date(draft.signatures.contractorDate).toLocaleDateString() : ''}</Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/utility/reports/daily/new', { state: { draft } })}
            >
              Edit
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => window.print()}
            >
              Print Copy
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/utility/reports/daily/review', { state: { formData: draft } })}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default DailyUtilityReportDraftView; 