import { useEffect, useState } from 'react';
import { useTask } from '../context/TaskContext';
import TaskItem from './TaskItem';
import TaskFilter from './TaskFilter';
import '../styles/TaskList.css';

const TaskList = () => {
  const { taskState, getTasks } = useTask();
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch tasks on component mount and when filters change
  useEffect(() => {
    fetchTasks();
  }, [filters]);
  
  const fetchTasks = async () => {
    setIsLoading(true);
    await getTasks(filters);
    setIsLoading(false);
  };
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  
  // Group tasks by completion status
  const getTaskGroups = () => {
    const incomplete = taskState.tasks.filter(task => !task.completed);
    const completed = taskState.tasks.filter(task => task.completed);
    
    return { incomplete, completed };
  };
  
  const { incomplete, completed } = getTaskGroups();
  
  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>Your Tasks</h2>
        <button
          className="btn-refresh"
          onClick={fetchTasks}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <TaskFilter onFilterChange={handleFilterChange} />
      
      {taskState.error && (
        <div className="task-list-error">
          {taskState.error}
        </div>
      )}
      
      {taskState.loading ? (
        <div className="task-list-loading">
          Loading tasks...
        </div>
      ) : (
        <>
          {taskState.tasks.length === 0 ? (
            <div className="task-list-empty">
              <p>No tasks found. Create a new task to get started!</p>
            </div>
          ) : (
            <div className="task-list">
              {incomplete.length > 0 && (
                <div className="task-group">
                  <h3>Incomplete Tasks ({incomplete.length})</h3>
                  {incomplete.map(task => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onTaskUpdated={fetchTasks}
                    />
                  ))}
                </div>
              )}
              
              {completed.length > 0 && (
                <div className="task-group completed-group">
                  <h3>Completed Tasks ({completed.length})</h3>
                  {completed.map(task => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onTaskUpdated={fetchTasks}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskList;