import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const defaultPrintStyles = `
@media print {
  body { margin: 0; font-family: Arial, sans-serif; }
  .no-print { display: none !important; }
  .section-table { page-break-inside: avoid !important; }
  table { border-collapse: collapse !important; width: 100%; }
  th, td { border: 1px solid #222 !important; padding: 4px 8px !important; font-size: 0.95rem; }
  .section-header { background: #eee; font-weight: bold; font-size: 1.1rem; padding: 6px 0; }
  nav, .MuiAppBar-root { display: none !important; }
}
`;

export default function ReportPrintTemplate({ title, sections, printCss }) {
  return (
    <Box sx={{ p: 3, maxWidth: 1100, margin: '0 auto' }}>
      <style>{printCss || defaultPrintStyles}</style>
      <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      {sections.map((section, idx) => (
        <Box className="section-table" sx={{ mb: 2 }} key={idx}>
          <Typography className="section-header">{section.header}</Typography>
          {section.content}
        </Box>
      ))}
      <Button
        className="no-print"
        variant="outlined"
        color="primary"
        onClick={() => window.print()}
        sx={{ mt: 3, width: { xs: '100%', sm: 'auto' } }}
      >
        Print / Export PDF
      </Button>
    </Box>
  );
} 