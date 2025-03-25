import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignInForm from '../../components/SignInForm';

// Mock dependencies
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

describe('SignInForm Component', () => {
  const mockLogin = jest.fn();
  const mockResetAuthState = jest.fn();
  const mockNavigate = jest.fn();
  const mockSwitchToSignUp = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      authState: {
        isLoading: false,
        isAuthenticated: false,
        error: null
      },
      login: mockLogin,
      resetAuthState: mockResetAuthState
    });
    
    const { useNavigate } = require('react-router-dom');
    useNavigate.mockReturnValue(mockNavigate);
  });
  
  test('renders sign in form correctly', () => {
    render(<SignInForm switchToSignUp={mockSwitchToSignUp} />);
    
    expect(screen.getByPlaceholderText('Email id')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign up instead')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });
  
  test('handles form input changes', () => {
    render(<SignInForm switchToSignUp={mockSwitchToSignUp} />);
    
    const emailInput = screen.getByPlaceholderText('Email id');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
  
  test('handles form submission correctly', async () => {
    render(<SignInForm switchToSignUp={mockSwitchToSignUp} />);
    
    const emailInput = screen.getByPlaceholderText('Email id');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    // Fill form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
  
  test('disables submit button when loading', () => {
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      authState: {
        isLoading: true,
        isAuthenticated: false,
        error: null
      },
      login: mockLogin,
      resetAuthState: mockResetAuthState
    });
    
    render(<SignInForm switchToSignUp={mockSwitchToSignUp} />);
    
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });
  
  test('displays error message when authentication fails', () => {
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      authState: {
        isLoading: false,
        isAuthenticated: false,
        error: 'Invalid credentials'
      },
      login: mockLogin,
      resetAuthState: mockResetAuthState
    });
    
    render(<SignInForm switchToSignUp={mockSwitchToSignUp} />);
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
  
  test('navigates to dashboard after successful login', async () => {
    // First render with not authenticated
    render(<SignInForm switchToSignUp={mockSwitchToSignUp} />);
    
    // After submitting form, mock successful authentication
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      authState: {
        isLoading: false,
        isAuthenticated: true,
        error: null
      },
      login: mockLogin,
      resetAuthState: mockResetAuthState
    });
    
    // Simulate form submission
    fireEvent.change(screen.getByPlaceholderText('Email id'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    // Re-render component with updated auth state
    render(<SignInForm switchToSignUp={mockSwitchToSignUp} />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  test('switches to sign up form when clicked', () => {
    render(<SignInForm switchToSignUp={mockSwitchToSignUp} />);
    
    // Click the "Sign up instead" text
    fireEvent.click(screen.getByText('Sign up instead'));
    
    expect(mockResetAuthState).toHaveBeenCalled();
    expect(mockSwitchToSignUp).toHaveBeenCalled();
  });
  
  test('switches to sign up form when button clicked', () => {
    render(<SignInForm switchToSignUp={mockSwitchToSignUp} />);
    
    // Click the sign up button
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    
    expect(mockResetAuthState).toHaveBeenCalled();
    expect(mockSwitchToSignUp).toHaveBeenCalled();
  });
  
  test('resets form fields on component mount', () => {
    render(<SignInForm switchToSignUp={mockSwitchToSignUp} />);
    
    expect(screen.getByPlaceholderText('Email id')).toHaveValue('');
    expect(screen.getByPlaceholderText('Password')).toHaveValue('');
  });
});