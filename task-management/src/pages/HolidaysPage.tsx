import { useState, useEffect } from 'react';
import { useHoliday } from '../context/HolidayContext';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layouts/AppLayout';
import { format, parseISO } from 'date-fns';
import '../styles/HolidaysPage.css';

const HolidaysPage = () => {
  const { holidayState, getHolidays, addHoliday, deleteHoliday } = useHoliday();
  const { authState } = useAuth();
  
  // State for new holiday form
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: ''
  });
  
  // State for bulk import form
  const [bulkHolidays, setBulkHolidays] = useState('');
  const [formError, setFormError] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Check if user is admin or validator
  const isAdmin = authState.user?.role === 'admin' || authState.user?.role === 'validator';
  
  useEffect(() => {
    getHolidays();
  }, []);
  
  // Handle single holiday addition
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    
    // Validate inputs
    if (!newHoliday.name.trim()) {
      setFormError('Holiday name is required');
      return;
    }
    
    if (!newHoliday.date) {
      setFormError('Date is required');
      return;
    }
    
    try {
      await addHoliday(newHoliday);
      setSuccessMessage(`Successfully added ${newHoliday.name}`);
      
      // Reset form
      setNewHoliday({
        name: '',
        date: ''
      });
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Failed to add holiday');
    }
  };
  
  // Handle bulk import
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError('');
    setSuccessMessage('');
    
    if (!bulkHolidays.trim()) {
      setBulkError('Please enter holiday data');
      return;
    }
    
    try {
      // Parse the bulk input (expected format: name,YYYY-MM-DD on each line)
      const holidayLines = bulkHolidays.split('\n').filter(line => line.trim());
      let successCount = 0;
      let errorCount = 0;
      
      for (const line of holidayLines) {
        const [name, date] = line.split(',').map(item => item.trim());
        
        if (!name || !date) {
          errorCount++;
          continue;
        }
        
        try {
          // Validate date format
          parseISO(date);
          
          // Add holiday
          await addHoliday({ name, date });
          successCount++;
        } catch {
          errorCount++;
        }
      }
      
      // Set success message
      if (successCount > 0) {
        setSuccessMessage(`Successfully added ${successCount} holidays. ${errorCount > 0 ? `Failed to add ${errorCount} holidays.` : ''}`);
        setBulkHolidays('');
      } else if (errorCount > 0) {
        setBulkError(`Failed to add ${errorCount} holidays. Please check the format.`);
      }
    } catch (error: any) {
      setBulkError(error.response?.data?.message || 'Failed to process bulk import');
    }
  };
  
  // Handle holiday deletion
  const handleDeleteHoliday = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteHoliday(id);
        setSuccessMessage(`Successfully deleted ${name}`);
      } catch (error: any) {
        setFormError(error.response?.data?.message || 'Failed to delete holiday');
      }
    }
  };
  
  // Generate example holidays for the current year
  const generateExampleHolidays = () => {
    const currentYear = new Date().getFullYear();
    return `New Year's Day,${currentYear}-01-01
Martin Luther King Jr. Day,${currentYear}-01-15
Presidents' Day,${currentYear}-02-19
Memorial Day,${currentYear}-05-27
Independence Day,${currentYear}-07-04
Labor Day,${currentYear}-09-02
Veterans Day,${currentYear}-11-11
Thanksgiving Day,${currentYear}-11-28
Christmas Day,${currentYear}-12-25`;
  };
  
  // If not admin, this page shouldn't be accessible
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
      <div className="holidays-page">
        <div className="role-indicator">
          <span className={`role-badge role-${authState.user?.role}`}>
            {authState.user?.role}
          </span>
          <span className="role-message">
            You're managing holidays as an {authState.user?.role}
          </span>
        </div>
        
        <h2 className="page-title">Public Holidays Management</h2>
        <p className="page-description">
          Add public holidays to prevent task scheduling on these dates. Users will not be able to create tasks with due dates that fall on these holidays.
        </p>
        
        {/* Success message */}
        {successMessage && (
          <div className="success-message">
            <span>{successMessage}</span>
            <button 
              className="close-btn" 
              onClick={() => setSuccessMessage('')}
            >
              ×
            </button>
          </div>
        )}
        
        <div className="holiday-management-container">
          {/* Left side - Add single holiday */}
          <div className="holiday-form-container">
            <h3>Add Single Holiday</h3>
            {formError && <div className="error-message">{formError}</div>}
            
            <form onSubmit={handleAddHoliday} className="holiday-form">
              <div className="form-group">
                <label htmlFor="holiday-name">Holiday Name</label>
                <input
                  type="text"
                  id="holiday-name"
                  placeholder="e.g. New Year's Day"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="holiday-date">Date</label>
                <input
                  type="date"
                  id="holiday-date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="primary-button"
                disabled={holidayState.loading}
              >
                {holidayState.loading ? 'Adding...' : 'Add Holiday'}
              </button>
            </form>
          </div>
          
          {/* Right side - Bulk import */}
          <div className="holiday-bulk-container">
            <h3>Bulk Import Holidays</h3>
            {bulkError && <div className="error-message">{bulkError}</div>}
            
            <form onSubmit={handleBulkImport} className="bulk-form">
              <div className="form-group">
                <label htmlFor="bulk-holidays">
                  Enter one holiday per line in format: Name,YYYY-MM-DD
                </label>
                <textarea
                  id="bulk-holidays"
                  rows={10}
                  placeholder="New Year's Day,2024-01-01"
                  value={bulkHolidays}
                  onChange={(e) => setBulkHolidays(e.target.value)}
                  required
                />
              </div>
              
              <div className="bulk-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setBulkHolidays(generateExampleHolidays())}
                >
                  Load Example Holidays
                </button>
                
                <button 
                  type="submit" 
                  className="primary-button"
                  disabled={holidayState.loading}
                >
                  Import Holidays
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Current holidays list */}
        <div className="holidays-list-container">
          <h3>Current Holidays ({holidayState.holidays.length})</h3>
          
          {holidayState.loading ? (
            <div className="loading-indicator">Loading holidays...</div>
          ) : holidayState.holidays.length === 0 ? (
            <div className="empty-state">
              <p>No holidays have been added yet.</p>
              <p>Add holidays above to prevent task scheduling on these dates.</p>
            </div>
          ) : (
            <div className="holidays-table-container">
              <table className="holidays-table">
                <thead>
                  <tr>
                    <th>Holiday Name</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holidayState.holidays
                    .slice()
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((holiday) => (
                    <tr key={holiday._id}>
                      <td>{holiday.name}</td>
                      <td>{format(new Date(holiday.date), 'MMMM dd, yyyy')}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteHoliday(holiday._id, holiday.name)}
                          disabled={holidayState.loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default HolidaysPage;