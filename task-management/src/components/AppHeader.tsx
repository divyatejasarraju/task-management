import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { useHoliday } from '../context/HolidayContext';
import { TaskManagerLogo } from './TaskManagerLogo';
import '../styles/AppHeader.css';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  backButtonPath?: string;
}

const AppHeader = ({ 
  title, 
  showBackButton = false, 
  backButtonPath = '/dashboard' 
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const { resetTaskState } = useTask();
  const { resetHolidayState } = useHoliday();
  
  const handleLogout = () => {
    // Clear all application state before logout
    resetTaskState();
    resetHolidayState();
    logout();
  };
  
  const handleBack = () => {
    if (backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <header className="app-header">
      <div className="header-left">
        {showBackButton && (
          <button className="back-button" onClick={handleBack}>
            &larr; Back
          </button>
        )}
        
        <div className="header-logo">
          <TaskManagerLogo />
          <h1 className="header-title">{title}</h1>
        </div>
      </div>
      
      <div className="header-right">
        {authState.isAuthenticated && (
          <>
            <div className="user-info">
              <span className="user-name">{authState.user?.name}</span>
              <span className="user-role">{authState.user?.role}</span>
            </div>
            
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;