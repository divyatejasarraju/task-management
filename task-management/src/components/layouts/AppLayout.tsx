import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  // Function to handle Create Task click
  const handleCreateTaskClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    navigate('/tasks?showForm=true');
  };
  
  // Function to handle Tasks click - ensure we navigate to tasks without params
  const handleTasksClick = (e) => {
    e.preventDefault();
    // Use navigate instead of window.location to preserve session
    navigate('/tasks', { replace: true });
  };
  
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
          
          {/* Tasks list without showing form */}
          <a 
            href="/tasks"
            onClick={handleTasksClick}
            className={`nav-item ${location.pathname === '/tasks' && !location.search.includes('showForm=true') ? 'active' : ''}`}
          >
            <span className="nav-icon">✓</span>
            <span className="nav-text">Tasks</span>
          </a>
          
          {/* Create Task with onClick handler */}
          <a 
            href="/tasks"
            onClick={handleCreateTaskClick}
            className={`nav-item ${location.search.includes('showForm=true') ? 'active' : ''}`}
          >
            <span className="nav-icon">➕</span>
            <span className="nav-text">Create Task</span>
          </a>
          
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
        
        {/* Logout option at bottom of sidebar */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={logout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="main-content">
        {/* Top header */}
        <header className="top-header">
          <h1 className="page-title">{title}</h1>
          
          <div className="user-controls">
            <span className="user-name">{authState.user?.name}</span>
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