import { useState } from 'react';
import SignUpForm from '../components/SignupForm';
import SignInForm from '../components/SignInForm';
import { TaskManagerLogo } from '../components/TaskManagerLogo';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const { authState } = useAuth();

  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <TaskManagerLogo />
        <h1>Task Manager</h1>
        <h2></h2>
      </div>
      <div className="auth-right">
        {isSignUp ? (
          <SignUpForm switchToSignIn={() => setIsSignUp(false)} />
        ) : (
          <SignInForm switchToSignUp={() => setIsSignUp(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;