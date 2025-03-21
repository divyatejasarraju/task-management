import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import '../styles/TaskFilter.css';

interface TaskFilterProps {
  onFilterChange: (filters: {
    priority?: string;
    startDate?: string;
    endDate?: string;
    completed?: boolean | null;
  }) => void;
}

const TaskFilter = ({ onFilterChange }: TaskFilterProps) => {
  const [priority, setPriority] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [completionStatus, setCompletionStatus] = useState<string>('all');
  
  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [priority, startDate, endDate, completionStatus]);
  
  const applyFilters = () => {
    const filters: {
      priority?: string;
      startDate?: string;
      endDate?: string;
      completed?: boolean | null;
    } = {};
    
    if (priority) {
      filters.priority = priority;
    }
    
    if (startDate) {
      filters.startDate = startDate;
    }
    
    if (endDate) {
      filters.endDate = endDate;
    }
    
    if (completionStatus !== 'all') {
      filters.completed = completionStatus === 'completed';
    }
    
    onFilterChange(filters);
  };
  
  const resetFilters = () => {
    setPriority('');
    setStartDate('');
    setEndDate('');
    setCompletionStatus('all');
  };
  
  return (
    <div className="task-filter">
      <h3>Filter Tasks</h3>
      
      <div className="filter-form">
        <div className="filter-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="completion">Status</label>
          <select
            id="completion"
            value={completionStatus}
            onChange={(e) => setCompletionStatus(e.target.value)}
          >
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="startDate">From Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="endDate">To Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
        </div>
        
        <div className="filter-actions">
          <button
            type="button"
            className="btn-reset"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;