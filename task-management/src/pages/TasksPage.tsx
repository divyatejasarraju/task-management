import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import AppLayout from '../components/layouts/AppLayout';
import TaskForm from '../components/TaskForm';
import { useTask } from '../context/TaskContext';
import { useHoliday } from '../context/HolidayContext';
import '../styles/TasksPage.css';

const TasksPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isShowingNewTaskForm, setIsShowingNewTaskForm] = useState(false);
  const [priority, setPriority] = useState('');
  const [completionStatus, setCompletionStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { taskState, getTasks, markTaskCompleted, deleteTask } = useTask();
  const { getHolidays } = useHoliday();
  
  // Check if we should show the form based on URL parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const showForm = queryParams.get('showForm') === 'true';
    
    setIsShowingNewTaskForm(showForm);
  }, [location.search]);
  
  // Load holidays on component mount
  useEffect(() => {
    getHolidays();
  }, []);
  
  // Fetch tasks on component mount and when filters change
  useEffect(() => {
    fetchTasks();
  }, [priority, completionStatus, startDate, endDate]);
  
  interface TaskFilters {
    priority?: string;
    completed?: boolean;
    startDate?: string;
    endDate?: string;
  }
  
  const fetchTasks = async () => {
    const filters: TaskFilters = {};
    
    if (priority) {
      filters.priority = priority;
    }
    
    if (completionStatus !== 'all') {
      filters.completed = completionStatus === 'completed';
    }
    
    if (startDate) {
      filters.startDate = startDate;
    }
    
    if (endDate) {
      filters.endDate = endDate;
    }
    
    await getTasks(filters);
  };
  
  const handleTaskSaved = () => {
    // After task is saved, navigate to tasks without the query param
    navigate('/tasks', { replace: true });
    fetchTasks();
  };
  
  const handleToggleComplete = async (taskId: string) => {
    const task = taskState.tasks.find(t => t._id === taskId);
    if (task) {
      await markTaskCompleted(taskId, !task.completed);
      fetchTasks();
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
      fetchTasks();
    }
  };
  
  const resetFilters = () => {
    setPriority('');
    setCompletionStatus('all');
    setStartDate('');
    setEndDate('');
  };
  
  // Group tasks by completion status
  const incomplete = taskState.tasks.filter(task => !task.completed);
  const completed = taskState.tasks.filter(task => task.completed);
  
  return (
    <AppLayout title="Task Management">
      <div className="tasks-page">
        {isShowingNewTaskForm ? (
          <div className="task-form-container">
            <TaskForm onTaskSaved={handleTaskSaved} />
          </div>
        ) : (
          <>
            <div className="filter-container">
              <h3 className="filter-title">Filter Tasks</h3>
              
              <div className="filter-grid">
                <div className="filter-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
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
                
                <button className="reset-btn" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="task-list-container">
              <div className="task-list-header">
                <h3>Incomplete Tasks ({incomplete.length})</h3>
              </div>
              
              {taskState.loading ? (
                <div className="empty-message">Loading tasks...</div>
              ) : incomplete.length === 0 ? (
                <div className="empty-message">No incomplete tasks found.</div>
              ) : (
                incomplete.map(task => (
                  <div className="task-item" key={task._id}>
                    <div className="task-checkbox">
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task._id)}
                      />
                    </div>
                    
                    <div className="task-content">
                      <div className="task-title-row">
                        <h4 className="task-title">{task.title}</h4>
                        <span className={`task-priority ${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <p className="task-description">{task.description}</p>
                      <p className="task-due-date">Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</p>
                    </div>
                    
                    <div className="task-actions">
                      <Link to={`/tasks/${task._id}`} className="view-details-btn">
                        View Details
                      </Link>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="task-list-container">
              <div className="task-list-header">
                <h3>Completed Tasks ({completed.length})</h3>
              </div>
              
              {taskState.loading ? (
                <div className="empty-message">Loading tasks...</div>
              ) : completed.length === 0 ? (
                <div className="empty-message">No completed tasks found.</div>
              ) : (
                completed.map(task => (
                  <div className="task-item" key={task._id}>
                    <div className="task-checkbox">
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task._id)}
                      />
                    </div>
                    
                    <div className="task-content">
                      <div className="task-title-row">
                        <h4 className="task-title">{task.title}</h4>
                        <span className={`task-priority ${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <p className="task-description">{task.description}</p>
                      <p className="task-due-date">Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</p>
                    </div>
                    
                    <div className="task-actions">
                      <Link to={`/tasks/${task._id}`} className="view-details-btn">
                        View Details
                      </Link>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="footer-controls">
              <button className="refresh-btn" onClick={fetchTasks}>
                Refresh
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default TasksPage;