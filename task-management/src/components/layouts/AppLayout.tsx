import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TaskManagerLogo } from '../TaskManagerLogo';
import '../../styles/layouts/AppLayout.css';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  const { authState, logout } = useAuth();
  const location = useLocation();
  
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <TaskManagerLogo />
          <h2>Task Manager</h2>
        </div>
        
        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>
          
          <Link 
            to="/tasks" 
            className={`nav-item ${location.pathname.includes('/tasks') ? 'active' : ''}`}
          >
            <span className="nav-icon">✓</span>
            <span className="nav-text">Tasks</span>
          </Link>
          
          {(authState.user?.role === 'admin' || authState.user?.role === 'validator') && (
            <Link 
              to="/holidays" 
              className={`nav-item ${location.pathname === '/holidays' ? 'active' : ''}`}
            >
              <span className="nav-icon">🗓️</span>
              <span className="nav-text">Holidays</span>
            </Link>
          )}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="main-content">
        {/* Top header */}
        <header className="top-header">
          <h1 className="page-title">{title}</h1>
          
          <div className="user-controls">
            <span className="user-name">{authState.user?.name}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>
        
        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;