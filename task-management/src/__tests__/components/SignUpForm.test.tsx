import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import SignUpForm from '../../components/SignupForm';
import { AuthContextType } from '../../types';

// Mock react-router-dom navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

describe('SignUpForm', () => {
  // Create a comprehensive mock context creator
  const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
    authState: {
      user: null,
      token: null,
      isAuthenticated: false,
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

  // Render component with mock context
  const renderComponent = (
    authContext: Partial<AuthContextType> = {}, 
    switchToSignIn = jest.fn()
  ) => {
    const mockContext = createMockAuthContext(authContext);

    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContext}>
          <SignUpForm switchToSignIn={switchToSignIn} />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(jest.fn());
  });

  it('renders signup form correctly', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email id')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const mockRegister = jest.fn();
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    renderComponent({
      register: mockRegister,
      authState: {
        isAuthenticated: true,
        isLoading: false,
        user: null,
        token: 'test-token',
        error: null
      }
    });
    
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('Name'), { 
      target: { value: 'Test User' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email id'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { value: 'password123' } 
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Verify register was called
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
    });
  });

  it('shows error message when registration fails', () => {
    renderComponent({
      authState: {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: 'Registration failed'
      }
    });
    
    expect(screen.getByText('Registration failed')).toBeInTheDocument();
  });

  it('disables submit button during loading', () => {
    renderComponent({
      authState: {
        isAuthenticated: false,
        isLoading: true,
        user: null,
        token: null,
        error: null
      }
    });
    
    const submitButton = screen.getByRole('button', { name: /signing up.../i });
    expect(submitButton).toBeDisabled();
  });

  it('switches to sign in form', () => {
    const mockSwitchToSignIn = jest.fn();
    
    renderComponent({}, mockSwitchToSignIn);
    
    // Click on "Sign in instead" link
    fireEvent.click(screen.getByText(/sign in instead/i));
    
    expect(mockSwitchToSignIn).toHaveBeenCalled();
  });
});