
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CoatingReports from '../components/coating/CoatingReports';
import CoatingDailyReportForm from '../components/coating/CoatingDailyReportForm';
import CoatingDraftReports from '../components/coating/CoatingDraftReports';
import CoatingInspectionReportForm from '../components/coating/CoatingInspectionReportForm';
console.log("Rendering CoatingInspectionReportForm");
const CoatingRoutes = () => {
  return (
    <Routes>
      <Route path="reports" element={<CoatingReports />} />
      <Route path="reports/daily" element={<CoatingDailyReportForm />} />
      <Route path="reports/drafts" element={<CoatingDraftReports />} />
      <Route path="reports/inspection" element={<CoatingInspectionReportForm />} />
    </Routes>
  );
};

export default CoatingRoutes; 