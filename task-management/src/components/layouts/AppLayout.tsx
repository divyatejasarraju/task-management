import { ReactNode } from 'react';
import AppHeader from '../AppHeader';
import '../../styles/layouts/AppLayout.css';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  backButtonPath?: string;
}

/**
 * Main application layout used for authenticated pages
 * Provides consistent page structure with header and content area
 */
const AppLayout = ({ 
  children, 
  title, 
  showBackButton = false, 
  backButtonPath 
}: AppLayoutProps) => {
  return (
    <div className="app-layout">
      <AppHeader 
        title={title}
        showBackButton={showBackButton}
        backButtonPath={backButtonPath}
      />
      <main className="app-content">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;