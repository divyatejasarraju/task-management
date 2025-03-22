import { useState, useEffect, useCallback } from 'react';
import { useTask } from '../context/TaskContext';
import { format } from 'date-fns';
import { TaskChange } from '../types';
import '../styles/TaskHistory.css';

interface TaskHistoryProps {
  taskId: string;
}

// Define how many history items to show initially
const INITIAL_HISTORY_LIMIT = 5;
// API URL - use your actual API URL here
const API_URL = 'http://localhost:5001/api';  // Replace with your actual base URL

const TaskHistory = ({ taskId }: TaskHistoryProps) => {
  const { undoTaskChange } = useTask();
  const [historyLimit, setHistoryLimit] = useState(INITIAL_HISTORY_LIMIT);
  const [localHistory, setLocalHistory] = useState<TaskChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch history with limit
  const fetchLimitedHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get auth token from localStorage or wherever you store it
      const authToken = localStorage.getItem('token');
      
      // Build query params for pagination and field limiting
      const queryParams = new URLSearchParams({
        limit: historyLimit.toString(),
        fields: 'field,oldValue,newValue,timestamp'
      });
      
      // Make direct API call with limit and fields parameters
      const response = await fetch(`${API_URL}/tasks/${taskId}/history?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch task history');
      }
      
      const historyData = await response.json();
      setLocalHistory(historyData);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch task history');
    } finally {
      setIsLoading(false);
    }
  }, [taskId, historyLimit]);
  
  // Initial fetch
  useEffect(() => {
    if (taskId) {
      fetchLimitedHistory();
    }
  }, [taskId, historyLimit, fetchLimitedHistory]);
  
  const handleUndo = async () => {
    try {
      await undoTaskChange(taskId);
      // Refresh history after undo
      fetchLimitedHistory();
    } catch (err) {
      console.error('Error undoing change:', err);
      setError(err instanceof Error ? err.message : 'Failed to undo change');
    }
  };
  
  const handleLoadMore = () => {
    setHistoryLimit(prevLimit => prevLimit + 5);
  };
  
  // Format value based on field type
  const formatValue = (field: string, value: any): string => {
    if (field === 'dueDate' && value) {
      return format(new Date(value), 'MMM dd, yyyy');
    }
    
    if (field === 'completed') {
      return value ? 'Completed' : 'Incomplete';
    }
    
    return value !== undefined && value !== null ? String(value) : '-';
  };
  
  // Get human-readable field name
  const getFieldLabel = (field: string): string => {
    switch (field) {
      case 'title':
        return 'Title';
      case 'description':
        return 'Description';
      case 'priority':
        return 'Priority';
      case 'dueDate':
        return 'Due Date';
      case 'completed':
        return 'Status';
      default:
        return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };
  
  if (isLoading && localHistory.length === 0) {
    return <div className="task-history-loading">Loading history...</div>;
  }
  
  if (error && localHistory.length === 0) {
    return <div className="task-history-error">{error}</div>;
  }
  
  const hasMoreHistory = localHistory.length === historyLimit;
  
  return (
    <div className="task-history-container">
      <div className="task-history-header">
        <h3 className="task-history-title">Task History</h3>
        {localHistory.length > 0 && (
          <button
            className="undo-last-change-btn"
            onClick={handleUndo}
          >
            Undo Last Change
          </button>
        )}
      </div>
      
      {localHistory.length === 0 ? (
        <p className="task-history-empty">No changes have been made to this task.</p>
      ) : (
        <>
          <div className="task-history-list">
            {localHistory.map((change: TaskChange, index: number) => (
              <div key={change._id || index} className="history-item">
                <div className="history-time">
                  {format(new Date(change.timestamp), 'MMM dd, yyyy HH:mm')}
                </div>
                
                <div className="history-change">
                  <div className="change-field">{getFieldLabel(change.field)}</div>
                  <div className="change-values">
                    <div className="old-value">
                      <span className="value-label">From:</span> 
                      {formatValue(change.field, change.oldValue)}
                    </div>
                    <div className="new-value">
                      <span className="value-label">To:</span> 
                      {formatValue(change.field, change.newValue)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hasMoreHistory && (
            <div className="load-more-container">
              <button 
                className="load-more-btn"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More History'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskHistory;