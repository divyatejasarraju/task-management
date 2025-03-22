import { useState, useEffect, FormEvent } from 'react';
import { useTask } from '../context/TaskContext';
import { useHoliday } from '../context/HolidayContext';
import { format, isWeekend, addDays } from 'date-fns';
import '../styles/TaskForm.css';

interface TaskFormProps {
  taskId?: string;
  onTaskSaved: () => void;
  initialData?: any;
}

const TaskForm = ({ taskId, onTaskSaved, initialData }: TaskFormProps) => {
  const { taskState, createTask, updateTask, getTaskById } = useTask();
  const { holidayState, getHolidays } = useHoliday();
  
  // Initialize form with initialData if provided
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'Medium',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
  });
  
  const [formErrors, setFormErrors] = useState({
    title: '',
    dueDate: ''
  });
  
  const [dateWarning, setDateWarning] = useState('');
  
  // Only fetch task data if editing and no initialData provided
  useEffect(() => {
    if (taskId && !initialData) {
      getTaskById(taskId);
    }
    
    // Always fetch holidays for date validation
    getHolidays();
  }, [taskId, initialData]);
  
  // Set form data from existing task when editing (only if initialData not provided)
  useEffect(() => {
    if (taskId && taskState.task && !initialData) {
      const task = taskState.task;
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd')
      });
    }
  }, [taskId, taskState.task, initialData]);
  
  const validateForm = (): boolean => {
    let isValid = true;
    const errors = {
      title: '',
      dueDate: ''
    };
    
    // Validate title
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }
    
    // Validate due date
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const checkDateWarnings = (date: string) => {
    const selectedDate = new Date(date);
    let warning = '';
    
    // Check if date is a weekend
    if (isWeekend(selectedDate)) {
      warning = 'Selected date falls on a weekend.';
    }
    
    // Check if date is a holiday
    const isHoliday = holidayState.holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return (
        holidayDate.getDate() === selectedDate.getDate() &&
        holidayDate.getMonth() === selectedDate.getMonth() &&
        holidayDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    
    if (isHoliday) {
      warning = warning 
        ? `${warning} This date is also a holiday.` 
        : 'Selected date is a holiday.';
    }
    
    setDateWarning(warning);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Check for date warnings
    if (name === 'dueDate' && value) {
      checkDateWarnings(value);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (taskId) {
        // Update existing task
        await updateTask(taskId, formData);
      } else {
        // Create new task
        await createTask(formData);
      }
      
      onTaskSaved();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };
  
  const handleSuggestNextWorkday = () => {
    let nextWorkday = new Date();
    nextWorkday = addDays(nextWorkday, 1);
    
    // Find the next non-weekend day
    while (isWeekend(nextWorkday)) {
      nextWorkday = addDays(nextWorkday, 1);
    }
    
    // Format for input
    const formattedDate = format(nextWorkday, 'yyyy-MM-dd');
    
    setFormData(prev => ({
      ...prev,
      dueDate: formattedDate
    }));
    
    checkDateWarnings(formattedDate);
  };
  
  return (
    <div className="task-form">
      <h2 className="form-title">{taskId ? 'Edit Task' : 'Create New Task'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={formErrors.title ? 'error' : ''}
          />
          {formErrors.title && <span className="error-message">{formErrors.title}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <div className="date-input-group">
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={formErrors.dueDate ? 'error' : ''}
              />
              <button 
                type="button" 
                className="suggest-date-btn"
                onClick={handleSuggestNextWorkday}
              >
                Suggest Next Workday
              </button>
            </div>
            {formErrors.dueDate && <span className="error-message">{formErrors.dueDate}</span>}
            {dateWarning && <span className="warning-message">{dateWarning}</span>}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="save-btn"
            disabled={taskState.loading}
          >
            {taskState.loading ? 'Saving...' : 'Save Task'}
          </button>
          
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onTaskSaved}
            disabled={taskState.loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;