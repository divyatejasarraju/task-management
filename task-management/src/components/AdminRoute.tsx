import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { authState } = useAuth();
  
  // If authentication is loading, show loading screen
  if (authState.isLoading) {
    return <LoadingScreen message="Verifying access..." />;
  }
  
  // If not authenticated, redirect to login
  if (!authState.isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // If authenticated but not admin or validator, redirect to dashboard
  if (authState.user?.role !== 'admin' && authState.user?.role !== 'validator') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;