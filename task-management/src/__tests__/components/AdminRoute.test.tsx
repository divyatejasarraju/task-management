import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AdminRoute from '../../components/AdminRoute';
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

describe('AdminRoute', () => {
  // Test component to render as children
  const TestComponent = () => <div>Admin Content</div>;

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
    authContext: Partial<AuthContextType> = {}
  ) => {
    const mockContext = createMockAuthContext(authContext);

    return render(
      <MemoryRouter 
        initialEntries={['/admin']}
        initialIndex={0}
        future={{ 
          v7_relativeSplatPath: true,
          v7_startTransition: true 
        }}
      >
        <AuthContext.Provider value={mockContext as AuthContextType | undefined}>
          <Routes>
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <TestComponent />
                </AdminRoute>
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

  it('handles null user gracefully', () => {
    renderComponent({
      authState: {
        isAuthenticated: true,
        isLoading: false,
        user: null,
        token: null,
        error: null
      }
    });
    
    // Should redirect to dashboard
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});