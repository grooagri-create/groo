import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import module routes
import LandingPage from '../modules/landing/LandingPage';
import UserRoutes from '../modules/user/routes';
import VendorRoutes from '../modules/vendor/routes';
import WorkerRoutes from '../modules/worker/routes';
import AdminRoutes from '../modules/admin/routes';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* User Routes */}
      <Route path="/user/*" element={<UserRoutes />} />

      {/* Vendor Routes */}
      <Route path="/vendor/*" element={<VendorRoutes />} />

      {/* Worker Routes */}
      <Route path="/worker/*" element={<WorkerRoutes />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
};

export default AppRoutes;

