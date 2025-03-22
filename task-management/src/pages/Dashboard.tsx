import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { format } from 'date-fns';
import AppLayout from '../components/layouts/AppLayout';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { taskState, getTasks } = useTask();
  const [statsSummary, setStatsSummary] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    highPriority: 0
  });

  useEffect(() => {
    // Fetch tasks on component mount
    getTasks();
  }, []);

  // Calculate task statistics when tasks are loaded
  useEffect(() => {
    if (taskState.tasks.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const total = taskState.tasks.length;
      const completed = taskState.tasks.filter(task => task.completed).length;
      
      const overdue = taskState.tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return !task.completed && dueDate < today;
      }).length;
      
      const dueToday = taskState.tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return !task.completed && dueDate.getTime() === today.getTime();
      }).length;
      
      const highPriority = taskState.tasks.filter(task => 
        !task.completed && task.priority === 'High'
      ).length;
      
      setStatsSummary({
        total,
        completed,
        overdue,
        dueToday,
        highPriority
      });
    }
  }, [taskState.tasks]);

  // Get recently updated tasks
  const getRecentTasks = () => {
    return [...taskState.tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  };

  const recentTasks = getRecentTasks();

  return (
    <AppLayout title="Dashboard">
      <div className="dashboard-container">
        <div className="dashboard-welcome">
          <h2>Welcome to your task dashboard!</h2>
          <p>Here's an overview of your tasks and activities.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <div className="stat-value">{statsSummary.total}</div>
          </div>
          
          <div className="stat-card">
            <h3>Completed</h3>
            <div className="stat-value">
              {statsSummary.completed}
              <span className="stat-percentage">
                {statsSummary.total > 0 
                  ? `(${Math.round((statsSummary.completed / statsSummary.total) * 100)}%)` 
                  : '(0%)'}
              </span>
            </div>
          </div>
          
          <div className="stat-card overdue">
            <h3>Overdue</h3>
            <div className="stat-value">{statsSummary.overdue}</div>
          </div>
          
          <div className="stat-card">
            <h3>Due Today</h3>
            <div className="stat-value">{statsSummary.dueToday}</div>
          </div>
          
          <div className="stat-card">
            <h3>High Priority</h3>
            <div className="stat-value">{statsSummary.highPriority}</div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/tasks" className="dashboard-button primary">
            View All Tasks
          </Link>
          <Link to="/tasks" className="dashboard-button secondary">
            Create New Task
          </Link>
        </div>

        <div className="recent-tasks-container">
          <div className="recent-header">
            <h2>Recent Tasks</h2>
            <Link to="/tasks" className="view-all">
              View All
            </Link>
          </div>

          {taskState.loading ? (
            <div className="loading-message">Loading tasks...</div>
          ) : recentTasks.length === 0 ? (
            <div className="empty-message">
              <p>You have no tasks yet. Create your first task to get started!</p>
            </div>
          ) : (
            <div className="tasks-table-wrapper">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map(task => (
                    <tr key={task._id}>
                      <td className="task-title-cell">{task.title}</td>
                      <td>
                        <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</td>
                      <td>
                        <span className={`status-badge ${task.completed ? 'completed' : 'pending'}`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/tasks/${task._id}`} className="view-details-button">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;