import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DailyWeldingReportForm from '../components/welding/DailyWeldingReportForm';
import DraftReports from '../components/welding/DraftReports';

const WeldingRoutes = () => {
  return (
    <Routes>
      <Route path="/reports/daily" element={<DailyWeldingReportForm />} />
      <Route path="/reports/drafts" element={<DraftReports />} />
    </Routes>
  );
};

export default WeldingRoutes; 