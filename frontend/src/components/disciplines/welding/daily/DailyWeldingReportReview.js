import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Divider, Stack } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../common/PageHeader';

const sectionTitle = (title) => (
  <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>{title}</Typography>
);

const renderTable = (title, rows, columns) => {
  // Calculate total of the 'total' column
  const grandTotal = rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);

  return (
    <Box sx={{ mb: 2 }}>
      {sectionTitle(title)}
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small" sx={{ borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell 
                  key={idx}
                  sx={{ 
                    borderRight: '1px solid rgba(224, 224, 224, 1)',
                    '&:last-child': { borderRight: 'none' }
                  }}
                >
                  <b>{col.label}</b>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col, cidx) => (
                  <TableCell 
                    key={cidx}
                    sx={{ 
                      borderRight: '1px solid rgba(224, 224, 224, 1)',
                      '&:last-child': { borderRight: 'none' }
                    }}
                  >
                    {row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell 
                colSpan={columns.length - 1} 
                align="right"
                sx={{ 
                  borderRight: '1px solid rgba(224, 224, 224, 1)',
                  '&:last-child': { borderRight: 'none' }
                }}
              >
                <b>Grand Total:</b>
              </TableCell>
              <TableCell
                sx={{ 
                  borderRight: '1px solid rgba(224, 224, 224, 1)',
                  '&:last-child': { borderRight: 'none' }
                }}
              >
                <b>{grandTotal}</b>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const DailyWeldingReportReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { draftId } = useParams();
  let form = location.state?.form;

  // Smart backPath logic
  const backPath = location.state?.from || '/welding/reports/drafts';

  // If no form in state, try to load from localStorage using draftId
  if (!form && draftId) {
    const data = localStorage.getItem(`daily_welding_draft_${draftId}`);
    if (data) {
      form = JSON.parse(data);
    }
  }

  if (!form) return <Typography sx={{ p: 4, textAlign: 'center' }}>No report data provided.<Button onClick={() => navigate(backPath)}>Back</Button></Typography>;

  // Prepare table data
  const weldRows = [
    { label: 'Fab / Shop', ...form.welds.fab },
    { label: 'Onsite', ...form.welds.onsite },
    { label: 'Tie-in', ...form.welds.tieIn },
    { label: 'Test Welds', ...form.welds.test },
  ];
  const xrayRows = [
    { label: 'Fab / Shop', ...form.xray.fab },
    { label: 'Onsite', ...form.xray.onsite },
    { label: 'Tie-in', ...form.xray.tieIn },
    { label: 'Test Welds', ...form.xray.test },
  ];
  const rejectedRows = [
    { label: 'Fab / Shop', ...form.weldsRejected.fab },
    { label: 'Onsite', ...form.weldsRejected.onsite },
    { label: 'Tie-in', ...form.weldsRejected.tieIn },
    { label: 'Test Welds', ...form.weldsRejected.test },
  ];
  const xrayRepairRows = [
    { label: 'Fab / Shop', ...form.xrayRepair.fab },
    { label: 'Onsite', ...form.xrayRepair.onsite },
    { label: 'Tie-in', ...form.xrayRepair.tieIn },
    { label: 'Test Welds', ...form.xrayRepair.test },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <PageHeader title="Daily Weld Report Review" backPath={backPath} />
      <Paper sx={{ p: 3, bgcolor: '#fff' }}>
        <Typography variant="h4" gutterBottom>Daily Weld Report</Typography>
        {/* Project Info */}
        {sectionTitle('Project Information')}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
          <Box><b>Project:</b> {form.project}</Box>
          <Box><b>Work Date:</b> {form.workDate}</Box>
          <Box><b>Contractor:</b> {form.contractor}</Box>
          <Box><b>Inspector:</b> {form.inspector}</Box>
          <Box><b>Construction WBS:</b> {form.constructionWBS}</Box>
          <Box><b>Retirement WBS:</b> {form.retirementWBS}</Box>
        </Box>
        {/* Weather */}
        {sectionTitle('Weather')}
        <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
          <Box>Sky Cover: {form.weather.skyCover}</Box>
          <Box>Temperature: {form.weather.temperature}</Box>
          <Box>Precipitation: {form.weather.precipitationType}</Box>
        </Box>
        {/* Activity & Hours */}
        {sectionTitle("Today's Activity / Procedures / Weather")}
        <Box sx={{ mb: 2 }}>{form.activity}</Box>
        <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
          <Box>Hours Worked: {form.hoursWorked}</Box>
          <Box>Welders Onsite: {form.weldersOnsite}</Box>
        </Box>
        {/* Welds Table */}
        {renderTable('Welds', weldRows, [
          { label: '', key: 'label' },
          { label: 'To Date', key: 'toDate' },
          { label: 'Today', key: 'today' },
          { label: 'Total', key: 'total' },
        ])}
        {/* X-Ray Table */}
        {renderTable('X-Ray', xrayRows, [
          { label: '', key: 'label' },
          { label: 'To Date', key: 'toDate' },
          { label: 'Today', key: 'today' },
          { label: 'Total', key: 'total' },
        ])}
        {/* Welds Rejected / Repaired Table */}
        {renderTable('Welds Rejected / Repaired', rejectedRows, [
          { label: '', key: 'label' },
          { label: 'Repaired', key: 'repaired' },
          { label: 'Rejected', key: 'rejected' },
          { label: 'Total', key: 'total' },
        ])}
        {/* X-Ray Rejected / Repaired Table */}
        {renderTable('X-Ray Rejected / Repaired', xrayRepairRows, [
          { label: '', key: 'label' },
          { label: 'Repair To Date', key: 'repaired' },
          { label: 'X-Ray To Date', key: 'rejected' },
          { label: 'Total', key: 'total' },
        ])}
        {/* Installations */}
        {sectionTitle('Installations')}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 2 }}>
          <Box><b>Pipe Installed:</b> Size: {form.pipeInstalled?.size}, Footage: {form.pipeInstalled?.footage}, From: {form.pipeInstalled?.from}, To: {form.pipeInstalled?.to}</Box>
          <Box><b>Road Xing:</b> Size: {form.roadXing?.size}, Footage: {form.roadXing?.footage}, From: {form.roadXing?.from}, To: {form.roadXing?.to}, Bore: {form.roadXing?.bore}</Box>
          <Box><b>Stream Xings:</b> Size: {form.streamXings?.size}, Footage: {form.streamXings?.footage}, From: {form.streamXings?.from}, To: {form.streamXings?.to}</Box>
          <Box><b>Taps Installed:</b> Size: {form.tapsInstalled?.size}, No.: {form.tapsInstalled?.no}</Box>
          <Box><b>Block Gates Installed:</b> Size: {form.blockGates?.size}, No.: {form.blockGates?.no}</Box>
          <Box><b>Cut Out Defects in Pipe - 2 cuts:</b> Size: {form.cutOut2?.size}, Defect: {form.cutOut2?.defect}</Box>
          <Box><b>Cut Out Defects in Pipe - 1 cut:</b> Size: {form.cutOut1?.size}, Defect: {form.cutOut1?.defect}</Box>
        </Box>
        {/* Signatures */}
        {sectionTitle('Signatures')}
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Welding Inspector</Typography>
            <Typography>Name: {form.weldingInspectorName}</Typography>
            {form.weldingInspectorSignature && (
              <Box sx={{ border: '1px solid #222', borderRadius: 1, mt: 1, mb: 1, p: 1, height: 120, width: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', overflow: 'hidden' }}>
                <img src={form.weldingInspectorSignature} alt="Welding Inspector Signature" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
              </Box>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Contractor</Typography>
            <Typography>Name: {form.contractorName}</Typography>
            {form.contractorSignature && (
              <Box sx={{ border: '1px solid #222', borderRadius: 1, mt: 1, mb: 1, p: 1, height: 120, width: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', overflow: 'hidden' }}>
                <img src={form.contractorSignature} alt="Contractor Signature" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
              </Box>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Supervisor</Typography>
            <Typography>Name: {form.supervisorName}</Typography>
            {form.supervisorSignature && (
              <Box sx={{ border: '1px solid #222', borderRadius: 1, mt: 1, mb: 1, p: 1, height: 120, width: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', overflow: 'hidden' }}>
                <img src={form.supervisorSignature} alt="Supervisor Signature" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
              </Box>
            )}
          </Box>
        </Box>
        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/welding/reports/daily', { state: { draft: form } })}>Edit</Button>
          <Button variant="contained" color="primary">Submit</Button>
          <Button variant="outlined" color="success" onClick={() => { alert('Draft saved!'); }}>Save</Button>
          <Button variant="outlined" color="error" onClick={() => { if (window.confirm('Are you sure you want to delete this report?')) { alert('Report deleted.'); navigate('/welding/reports'); } }}>Delete</Button>
          <Button variant="outlined" onClick={() => { if (window.confirm('Are you sure you want to exit? Unsaved changes will be lost.')) { navigate('/welding/reports'); } }}>Exit</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default DailyWeldingReportReview; 