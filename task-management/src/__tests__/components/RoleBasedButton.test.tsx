import { render } from '@testing-library/react';
import { AuthContext } from '../../context/AuthContext';
import RoleBasedComponent from '../../components/RoleBasedComponent';
import { AuthContextType } from '../../types';

describe('RoleBasedComponent', () => {
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

  const renderComponent = (
    options: {
      authContext?: Partial<AuthContextType>;
      requiredRoles?: ('admin' | 'validator' | 'user')[];
    } = {}
  ) => {
    const {
      authContext = {},
      requiredRoles = ['user']
    } = options;

    const mockContext = createMockAuthContext(authContext);

    return render(
      <AuthContext.Provider value={mockContext}>
        <RoleBasedComponent requiredRoles={requiredRoles}>
          <div>Protected Content</div>
        </RoleBasedComponent>
      </AuthContext.Provider>
    );
  };

  it('renders children for matching user role', () => {
    const { getByText } = renderComponent({
      authContext: {
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
      }
    });
    
    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render children for non-matching role', () => {
    const { container } = renderComponent({
      authContext: {
        authState: {
          isAuthenticated: true,
          isLoading: false,
          user: { 
            role: 'admin',
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@example.com'
          },
          token: 'test-token',
          error: null
        }
      },
      requiredRoles: ['user']
    });
    
    expect(container.innerHTML).toBe('');
  });

  it('renders children for null user when "user" is in required roles', () => {
    const { getByText } = renderComponent({
      authContext: {
        authState: {
          isAuthenticated: true,
          isLoading: false,
          user: null,
          token: null,
          error: null
        }
      },
      requiredRoles: ['user']
    });
    
    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render children for null user when "user" is not in required roles', () => {
    const { container } = renderComponent({
      authContext: {
        authState: {
          isAuthenticated: true,
          isLoading: false,
          user: null,
          token: null,
          error: null
        }
      },
      requiredRoles: ['admin', 'validator']
    });
    
    expect(container.innerHTML).toBe('');
  });

  it('supports multiple allowed roles', () => {
    const { getByText } = renderComponent({
      authContext: {
        authState: {
          isAuthenticated: true,
          isLoading: false,
          user: { 
            role: 'admin',
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@example.com'
          },
          token: 'test-token',
          error: null
        }
      },
      requiredRoles: ['admin', 'validator']
    });
    
    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render for user with role not in allowed roles', () => {
    const { container } = renderComponent({
      authContext: {
        authState: {
          isAuthenticated: true,
          isLoading: false,
          user: { 
            role: 'validator',
            id: 'validator1',
            name: 'Validator User',
            email: 'validator@example.com'
          },
          token: 'test-token',
          error: null
        }
      },
      requiredRoles: ['user']
    });
    
    expect(container.innerHTML).toBe('');
  });
});