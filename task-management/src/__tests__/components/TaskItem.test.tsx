import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { TaskContext } from '../../context/TaskContext';
import TaskItem from '../../components/TaskItem';
import { Task, AuthContextType, TaskContextType } from '../../types';

// Create a mock task
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  _id: 'task1',
  title: 'Test Task',
  description: 'Test Description',
  priority: 'Medium',
  dueDate: '2024-12-31',
  completed: false,
  user: 'user1',
  changes: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides
});

describe('TaskItem', () => {
  // Create a comprehensive mock context creator for AuthContext
  const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
    authState: {
      user: {
        role: 'user',
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com'
      },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      ...overrides.authState
    },
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    resetAuthState: jest.fn(),
    ...overrides
  });

  // Create a comprehensive mock context creator for TaskContext
  const createMockTaskContext = (overrides: Partial<TaskContextType> = {}): TaskContextType => ({
    taskState: {
      tasks: [],
      loading: false,
      error: null,
      task: null,
      ...overrides.taskState
    },
    createTask: jest.fn(),
    getTasks: jest.fn(),
    getTaskById: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    markTaskCompleted: jest.fn(),
    resetTaskState: jest.fn(),
    undoTaskChange: jest.fn(),
    ...overrides
  });

  // Render component with mock contexts
  const renderComponent = (
    task: Task = createMockTask(), 
    authContext: Partial<AuthContextType> = {
      authState: {
        user: { 
          role: 'admin',
          id: 'admin1',
          name: 'Admin User',
          email: 'admin@example.com'
        },
        token: 'admin-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    },
    taskContext: Partial<TaskContextType> = {}
  ) => {
    const mockAuthContext = createMockAuthContext(authContext);
    const mockTaskContext = createMockTaskContext(taskContext);

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <TaskContext.Provider value={mockTaskContext}>
            <TaskItem 
              task={task} 
              onTaskUpdated={jest.fn()} 
            />
          </TaskContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders task details correctly', () => {
    const task = createMockTask();
    renderComponent(task);
    
    expect(screen.getByText(task.title)).toBeInTheDocument();
    expect(screen.getByText(task.priority)).toBeInTheDocument();
    expect(screen.getByText(/due:/i)).toBeInTheDocument();
  });

  it('handles task completion toggle', async () => {
    const mockMarkTaskCompleted = jest.fn();
    
    const { getByRole } = renderComponent(
      createMockTask(), 
      {}, 
      { markTaskCompleted: mockMarkTaskCompleted }
    );
    
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(mockMarkTaskCompleted).toHaveBeenCalledWith(
        createMockTask()._id, 
        true
      );
    });
  });

  it('shows delete button for admin users', () => {
    renderComponent(
      createMockTask(),
      {
        authState: {
          user: { 
            role: 'admin',
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@example.com'
          },
          token: 'admin-token',
          isAuthenticated: true,
          isLoading: false,
          error: null
        }
      }
    );
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('disables delete button for non-admin users', () => {
    renderComponent(
      createMockTask(),
      {
        authState: {
          user: { 
            role: 'user',
            id: 'user1',
            name: 'Regular User',
            email: 'user@example.com'
          },
          token: 'user-token',
          isAuthenticated: true,
          isLoading: false,
          error: null
        }
      }
    );
    
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeDisabled();
  });

  it('shows undo button for tasks with changes', () => {
    const taskWithChanges = createMockTask({
      changes: [{ 
        field: 'title', 
        oldValue: 'Old Title', 
        newValue: 'New Title',
        timestamp: '2024-01-01',
        _id: 'change1'
      }]
    });

    renderComponent(taskWithChanges);
    
    expect(screen.getByText('Undo Last Change')).toBeInTheDocument();
  });

  it('handles delete confirmation flow', async () => {
    const mockDeleteTask = jest.fn();
    
    renderComponent(
      createMockTask(), 
      {
        authState: {
          user: { 
            role: 'admin',
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@example.com'
          },
          token: 'admin-token',
          isAuthenticated: true,
          isLoading: false,
          error: null
        }
      },
      { deleteTask: mockDeleteTask }
    );
    
    // First click shows confirmation
    fireEvent.click(screen.getByText('Delete'));
    
    // Confirm delete
    fireEvent.click(screen.getByText('Confirm Delete'));
    
    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith(createMockTask()._id);
    });
  });
});