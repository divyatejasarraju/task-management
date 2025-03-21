import { useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { format } from 'date-fns';
import { TaskChange } from '../types';
import '../styles/TaskHistory.css';

interface TaskHistoryProps {
  taskId: string;
}

const TaskHistory = ({ taskId }: TaskHistoryProps) => {
  const { taskState, getTaskHistory, undoTaskChange } = useTask();
  
  useEffect(() => {
    if (taskId) {
      getTaskHistory(taskId);
    }
  }, [taskId]);
  
  const handleUndo = async () => {
    await undoTaskChange(taskId);
    // Refresh history after undo
    getTaskHistory(taskId);
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
  
  if (taskState.loading) {
    return <div className="task-history-loading">Loading history...</div>;
  }
  
  if (taskState.error) {
    return <div className="task-history-error">{taskState.error}</div>;
  }
  
  return (
    <div className="task-history-container">
      <div className="task-history-header">
        <h3>Task History</h3>
        {taskState.history.length > 0 && (
          <button
            className="btn-undo"
            onClick={handleUndo}
          >
            Undo Last Change
          </button>
        )}
      </div>
      
      {taskState.history.length === 0 ? (
        <p className="task-history-empty">No changes have been made to this task.</p>
      ) : (
        <div className="task-history-list">
          {taskState.history.map((change: TaskChange, index: number) => (
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
      )}
    </div>
  );
};

export default TaskHistory;