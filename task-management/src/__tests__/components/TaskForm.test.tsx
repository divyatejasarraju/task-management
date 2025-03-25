import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskContext } from '../../context/TaskContext';
import { HolidayContext } from '../../context/HolidayContext';
import TaskForm from '../../components/TaskForm';

// Mock contexts
const mockTaskContext = {
  taskState: {
    loading: false,
    error: null,
    task: null,
    tasks: []
  },
  createTask: jest.fn(),
  updateTask: jest.fn(),
  getTaskById: jest.fn(),
  deleteTask: jest.fn(),
  markTaskCompleted: jest.fn(),
  resetTaskState: jest.fn(),
  getTasks: jest.fn(),
  undoTaskChange: jest.fn()
};

const mockHolidayContext = {
  holidayState: {
    holidays: [
      { date: '2024-01-01', name: 'New Year\'s Day' }
    ]
  },
  getHolidays: jest.fn(),
  resetHolidayState: jest.fn(),
  isHoliday: jest.fn()
};

const renderComponent = (props = {}) => {
  return render(
    <TaskContext.Provider value={mockTaskContext}>
      <HolidayContext.Provider value={mockHolidayContext}>
        <TaskForm onTaskSaved={() => {}} {...props} />
      </HolidayContext.Provider>
    </TaskContext.Provider>
  );
};

describe('TaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    renderComponent();
    
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('creates a new task', async () => {
    const onTaskSaved = jest.fn();
    
    renderComponent({ onTaskSaved });
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/task title/i), { 
      target: { value: 'New Test Task' } 
    });
    fireEvent.change(screen.getByLabelText(/due date/i), { 
      target: { value: '2024-06-30' } 
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save task/i }));
    
    await waitFor(() => {
      expect(mockTaskContext.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Task',
          dueDate: '2024-06-30'
        })
      );
    });
  });

  it('updates existing task', async () => {
    const initialData = {
      _id: 'task1',
      title:'_Test Task',
      description: 'Initial description',
      priority: 'Medium',
      dueDate: '2024-07-15'
    };
    
    const onTaskSaved = jest.fn();
    
    renderComponent({ 
      taskId: 'task1', 
      initialData, 
      onTaskSaved 
    });
    
    // Verify pre-filled form
    const titleInput = screen.getByLabelText(/task title/i) as HTMLInputElement;
    expect(titleInput.value).toBe('_Test Task');
    
    // Modify task
    fireEvent.change(titleInput, { 
      target: { value: 'Updated Test Task' } 
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save task/i }));
    
    await waitFor(() => {
      expect(mockTaskContext.updateTask).toHaveBeenCalledWith(
        'task1',
        expect.objectContaining({
          title: 'Updated Test Task'
        })
      );
    });
  });

  it('shows validation errors', async () => {
    renderComponent();
    
    // Submit form without required fields
    fireEvent.click(screen.getByRole('button', { name: /save task/i }));
    
    // Check for error messages
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/due date is required/i)).toBeInTheDocument();
    });
  });

  it('warns about holiday dates', async () => {
    renderComponent();
    
    // Set a holiday date
    fireEvent.change(screen.getByLabelText(/due date/i), { 
      target: { value: '2024-01-01' } 
    });
    
    // Check for holiday warning
    await waitFor(() => {
      expect(screen.getByText(/cannot create tasks on public holidays/i)).toBeInTheDocument();
    });
  });

  it('suggests next workday', () => {
    renderComponent();
    
    // Click suggest next workday button
    const suggestButton = screen.getByRole('button', { name: /suggest next workday/i });
    fireEvent.click(suggestButton);
    
    // Verify date input has been updated
    const dateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
    expect(dateInput.value).not.toBe('');
  });

  it('handles date warnings for weekends', async () => {
    renderComponent();
    
    // Set a weekend date (2024-03-02 is a Saturday)
    fireEvent.change(screen.getByLabelText(/due date/i), { 
      target: { value: '2024-03-02' } 
    });
    
    // Check for weekend warning
    await waitFor(() => {
      expect(screen.getByText(/selected date falls on a weekend/i)).toBeInTheDocument();
    });
  });

  it('disables save button during loading', () => {
    const loadingTaskContext = {
      ...mockTaskContext,
      taskState: {
        ...mockTaskContext.taskState,
        loading: true
      }
    };
    
    render(
      <TaskContext.Provider value={loadingTaskContext}>
        <HolidayContext.Provider value={mockHolidayContext}>
          <TaskForm onTaskSaved={() => {}} />
        </HolidayContext.Provider>
      </TaskContext.Provider>
    );
    
    const saveButton = screen.getByRole('button', { name: /saving.../i });
    expect(saveButton).toBeDisabled();
  });
});
