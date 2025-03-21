export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'validator';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resetAuthState: () => void;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  completed: boolean;
  user: string;
  changes: TaskChange[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
  _id: string;
}

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilter {
  priority?: string;
  startDate?: string;
  endDate?: string;
  completed?: boolean | null;
}