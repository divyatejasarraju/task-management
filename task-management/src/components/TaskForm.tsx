import { useState, useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { useHoliday } from '../context/HolidayContext';
import { format } from 'date-fns';
import '../styles/TaskForm.css';

interface TaskFormProps {
  taskId?: string;
  onTaskSaved?: () => void;
}

const TaskForm = ({ taskId, onTaskSaved }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');
  
  const { taskState, createTask, getTaskById, updateTask } = useTask();
  const { holidayState, getHolidays, isHoliday } = useHoliday();
  
  // Fetch holidays when component mounts
  useEffect(() => {
    getHolidays();
  }, []);
  
  // If taskId is provided, fetch task data
  useEffect(() => {
    if (taskId) {
      getTaskById(taskId);
    }
  }, [taskId]);
  
  // Populate form with task data when available
  useEffect(() => {
    if (taskId && taskState.task) {
      setTitle(taskState.task.title);
      setDescription(taskState.task.description || '');
      setPriority(taskState.task.priority);
      setDueDate(format(new Date(taskState.task.dueDate), 'yyyy-MM-dd'));
    }
  }, [taskId, taskState.task]);
  
  const validateForm = (): boolean => {
    // Reset error
    setFormError('');
    
    // Check required fields
    if (!title.trim()) {
      setFormError('Title is required');
      return false;
    }
    
    if (!dueDate) {
      setFormError('Due date is required');
      return false;
    }
    
    // Check if due date is a holiday
    const dueDateObj = new Date(dueDate);
    if (isHoliday(dueDateObj)) {
      setFormError('Cannot set due date to a public holiday');
      return false;
    }
    
    // Check if due date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDateObj.setHours(0, 0, 0, 0);
    
    if (dueDateObj < today) {
      setFormError('Due date cannot be in the past');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const taskData = {
      title,
      description,
      priority,
      dueDate: new Date(dueDate).toISOString()
    };
    
    try {
      if (taskId) {
        // Update existing task
        await updateTask(taskId, taskData);
      } else {
        // Create new task
        await createTask(taskData);
      }
      
      // Clear form on success
      if (!taskId) {
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setDueDate('');
      }
      
      // Notify parent component
      if (onTaskSaved) {
        onTaskSaved();
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };
  
  // Display holidays warning
  const renderHolidayWarning = () => {
    if (dueDate && isHoliday(new Date(dueDate))) {
      return (
        <div className="holiday-warning">
          ⚠️ Selected date is a public holiday. Tasks cannot be scheduled on holidays.
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="task-form-container">
      <h2>{taskId ? 'Edit Task' : 'Create New Task'}</h2>
      
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="dueDate">Due Date*</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            required
          />
          {renderHolidayWarning()}
        </div>
        
        {formError && <div className="form-error">{formError}</div>}
        {taskState.error && <div className="form-error">{taskState.error}</div>}
        
        <div className="form-actions">
          <button
            type="submit"
            className="btn primary"
            disabled={taskState.loading}
          >
            {taskState.loading ? 'Saving...' : taskId ? 'Update Task' : 'Create Task'}
          </button>
          
          {taskId && (
            <button
              type="button"
              className="btn secondary"
              onClick={() => onTaskSaved && onTaskSaved()}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;