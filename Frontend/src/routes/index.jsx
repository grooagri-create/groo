import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import module routes
import LandingPage from '../modules/landing/LandingPage';
import UserRoutes from '../modules/user/routes';
import VendorRoutes from '../modules/vendor/routes';
import WorkerRoutes from '../modules/worker/routes';
import AdminRoutes from '../modules/admin/routes';
import BlogListing from '../modules/landing/pages/BlogListing';
import ArticleListing from '../modules/landing/pages/ArticleListing';
import BlogDetail from '../modules/landing/pages/BlogDetail';
import ArticleDetail from '../modules/landing/pages/ArticleDetail';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing experience */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/blogs" element={<BlogListing />} />
      <Route path="/blogs/:id" element={<BlogDetail />} />
      <Route path="/articles" element={<ArticleListing />} />
      <Route path="/articles/:id" element={<ArticleDetail />} />

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

