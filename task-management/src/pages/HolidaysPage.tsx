import { useEffect } from 'react';
import { useHoliday } from '../context/HolidayContext';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layouts/AppLayout';
import '../styles/HolidaysPage.css';

const HolidaysPage = () => {
  const { getHolidays } = useHoliday();
  const { authState } = useAuth();
  
  // Check if user is admin or validator
  const isAdmin = authState.user?.role === 'admin' || authState.user?.role === 'validator';
  
  useEffect(() => {
    getHolidays();
  }, []);
  
  // If not admin, this page shouldn't be accessible, but let's add an extra check
  if (!isAdmin) {
    return (
      <AppLayout title="Access Denied">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </AppLayout>
    );
  }
  
  
  
  return (
    <AppLayout title="Manage Holidays">
      <div className="page-container">
        <div className="role-indicator">
          <span className={`role-badge role-${authState.user?.role}`}>
            {authState.user?.role}
          </span>
          <span className="role-message">
            You're managing holidays as an {authState.user?.role}
          </span>
        </div>
        
        <h2 className="page-title mb-20">Public Holidays</h2>
        <p className="holidays-description mb-30">
          Add public holidays to prevent task scheduling on these dates.
        </p>
        
        {/* Rest of the holidays page code... */}
      </div>
    </AppLayout>
  );
};

export default HolidaysPage;