import { ReactNode } from 'react';
import { TaskManagerLogo } from '../TaskManagerLogo';
import '../../styles/layouts/AuthLayout.css';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Authentication layout used for login/signup pages
 * Provides consistent styling for authentication screens
 */
const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <TaskManagerLogo />
            <h1>Task Manager</h1>
            <p>Organize your tasks efficiently</p>
          </div>
        </div>
        <div className="auth-right">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;