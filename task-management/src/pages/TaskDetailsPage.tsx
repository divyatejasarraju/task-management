import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { HolidayProvider } from '../context/HolidayContext';
import TaskForm from '../components/TaskForm';
import TaskHistory from '../components/TaskHistory';
import AppLayout from '../components/layouts/AppLayout';
import { format } from 'date-fns';
import '../styles/TaskDetailsPage.css';

const TaskDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { taskState, getTaskById, markTaskCompleted, deleteTask } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cachedTask, setCachedTask] = useState(null);
  const [fetchedInitially, setFetchedInitially] = useState(false);
  
  // Only fetch task data on initial load and after operations (not during edits)
  const fetchTaskData = useCallback(async () => {
    if (id) {
      try {
        setIsLoaded(false);
        await getTaskById(id);
        // Add a small delay to ensure UI is stable
        setTimeout(() => setIsLoaded(true), 100);
      } catch (error) {
        console.error("Error fetching task data:", error);
        setIsLoaded(true); // Still mark as loaded to show error state
      }
    }
  }, [id, getTaskById]);
  
  // Initial data fetch - only runs once
  useEffect(() => {
    if (!fetchedInitially && id) {
      fetchTaskData();
      setFetchedInitially(true);
    }
  }, [id, fetchTaskData, fetchedInitially]);
  
  // Cache the task data when it's available
  useEffect(() => {
    if (taskState.task && !isEditing) {
      setCachedTask(taskState.task);
    }
  }, [taskState.task, isEditing]);
  
  const handleToggleComplete = async () => {
    if (taskState.task) {
      try {
        setIsLoaded(false);
        await markTaskCompleted(id!, !taskState.task.completed);
        // Refresh task data
        await getTaskById(id!);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error toggling task completion:", error);
        setIsLoaded(true);
      }
    }
  };
  
  const handleDeleteTask = async () => {
    if (isConfirmingDelete) {
      try {
        setIsLoaded(false);
        await deleteTask(id!);
        navigate('/tasks');
      } catch (error) {
        console.error("Error deleting task:", error);
        setIsLoaded(true);
      }
    } else {
      setIsConfirmingDelete(true);
    }
  };
  
  // Edit button handler - just switch to edit mode without API calls
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleTaskSaved = async () => {
    setIsEditing(false);
    // Only after saving do we need to refresh the data
    fetchTaskData();
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
  };
  
  const renderContent = () => {
    // Use cached task to prevent flashes during transitions
    const currentTask = taskState.task || cachedTask;
    
    if ((taskState.loading || !isLoaded) && !currentTask) {
      return <div className="task-loading-container">
        <div className="task-loading-spinner"></div>
        <p>Loading task details...</p>
      </div>;
    }
    
    if (taskState.error && !currentTask) {
      return <div className="task-error-container">
        <div className="task-error-icon">!</div>
        <p>{taskState.error}</p>
      </div>;
    }
    
    if (!currentTask) {
      return <div className="task-not-found-container">
        <div className="task-not-found-icon">?</div>
        <p>Task not found</p>
        <button 
          className="btn btn-primary mt-20" 
          onClick={() => navigate('/tasks')}
        >
          Back to Tasks
        </button>
      </div>;
    }
    
    return renderTaskDetails(currentTask);
  };
  
  const renderTaskDetails = (task) => {
    if (!task) return null;
    
    // Format due date
    const formattedDueDate = format(new Date(task.dueDate), 'MMMM dd, yyyy');
    const formattedCreatedDate = format(new Date(task.createdAt), 'MMMM dd, yyyy');
    
    // Check if task is overdue
    const isOverdue = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return !task.completed && dueDate < today;
    };
    
    return (
      <div className={`task-details-wrapper ${(taskState.loading || !isLoaded) && !isEditing ? 'loading-state' : ''}`}>
        <div className="task-action-buttons">
          <button 
            className="task-action-btn edit-btn" 
            onClick={handleEditClick}
            disabled={isEditing}
          >
            Edit Task
          </button>
          
          <button
            className={`task-action-btn ${task.completed ? 'incomplete-btn' : 'complete-btn'}`}
            onClick={handleToggleComplete}
            disabled={isEditing}
          >
            {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
          
          <button
            className={`task-action-btn ${isConfirmingDelete ? 'confirm-delete-btn' : 'delete-btn'}`}
            onClick={handleDeleteTask}
            disabled={isEditing}
          >
            {isConfirmingDelete ? 'Confirm Delete' : 'Delete Task'}
          </button>
          
          {isConfirmingDelete && (
            <button
              className="task-action-btn cancel-btn"
              onClick={handleCancelDelete}
              disabled={isEditing}
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="task-detail-card">
          {isEditing ? (
            <div className="task-edit-container">
              <HolidayProvider>
                <TaskForm taskId={id} onTaskSaved={handleTaskSaved} initialData={task} />
              </HolidayProvider>
            </div>
          ) : (
            <div className="task-detail-content">
              <div className="task-header">
                <div className={`task-status-badge ${task.completed ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}>
                  {task.completed ? 'COMPLETED' : isOverdue() ? 'OVERDUE' : 'IN PROGRESS'}
                </div>
                <h1 className="task-detail-title">{task.title}</h1>
              </div>
              
              <div className="task-info-grid">
                <div className="task-info-item">
                  <div className="info-label">Priority</div>
                  <div className={`priority-tag ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </div>
                </div>
                
                <div className="task-info-item">
                  <div className="info-label">Due Date</div>
                  <div className="info-value">{formattedDueDate}</div>
                </div>
                
                <div className="task-info-item">
                  <div className="info-label">Created</div>
                  <div className="info-value">{formattedCreatedDate}</div>
                </div>
              </div>
              
              {task.description && (
                <div className="task-description-section">
                  <h3 className="section-title">Description</h3>
                  <div className="task-description-content">{task.description}</div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="task-history-card">
          <TaskHistory taskId={id!} />
        </div>
      </div>
    );
  };
  
  // Determine page title dynamically using cached task if needed
  const currentTask = taskState.task || cachedTask;
  const pageTitle = currentTask 
    ? (isEditing ? "Edit Task" : `Task: ${currentTask.title}`)
    : "Task Details";
  
  return (
    <AppLayout title={pageTitle}>
      <div className="task-detail-page">
        {renderContent()}
      </div>
    </AppLayout>
  );
};

export default TaskDetailsPage;