import { useState, useEffect } from 'react';
import { useHoliday } from '../context/HolidayContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Navigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import '../styles/HolidaysPage.css';

const HolidaysPage = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  
  const { holidayState, getHolidays, addHoliday, deleteHoliday } = useHoliday();
  const { authState } = useAuth();
  
  // Only admin users can access this page
  const isAdmin = authState.user && (authState.user.role === 'admin' || authState.user.role === 'validator');
  
  useEffect(() => {
    getHolidays();
  }, []);
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!name.trim()) {
      setError('Holiday name is required');
      return;
    }
    
    if (!date) {
      setError('Date is required');
      return;
    }
    
    // Check if date is in the past
    const holidayDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (holidayDate < today) {
      setError('Cannot add holidays in the past');
      return;
    }
    
    // Clear error
    setError('');
    
    try {
      await addHoliday({ name, date });
      
      // Clear form on success
      setName('');
      setDate('');
    } catch (err) {
      console.error('Error adding holiday:', err);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteHoliday(id);
    } catch (err) {
      console.error('Error deleting holiday:', err);
    }
  };
  
  return (
    <AppLayout title="Manage Holidays" showBackButton={true} backButtonPath="/dashboard">
      <div className="page-container">
        <h2 className="page-title mb-20">Public Holidays</h2>
        <p className="holidays-description mb-30">
          Add public holidays to prevent task scheduling on these dates.
        </p>
        
        <div className="holidays-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Add New Holiday</h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Holiday Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter holiday name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              
              {error && <div className="form-error">{error}</div>}
              {holidayState.error && <div className="form-error">{holidayState.error}</div>}
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={holidayState.loading}
              >
                {holidayState.loading ? 'Adding...' : 'Add Holiday'}
              </button>
            </form>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Upcoming Holidays</h3>
            </div>
            
            {holidayState.loading ? (
              <div className="loading-container">Loading holidays...</div>
            ) : holidayState.holidays.length === 0 ? (
              <div className="empty-state">No holidays have been added yet.</div>
            ) : (
              <div className="holidays-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidayState.holidays.map(holiday => (
                      <tr key={holiday._id}>
                        <td>{holiday.name}</td>
                        <td>{format(new Date(holiday.date), 'MMMM dd, yyyy')}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(holiday._id)}
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
      </div>
    </AppLayout>
  );
};

export default HolidaysPage;