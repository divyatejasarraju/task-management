import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleBasedButtonProps {
  requiredRoles: ('admin' | 'validator' | 'user')[];
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const RoleBasedButton: React.FC<RoleBasedButtonProps> = ({ 
  requiredRoles, 
  children, 
  ...props 
}) => {
  const { authState } = useAuth();
  const userRole = authState.user?.role || 'user';
  
  if (!requiredRoles.includes(userRole)) {
    return null;
  }
  
  return <button {...props}>{children}</button>;
};

export default RoleBasedButton;