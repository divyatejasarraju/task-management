import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route} from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import * as tokenValidation from '../../utils/tokenValidation';
import { AuthContextType } from '../../types';

// Mock Navigate component to check its usage
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn(({ to }) => {
    mockNavigate(to);
    return <div>Navigated to {to}</div>;
  })
}));

// Mock the token validation utility
jest.mock('../../utils/tokenValidation', () => ({
  validateToken: jest.fn()
}));

describe('ProtectedRoute', () => {
  // Test component to render as children
  const TestComponent = () => <div>Protected Content</div>;

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

  // Render component with mock context
  const renderComponent = (
    authContext: Partial<AuthContextType> = {}, 
    adminOnly = false
  ) => {
    const mockAuthContext = createMockAuthContext(authContext);

    return render(
      <MemoryRouter 
        initialEntries={['/protected']} 
        initialIndex={0}
        future={{ 
          v7_relativeSplatPath: true,
          v7_startTransition: true
        }}
      >
        <AuthContext.Provider value={mockAuthContext as AuthContextType | undefined}>
          <Routes>
            <Route 
              path="/protected" 
              element={
                <ProtectedRoute adminOnly={adminOnly}>
                  <TestComponent />
                </ProtectedRoute>
              } 
            />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/" element={<div>Login Page</div>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children for authenticated users', async () => {
    // Mock token validation to return true
    (tokenValidation.validateToken as jest.Mock).mockResolvedValue(true);

    renderComponent({
      authState: {
        isAuthenticated: true,
        isLoading: false,
        user: { 
          role: 'user',
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com'
        },
        token: 'test-token',
        error: null
      }
    });
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login for non-authenticated users', () => {
    renderComponent({
      authState: {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: null
      }
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows loading screen during authentication', () => {
    renderComponent({
      authState: {
        isAuthenticated: true,
        isLoading: true,
        user: null,
        token: null,
        error: null
      }
    });
    
    expect(screen.getByText('Verifying your login...')).toBeInTheDocument();
  });

  it('redirects non-admin users from admin-only routes', () => {
    renderComponent(
      {
        authState: {
          isAuthenticated: true,
          isLoading: false,
          user: { 
            role: 'user',
            id: 'user1',
            name: 'Test User',
            email: 'test@example.com'
          },
          token: 'test-token',
          error: null
        }
      },
      true // adminOnly
    );
    

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('allows access for admin users to admin-only routes', async () => {
    // Mock token validation to return true
    (tokenValidation.validateToken as jest.Mock).mockResolvedValue(true);

    renderComponent(
      {
        authState: {
          isAuthenticated: true,
          isLoading: false,
          user: { 
            role: 'admin',
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@example.com'
          },
          token: 'admin-token',
          error: null
        }
      },
      true // adminOnly
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows access for validator users to admin-only routes', async () => {
    // Mock token validation to return true
    (tokenValidation.validateToken as jest.Mock).mockResolvedValue(true);

    renderComponent(
      {
        authState: {
          isAuthenticated: true,
          isLoading: false,
          user: { 
            role: 'validator',
            id: 'validator1',
            name: 'Validator User',
            email: 'validator@example.com'
          },
          token: 'validator-token',
          error: null
        }
      },
      true // adminOnly
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('calls resetAuthState when token validation fails', async () => {
    // Mock token validation to return false
    (tokenValidation.validateToken as jest.Mock).mockResolvedValue(false);

    const mockResetAuthState = jest.fn();

    renderComponent({
      authState: {
        isAuthenticated: true,
        isLoading: false,
        user: { 
          role: 'user',
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com'
        },
        token: 'test-token',
        error: null
      },
      resetAuthState: mockResetAuthState
    });

    // Wait for the effect to run
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockResetAuthState).toHaveBeenCalled();
  });
});