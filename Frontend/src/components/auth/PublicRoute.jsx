import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children, userType = 'user', redirectTo = null }) => {
  const location = useLocation();

  const checkAuthSync = () => {
    let tokenKey = 'accessToken';
    let refreshTokenKey = 'refreshToken';
    let dataKey = 'userData';

    // Determine keys based on userType
    switch (userType) {
      case 'vendor':
        tokenKey = 'vendorAccessToken';
        refreshTokenKey = 'vendorRefreshToken';
        dataKey = 'vendorData';
        break;
      case 'worker':
        tokenKey = 'workerAccessToken';
        refreshTokenKey = 'workerRefreshToken';
        dataKey = 'workerData';
        break;
      case 'admin':
        tokenKey = 'adminAccessToken';
        refreshTokenKey = 'adminRefreshToken';
        dataKey = 'adminData';
        break;
      case 'user':
      default:
        tokenKey = 'accessToken';
        refreshTokenKey = 'refreshToken';
        dataKey = 'userData';
        break;
    }

    const token = localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
    const userData = localStorage.getItem(dataKey) || sessionStorage.getItem(dataKey);

    if (token && userData) {
      try {
        // Decode JWT token to check expiry and role
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Date.now() / 1000;

          // Check if token is expired
          if (!payload.exp || payload.exp <= currentTime) {
            // Clear expired tokens
            localStorage.removeItem(tokenKey);
            localStorage.removeItem(refreshTokenKey);
            localStorage.removeItem(dataKey);
            sessionStorage.removeItem(tokenKey);
            sessionStorage.removeItem(refreshTokenKey);
            sessionStorage.removeItem(dataKey);
            return false;
          }

          // Check if token role matches expected userType
          const roleMap = {
            user: 'user',
            vendor: 'vendor',
            worker: 'worker',
            admin: 'admin'
          };

          if (payload.role === roleMap[userType]) {
            return true;
          } else {
            return false;
          }
        }
      } catch (error) {
        // Invalid token
        console.error('Token validation error:', error);
      }
    }
    return false;
  };

  const [isAuthenticated, setIsAuthenticated] = useState(checkAuthSync);

  useEffect(() => {
    const isAuthNow = checkAuthSync();
    if (isAuthenticated !== isAuthNow) {
      setIsAuthenticated(isAuthNow);
    }
  }, [location.pathname, userType]);

  if (isAuthenticated) {
    // Determine redirect path
    const defaultRedirects = {
      user: '/user',
      vendor: '/vendor/dashboard',
      worker: '/worker/dashboard',
      admin: '/admin/dashboard'
    };

    const redirectPath = redirectTo || defaultRedirects[userType] || '/user';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PublicRoute;

