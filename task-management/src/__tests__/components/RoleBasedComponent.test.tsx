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
    authContext: Partial<AuthContextType> = {}, 
    requiredRoles: ('admin' | 'validator' | 'user')[] = ['user']
  ) => {
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
    
    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render children for non-matching role', () => {
    const { container } = renderComponent(
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
          token: 'test-token',
          error: null
        }
      },
      ['user']
    );
    
    expect(container.innerHTML.trim()).toBe('');
  });


  it('supports multiple allowed roles', () => {
    const { getByText } = renderComponent(
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
          token: 'test-token',
          error: null
        }
      },
      ['admin', 'validator']
    );
    
    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render for user with role not in allowed roles', () => {
    const { container } = renderComponent(
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
          token: 'test-token',
          error: null
        }
      },
      ['user']
    );
    
    expect(container.innerHTML.trim()).toBe('');
  });
});
