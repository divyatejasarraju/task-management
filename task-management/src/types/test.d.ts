// Component module declarations
declare module '../components/TaskItem' {
    import React from 'react';
    import { Task } from '../types';
  
    interface TaskItemProps {
      task: Task;
      onTaskUpdated: () => void;
    }
  
    const TaskItem: React.FC<TaskItemProps>;
    export default TaskItem;
  }
  
  declare module '../components/AdminRoute' {
    import React from 'react';
  
    interface AdminRouteProps {
      children: React.ReactNode;
    }
  
    const AdminRoute: React.FC<AdminRouteProps>;
    export default AdminRoute;
  }
  
  declare module '../components/RoleBasedButton' {
    import React from 'react';
  
    interface RoleBasedButtonProps {
      requiredRoles: ('admin' | 'validator' | 'user')[];
      children: React.ReactNode;
      className?: string;
      onClick?: () => void;
      type?: 'button' | 'submit' | 'reset';
      disabled?: boolean;
    }
  
    const RoleBasedButton: React.FC<RoleBasedButtonProps>;
    export default RoleBasedButton;
  }
  
  declare module '../components/RoleBasedComponent' {
    import React from 'react';
  
    interface RoleBasedComponentProps {
      requiredRoles: ('admin' | 'validator' | 'user')[];
      children: React.ReactNode;
    }
  
    const RoleBasedComponent: React.FC<RoleBasedComponentProps>;
    export default RoleBasedComponent;
  }
  
  declare module '../components/ProtectedRoute' {
    import React from 'react';
  
    interface ProtectedRouteProps {
      children: React.ReactNode;
      adminOnly?: boolean;
    }
  
    const ProtectedRoute: React.FC<ProtectedRouteProps>;
    export default ProtectedRoute;
  }
  
  declare module '../components/SignInForm' {
    import React from 'react';
  
    interface SignInFormProps {
      switchToSignUp: () => void;
    }
  
    const SignInForm: React.FC<SignInFormProps>;
    export default SignInForm;
  }
  
  declare module '../components/SignupForm' {
    import React from 'react';
  
    interface SignUpFormProps {
      switchToSignIn: () => void;
    }
  
    const SignUpForm: React.FC<SignUpFormProps>;
    export default SignUpForm;
  }
  
  declare module '../components/TaskFilter' {
    import React from 'react';
  
    interface TaskFilterProps {
      onFilterChange: (filters: {
        priority?: string;
        startDate?: string;
        endDate?: string;
        completed?: boolean | null;
      }) => void;
    }
  
    const TaskFilter: React.FC<TaskFilterProps>;
    export default TaskFilter;
  }
  
  declare module '../components/TaskForm' {
    import React from 'react';
  
    interface TaskFormProps {
      taskId?: string;
      onTaskSaved: () => void;
      initialData?: any;
    }
  
    const TaskForm: React.FC<TaskFormProps>;
    export default TaskForm;
  }
  
  declare module '../components/TaskHistory' {
    import React from 'react';
  
    interface TaskHistoryProps {
      taskId: string;
    }
  
    const TaskHistory: React.FC<TaskHistoryProps>;
    export default TaskHistory;
  }
  
  declare module '../components/TaskList' {
    import React from 'react';
  
    const TaskList: React.FC;
    export default TaskList;
  }