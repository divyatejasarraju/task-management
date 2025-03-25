import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { AuthState, AuthContextType } from '../types';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';


// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: any; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: any; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'AUTH_RESET' }
  | { type: 'LOGOUT' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_RESET':
      return {
        ...initialState,
        token: null,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      // Clear any other stored state
      sessionStorage.clear();
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'REGISTER_REQUEST' });
      const res = await axios.post(`${API_URL}/users/register`, {
        name,
        email,
        password,
      });
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: { user: res.data.user, token: res.data.token },
      });
    } catch (err: any) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: err.response?.data?.message || 'Registration failed',
      });
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      const res = await axios.post(`${API_URL}/users/login`, {
        email,
        password,
      });
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: res.data.user, token: res.data.token },
      });
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: err.response?.data?.message || 'Login failed',
      });
    }
  };

  // Reset auth state
  const resetAuthState = useCallback(() => {
    dispatch({ type: 'AUTH_RESET' });
  }, []);

  // Logout user
  const logout = useCallback(() => {
    // First dispatch the logout action to clear auth state
    dispatch({ type: 'LOGOUT' });
    
    // Force page reload to ensure all state is cleared
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ authState, register, login, logout, resetAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};