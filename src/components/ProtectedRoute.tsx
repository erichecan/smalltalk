import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  element: React.ReactElement;
  // Alternatively, could use: children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // While checking auth state, render nothing or a loading indicator.
    // Returning null is usually fine as the loading state should be brief.
    // Consider a global loading spinner for a better UX in a larger app.
    return null;
  }

  if (!user) {
    // User not authenticated, redirect to login page.
    // Pass the current location so we can redirect back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the requested element
  return element;
};

export default ProtectedRoute;
