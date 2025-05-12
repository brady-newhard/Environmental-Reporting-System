import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import PageHeader from '../common/PageHeader';

const initialState = {
  contractor: '',
  reportNumber: '',
  oqPersonnel: '',
  facilityId: '',
  date: '',
  purchaseOrder: '',
  location: '',
  qaInspector: '',
  signature: '',
  items: Array(11).fill('').map(() => ({
    sat: false,
    unsat: false,
    na: false,
    nw: false,
    comments: '',
    subItems: [],
  })),
};

const oversightItems = [
  'Project schedule change requested?',
  'Specialized containment in place?',
  'Protective coverings in place?',
  'Abrasive type being used?',
  'Surface Preparation',
  'Soluble salt remediation?',
  'Surface condition prior to coating?',
  'Material storage and mixing?',
  'Coating application',
  'Repair of Damage?',
  'Contractor QA documentation',
];

const subItems = {
  4: [
    'a. Weld spatter, edges removed?',
    'b. Rust scale / pack rust removed?',
    'c. Steel defects present?',
    'd. Compressed air cleanliness?',
    'e. Ambient conditions?',
    'f. Surface prep. cleanliness? HOLD POINT',
    'g. Surface profile? HOLD POINT',
  ],
  8: [
    'a. Application methods appropriate?',
    'b. Ambient conditions?',
    'c. Wet film thickness?',
    'd. Stripe coat?',
    'e. Coverage/continuity/cleanliness/recoat times?',
    'f. Dry film thickness? HOLD POINT',
  ],
};

const statusOptions = ['sat', 'unsat', 'na', 'nw'];

const CoatingDailyReportForm = () => {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[idx][field] = value;
      return { ...prev, items };
    });
  };

  const handleSubItemChange = (itemIdx, subIdx, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      if (!items[itemIdx].subItems[subIdx]) items[itemIdx].subItems[subIdx] = {};
      items[itemIdx].subItems[subIdx][field] = value;
      return { ...prev, items };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Daily Coating Report (Preview)" backPath="/coating/reports/daily" />
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Report Preview</Typography>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(form, null, 2)}</pre>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', p: { xs: 2, sm: 3 }, maxWidth: '100vw', overflowX: 'hidden' }}>
      <PageHeader title="Daily Coating Report" backPath="/coating/reports" />
      <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Daily Coating Report</Typography>
      <Box sx={{ bgcolor: '#fff', border: '2px solid #000', borderRadius: 2, boxShadow: 2, p: { xs: 2, sm: 3 }, width: '100%' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Project Information</Typography>
          <Grid container spacing={2} sx={{ width: '100%', m: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }} alignItems="stretch">
            <Grid item><TextField label="Contractor" name="contractor" value={form.contractor} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="Report #" name="reportNumber" value={form.reportNumber} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="OQ Personnel*" name="oqPersonnel" value={form.oqPersonnel} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="Facility ID" name="facilityId" value={form.facilityId} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
            <Grid item><TextField label="Purchase Order No." name="purchaseOrder" value={form.purchaseOrder} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="Location" name="location" value={form.location} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="QA Inspector Name" name="qaInspector" value={form.qaInspector} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="Signature" name="signature" value={form.signature} onChange={handleChange} fullWidth /></Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Daily Project Oversight Items</Typography>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e3f0fa' }}>
                  <th style={{ border: '1px solid #bbb', padding: 4 }}>#</th>
                  <th style={{ border: '1px solid #bbb', padding: 4 }}>Daily Project Oversight Items</th>
                  {statusOptions.map(opt => (
                    <th key={opt} style={{ border: '1px solid #bbb', padding: 4 }}>{opt.toUpperCase()}</th>
                  ))}
                  <th style={{ border: '1px solid #bbb', padding: 4 }}>Comments</th>
                </tr>
              </thead>
              <tbody>
                {oversightItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr>
                      <td style={{ border: '1px solid #bbb', padding: 4, verticalAlign: 'top' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #bbb', padding: 4, verticalAlign: 'top' }}>{item}</td>
                      {statusOptions.map(opt => (
                        <td key={opt} style={{ border: '1px solid #bbb', padding: 4, textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={!!form.items[idx][opt]}
                            onChange={e => handleItemChange(idx, opt, e.target.checked)}
                          />
                        </td>
                      ))}
                      <td style={{ border: '1px solid #bbb', padding: 4 }}>
                        <TextField
                          value={form.items[idx].comments}
                          onChange={e => handleItemChange(idx, 'comments', e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </td>
                    </tr>
                    {subItems[idx] && subItems[idx].map((sub, subIdx) => (
                      <tr key={subIdx}>
                        <td style={{ border: '1px solid #bbb', padding: 4, verticalAlign: 'top' }}></td>
                        <td style={{ border: '1px solid #bbb', padding: 4, verticalAlign: 'top', paddingLeft: 24 }}>{sub}</td>
                        {statusOptions.map(opt => (
                          <td key={opt} style={{ border: '1px solid #bbb', padding: 4, textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={!!(form.items[idx].subItems && form.items[idx].subItems[subIdx] && form.items[idx].subItems[subIdx][opt])}
                              onChange={e => handleSubItemChange(idx, subIdx, opt, e.target.checked)}
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #bbb', padding: 4 }}>
                          <TextField
                            value={form.items[idx].subItems && form.items[idx].subItems[subIdx] ? form.items[idx].subItems[subIdx].comments || '' : ''}
                            onChange={e => handleSubItemChange(idx, subIdx, 'comments', e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button type="submit" variant="contained" color="primary">Submit</Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default CoatingDailyReportForm; 