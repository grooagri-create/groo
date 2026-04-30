import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

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
  const location = useLocation();
  
  React.useEffect(() => {
    // console.log('📍 Current Route Path:', location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Module Routes - High Priority */}
      <Route path="/user/*" element={<UserRoutes />} />
      <Route path="/vendor/*" element={<VendorRoutes />} />
      <Route path="/worker/*" element={<WorkerRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Landing experience */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/blogs" element={<BlogListing />} />
      <Route path="/blogs/:id" element={<BlogDetail />} />
      <Route path="/articles" element={<ArticleListing />} />
      <Route path="/articles/:id" element={<ArticleDetail />} />

      {/* Public utility URLs (Great for iOS/App Store) */}
      <Route path="/privacy" element={<Navigate to="/user/privacy" replace />} />
      <Route path="/support" element={<Navigate to="/user/help-support" replace />} />
      <Route path="/terms" element={<Navigate to="/user/cancellation-policy" replace />} />

      {/* Fallback for any unknown user routes to go to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

