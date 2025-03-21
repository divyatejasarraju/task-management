import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { Task, TaskChange, TaskFilter } from '../types';

const API_URL = 'http://localhost:5001/api';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  success: boolean;
  task: Task | null;
  history: TaskChange[];
}

interface TaskContextType {
  taskState: TaskState;
  createTask: (task: Partial<Task>) => Promise<void>;
  getTasks: (filter?: TaskFilter) => Promise<void>;
  getTaskById: (id: string) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  undoTaskChange: (id: string) => Promise<void>;
  getTaskHistory: (id: string) => Promise<void>;
  markTaskCompleted: (id: string, completed: boolean) => Promise<void>;
  resetTaskState: () => void;
}

// Initial state
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  success: false,
  task: null,
  history: []
};

// Action types
type TaskAction =
  | { type: 'TASK_REQUEST' }
  | { type: 'TASK_SUCCESS'; payload: Task }
  | { type: 'TASKS_SUCCESS'; payload: Task[] }
  | { type: 'HISTORY_SUCCESS'; payload: TaskChange[] }
  | { type: 'TASK_FAIL'; payload: string }
  | { type: 'TASK_RESET' }
  | { type: 'TASK_STATE_RESET' };

// Reducer
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'TASK_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
        success: false
      };
    case 'TASK_SUCCESS':
      return {
        ...state,
        loading: false,
        success: true,
        task: action.payload,
        error: null
      };
    case 'TASKS_SUCCESS':
      return {
        ...state,
        loading: false,
        success: true,
        tasks: action.payload,
        error: null
      };
    case 'HISTORY_SUCCESS':
      return {
        ...state,
        loading: false,
        success: true,
        history: action.payload,
        error: null
      };
    case 'TASK_FAIL':
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload
      };
    case 'TASK_RESET':
      return {
        ...state,
        loading: false,
        success: false,
        error: null
      };
    case 'TASK_STATE_RESET':
      return initialState;
    default:
      return state;
  }
};

// Create context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [taskState, dispatch] = useReducer(taskReducer, initialState);
  
  // Configure axios with token from localStorage
  const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Create a new task
  const createTask = async (task: Partial<Task>) => {
    try {
      dispatch({ type: 'TASK_REQUEST' });
      const res = await axios.post(`${API_URL}/tasks`, task, getConfig());
      dispatch({ type: 'TASK_SUCCESS', payload: res.data });
    } catch (err: any) {
      dispatch({
        type: 'TASK_FAIL',
        payload: err.response?.data?.message || 'Failed to create task'
      });
    }
  };

  // Get all tasks with optional filtering
  const getTasks = async (filter?: TaskFilter) => {
    try {
      dispatch({ type: 'TASK_REQUEST' });
      
      let url = `${API_URL}/tasks`;
      if (filter) {
        const queryParams = new URLSearchParams();
        if (filter.priority) queryParams.append('priority', filter.priority);
        if (filter.startDate) queryParams.append('startDate', filter.startDate);
        if (filter.endDate) queryParams.append('endDate', filter.endDate);
        if (filter.completed !== undefined) queryParams.append('completed', String(filter.completed));
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const res = await axios.get(url, getConfig());
      
      dispatch({ type: 'TASKS_SUCCESS', payload: res.data });
    } catch (err: any) {
      dispatch({
        type: 'TASK_FAIL',
        payload: err.response?.data?.message || 'Failed to get tasks'
      });
    }
  };

  // Get a task by ID
  const getTaskById = async (id: string) => {
    try {
      dispatch({ type: 'TASK_REQUEST' });
      const res = await axios.get(`${API_URL}/tasks/${id}`, getConfig());
      dispatch({ type: 'TASK_SUCCESS', payload: res.data });
    } catch (err: any) {
      dispatch({
        type: 'TASK_FAIL',
        payload: err.response?.data?.message || 'Failed to get task'
      });
    }
  };

  // Update a task
  const updateTask = async (id: string, task: Partial<Task>) => {
    try {
      dispatch({ type: 'TASK_REQUEST' });
      const res = await axios.put(`${API_URL}/tasks/${id}`, task, getConfig());
      dispatch({ type: 'TASK_SUCCESS', payload: res.data });
    } catch (err: any) {
      dispatch({
        type: 'TASK_FAIL',
        payload: err.response?.data?.message || 'Failed to update task'
      });
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      dispatch({ type: 'TASK_REQUEST' });
      await axios.delete(`${API_URL}/tasks/${id}`, getConfig());
      // After deletion, we don't have a task to return, so just fetch all tasks again
      await getTasks();
    } catch (err: any) {
      dispatch({
        type: 'TASK_FAIL',
        payload: err.response?.data?.message || 'Failed to delete task'
      });
    }
  };

  // Undo last change to a task
  const undoTaskChange = async (id: string) => {
    try {
      dispatch({ type: 'TASK_REQUEST' });
      const res = await axios.post(`${API_URL}/tasks/${id}/undo`, {}, getConfig());
      dispatch({ type: 'TASK_SUCCESS', payload: res.data });
    } catch (err: any) {
      dispatch({
        type: 'TASK_FAIL',
        payload: err.response?.data?.message || 'Failed to undo task change'
      });
    }
  };

  // Get task history
  const getTaskHistory = async (id: string) => {
    try {
      dispatch({ type: 'TASK_REQUEST' });
      const res = await axios.get(`${API_URL}/tasks/${id}/history`, getConfig());
      dispatch({ type: 'HISTORY_SUCCESS', payload: res.data });
    } catch (err: any) {
      dispatch({
        type: 'TASK_FAIL',
        payload: err.response?.data?.message || 'Failed to get task history'
      });
    }
  };

  // Mark task as completed or not completed
  const markTaskCompleted = async (id: string, completed: boolean) => {
    try {
      dispatch({ type: 'TASK_REQUEST' });
      const res = await axios.put(
        `${API_URL}/tasks/${id}`,
        { completed },
        getConfig()
      );
      dispatch({ type: 'TASK_SUCCESS', payload: res.data });
    } catch (err: any) {
      dispatch({
        type: 'TASK_FAIL',
        payload: err.response?.data?.message || 'Failed to update task completion status'
      });
    }
  };

  // Reset task state
  const resetTaskState = useCallback(() => {
    dispatch({ type: 'TASK_STATE_RESET' });
  }, []);

  return (
    <TaskContext.Provider
      value={{
        taskState,
        createTask,
        getTasks,
        getTaskById,
        updateTask,
        deleteTask,
        undoTaskChange,
        getTaskHistory,
        markTaskCompleted,
        resetTaskState
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use task context
export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};