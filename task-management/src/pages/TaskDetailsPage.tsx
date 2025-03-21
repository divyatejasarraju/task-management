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
  
  useEffect(() => {
    if (id) {
      getTaskById(id);
    }
  }, [id]);
  
  const handleToggleComplete = async () => {
    if (taskState.task) {
      await markTaskCompleted(id!, !taskState.task.completed);
      // Refresh task data
      getTaskById(id!);
    }
  };
  
  const handleDeleteTask = async () => {
    if (isConfirmingDelete) {
      await deleteTask(id!);
      navigate('/tasks');
    } else {
      setIsConfirmingDelete(true);
    }
  };
  
  const handleTaskSaved = () => {
    setIsEditing(false);
    // Refresh task data
    getTaskById(id!);
  };
  
  if (taskState.loading) {
    return (
      <AppLayout title="Task Details" showBackButton={true} backButtonPath="/tasks">
        <div className="loading-container">Loading task details...</div>
      </AppLayout>
    );
  }
  
  if (taskState.error) {
    return (
      <AppLayout title="Task Details" showBackButton={true} backButtonPath="/tasks">
        <div className="error-container">{taskState.error}</div>
      </AppLayout>
    );
  }
  
  if (!taskState.task) {
    return (
      <AppLayout title="Task Details" showBackButton={true} backButtonPath="/tasks">
        <div className="not-found-container">Task not found</div>
      </AppLayout>
    );
  }
  
  const { task } = taskState;
  const pageTitle = isEditing ? "Edit Task" : `Task: ${task.title}`;
  
  // Format due date
  const formattedDueDate = format(new Date(task.dueDate), 'MMMM dd, yyyy');
  
  // Check if task is overdue
  const isOverdue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return !task.completed && dueDate < today;
  };
  
  return (
    <AppLayout title={pageTitle} showBackButton={true} backButtonPath="/tasks">
      <div className="page-container">
        {!isEditing && (
          <div className="task-actions mb-30 flex gap-10">
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              Edit Task
            </button>
            
            <button
              className={`btn ${task.completed ? 'btn-secondary' : 'btn-success'}`}
              onClick={handleToggleComplete}
            >
              {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            
            <button
              className={`btn ${isConfirmingDelete ? 'btn-danger' : 'btn-secondary'}`}
              onClick={handleDeleteTask}
            >
              {isConfirmingDelete ? 'Confirm Delete' : 'Delete Task'}
            </button>
            
            {isConfirmingDelete && (
              <button
                className="btn btn-secondary"
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </button>
            )}
          </div>
        )}
        
        <div className="card mb-30">
          {isEditing ? (
            <HolidayProvider>
              <TaskForm taskId={id} onTaskSaved={handleTaskSaved} />
            </HolidayProvider>
          ) : (
            <div className="task-detail-view">
              <div className={`task-status ${task.completed ? 'completed' : ''} ${isOverdue() ? 'overdue' : ''}`}>
                {task.completed ? 'COMPLETED' : isOverdue() ? 'OVERDUE' : 'IN PROGRESS'}
              </div>
              
              <h1 className="task-title">{task.title}</h1>
              
              <div className="task-info">
                <div className="info-item">
                  <span className="info-label">Priority:</span>
                  <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Due Date:</span>
                  <span className="due-date">{formattedDueDate}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Created:</span>
                  <span className="created-date">{format(new Date(task.createdAt), 'MMMM dd, yyyy')}</span>
                </div>
              </div>
              
              {task.description && (
                <div className="task-description">
                  <h3>Description</h3>
                  <p>{task.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="card">
          <TaskHistory taskId={id!} />
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskDetailsPage;