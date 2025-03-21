import { useState } from 'react';
import AppLayout from '../components/layouts/AppLayout';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { TaskProvider } from '../context/TaskContext';
import { HolidayProvider } from '../context/HolidayContext';
import '../styles/TasksPage.css';

const TasksPage = () => {
  const [isShowingNewTaskForm, setIsShowingNewTaskForm] = useState(false);
  
  const toggleNewTaskForm = () => {
    setIsShowingNewTaskForm(!isShowingNewTaskForm);
  };
  
  const handleTaskSaved = () => {
    // Hide form after task is saved
    setIsShowingNewTaskForm(false);
  };
  
  return (
    <TaskProvider>
      <HolidayProvider>
        <AppLayout 
          title="Task Management" 
          showBackButton={true} 
          backButtonPath="/dashboard"
        >
          <div className="page-container">
            <div className="tasks-header mb-30">
              <h2 className="page-title">Your Tasks</h2>
              <button
                className={`btn ${isShowingNewTaskForm ? 'btn-danger' : 'btn-primary'}`}
                onClick={toggleNewTaskForm}
              >
                {isShowingNewTaskForm ? 'Cancel' : 'New Task'}
              </button>
            </div>
            
            {isShowingNewTaskForm ? (
              <div className="card mb-30">
                <TaskForm onTaskSaved={handleTaskSaved} />
              </div>
            ) : (
              <TaskList />
            )}
          </div>
        </AppLayout>
      </HolidayProvider>
    </TaskProvider>
  );
};

export default TasksPage;