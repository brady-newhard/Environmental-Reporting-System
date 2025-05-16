import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CoatingReports from '../components/disciplines/coating/daily/CoatingReports';
import CoatingDailyReports from '../components/disciplines/coating/daily/CoatingDailyReports';
import CoatingDraftReports from '../components/disciplines/coating/daily/CoatingDraftReports';
import CoatingDailyReportForm from '../components/disciplines/coating/daily/CoatingDailyReportForm';
import CoatingInspectionReportForm from '../components/disciplines/coating/oversight/CoatingInspectionReportForm';
import CoatingInspectionReportPrint from '../components/disciplines/coating/oversight/CoatingInspectionReportPrint';

const CoatingRoutes = () => {
  return (
    <Routes>
      <Route path="reports" element={<CoatingReports />} />
      <Route path="reports/daily" element={<CoatingDailyReports />} />
      <Route path="reports/daily/new" element={<CoatingDailyReportForm />} />
      <Route path="reports/drafts" element={<CoatingDraftReports />} />
      <Route path="reports/inspection" element={<CoatingInspectionReportForm />} />
      <Route path="reports/print/preview" element={<CoatingInspectionReportPrint />} />
    </Routes>
  );
};

export default CoatingRoutes; 