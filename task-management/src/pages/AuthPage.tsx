import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import SignUpForm from '../components/SignupForm';
import SignInForm from '../components/SignInForm';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const { authState, resetAuthState } = useAuth();

  // Reset auth state when component mounts
  useEffect(() => {
    // This will clear any previous auth errors and reset the state
    resetAuthState();
  }, [resetAuthState]);

  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <AuthLayout>
      {isSignUp ? (
        <SignUpForm key="signup-form" switchToSignIn={() => setIsSignUp(false)} />
      ) : (
        <SignInForm key="signin-form" switchToSignUp={() => setIsSignUp(true)} />
      )}
    </AuthLayout>
  );
};

export default AuthPage;