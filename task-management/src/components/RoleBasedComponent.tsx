import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleBasedComponentProps {
  requiredRoles: ('admin' | 'validator' | 'user')[];
  children: React.ReactNode;
}

const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({ 
  requiredRoles, 
  children 
}) => {
  const { authState } = useAuth();
  const userRole = authState.user?.role || 'user';
  
  if (!requiredRoles.includes(userRole)) {
    return null;
  }
  
  return <>{children}</>;
};

export default RoleBasedComponent;