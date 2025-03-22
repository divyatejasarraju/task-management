import { useState, useEffect } from 'react';
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
  
  useEffect(() => {
    const fetchTaskData = async () => {
      if (id) {
        await getTaskById(id);
        // Add a small delay to ensure UI is stable
        setTimeout(() => setIsLoaded(true), 100);
      }
    };
    
    fetchTaskData();
  }, [id]);
  
  const handleToggleComplete = async () => {
    if (taskState.task) {
      setIsLoaded(false);
      await markTaskCompleted(id!, !taskState.task.completed);
      // Refresh task data
      await getTaskById(id!);
      setIsLoaded(true);
    }
  };
  
  const handleDeleteTask = async () => {
    if (isConfirmingDelete) {
      setIsLoaded(false);
      await deleteTask(id!);
      navigate('/tasks');
    } else {
      setIsConfirmingDelete(true);
    }
  };
  
  const handleTaskSaved = async () => {
    setIsEditing(false);
    setIsLoaded(false);
    // Refresh task data
    await getTaskById(id!);
    setIsLoaded(true);
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
  };
  
  const renderContent = () => {
    if (taskState.loading || !isLoaded) {
      return <div className="task-loading-container">
        <div className="task-loading-spinner"></div>
        <p>Loading task details...</p>
      </div>;
    }
    
    if (taskState.error) {
      return <div className="task-error-container">
        <div className="task-error-icon">!</div>
        <p>{taskState.error}</p>
      </div>;
    }
    
    if (!taskState.task) {
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
    
    return renderTaskDetails();
  };
  
  const renderTaskDetails = () => {
    if (!taskState.task) return null;
    
    const { task } = taskState;
    
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
      <>
        <div className="task-action-buttons">
          <button 
            className="task-action-btn edit-btn" 
            onClick={() => setIsEditing(true)}
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
                <TaskForm taskId={id} onTaskSaved={handleTaskSaved} />
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
      </>
    );
  };
  
  // Determine page title dynamically
  const pageTitle = taskState.task 
    ? (isEditing ? "Edit Task" : `Task: ${taskState.task.title}`)
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