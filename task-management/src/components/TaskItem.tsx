import { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Task } from '../types';
import '../styles/TaskItem.css';

interface TaskItemProps {
  task: Task;
  onTaskUpdated: () => void;
}

const TaskItem = ({ task, onTaskUpdated }: TaskItemProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { taskState, markTaskCompleted, deleteTask, undoTaskChange } = useTask();
  const { authState } = useAuth();
  
  const handleToggleComplete = async () => {
    await markTaskCompleted(task._id, !task.completed);
    onTaskUpdated();
  };
  
  const handleDeleteTask = async () => {
    try {
      setDeleteError(null);
      
      // Check if user has permission to delete
      if (!canDelete) {
        setDeleteError("Only administrators and validators can delete tasks");
        return;
      }
      
      if (isConfirmingDelete) {
        await deleteTask(task._id);
        onTaskUpdated();
      } else {
        setIsConfirmingDelete(true);
      }
    } catch (error) {
      // Handle the error if deleteTask throws an exception
      setDeleteError('Failed to delete task. You may not have permission.');
      setIsConfirmingDelete(false);
    }
  };
  
  const handleUndoChange = async () => {
    await undoTaskChange(task._id);
    onTaskUpdated();
  };
  
  // Check if user is admin or validator ONLY (not task owner)
  const canDelete = authState.user?.role === 'admin' || 
                   authState.user?.role === 'validator';
  
  // Determine priority class
  const getPriorityClass = () => {
    switch (task.priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return '';
    }
  };
  
  // Format due date
  const formattedDueDate = format(new Date(task.dueDate), 'MMM dd, yyyy');
  
  // Check if task is overdue
  const isOverdue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return !task.completed && dueDate < today;
  };
  
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}>
      <div className="task-header">
        <div className="task-checkbox">
          <input 
            type="checkbox" 
            checked={task.completed}
            onChange={handleToggleComplete}
          />
        </div>
        <div className="task-title">
          <h3>{task.title}</h3>
          <span className={`task-priority ${getPriorityClass()}`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      <div className="task-details">
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        
        <p className="task-due-date">
          <span className="due-label">Due:</span> {formattedDueDate}
          {isOverdue() && <span className="overdue-label">OVERDUE</span>}
        </p>
      </div>
      
      <div className="task-actions">
        <Link to={`/tasks/${task._id}`} className="btn-link">
          View Details
        </Link>
        
        {task.changes.length > 0 && (
          <button 
            className="btn-undo" 
            onClick={handleUndoChange}
            disabled={taskState.loading}
          >
            Undo Last Change
          </button>
        )}
        
        {/* Show delete button for admins/validators, show disabled button for regular users */}
        {canDelete ? (
          <>
            <button 
              className={`btn-delete ${isConfirmingDelete ? 'confirming' : ''}`}
              onClick={handleDeleteTask}
              disabled={taskState.loading}
            >
              {isConfirmingDelete ? 'Confirm Delete' : 'Delete'}
            </button>
            
            {isConfirmingDelete && (
              <button 
                className="btn-cancel"
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </button>
            )}
          </>
        ) : (
          <button 
            className="btn-delete disabled"
            disabled
            title="Only administrators and validators can delete tasks"
          >
            Delete
          </button>
        )}
        
        {/* Display error message if deletion fails */}
        {deleteError && (
          <div className="error-message">
            {deleteError}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;