import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CoatingReports from '../components/coating/CoatingReports';
import CoatingDailyReportForm from '../components/coating/CoatingDailyReportForm';
import CoatingDraftReports from '../components/coating/CoatingDraftReports';

const CoatingRoutes = () => {
  return (
    <Routes>
      <Route path="reports" element={<CoatingReports />} />
      <Route path="reports/daily" element={<CoatingDailyReportForm />} />
      <Route path="reports/drafts" element={<CoatingDraftReports />} />
    </Routes>
  );
};

export default CoatingRoutes; 