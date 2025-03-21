import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';
import { validateToken } from '../utils/tokenValidation';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { authState, resetAuthState } = useAuth();
  
  // Validate token on protected route access
  useEffect(() => {
    const checkToken = async () => {
      if (authState.isAuthenticated) {
        const isValid = await validateToken();
        if (!isValid) {
          resetAuthState();
        }
      }
    };
    
    checkToken();
  }, [authState.isAuthenticated, resetAuthState]);
  
  // If authentication is loading, show loading screen
  if (authState.isLoading) {
    return <LoadingScreen message="Verifying your login..." />;
  }
  
  // If not authenticated, redirect to login
  if (!authState.isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // If admin-only route, check for admin role
  if (adminOnly && authState.user?.role !== 'admin' && authState.user?.role !== 'validator') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;