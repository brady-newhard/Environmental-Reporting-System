import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CoatingReports from '../components/coating/CoatingReports';
import CoatingDailyReportForm from '../components/coating/CoatingDailyReportForm';

const CoatingRoutes = () => {
  return (
    <Routes>
      <Route path="/reports" element={<CoatingReports />} />
      <Route path="/reports/daily" element={<CoatingDailyReportForm />} />
    </Routes>
  );
};

export default CoatingRoutes; 