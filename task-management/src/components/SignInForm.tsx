import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignInForm = ({ switchToSignUp }: { switchToSignUp: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, authState, resetAuthState } = useAuth();
  const navigate = useNavigate();

  // Reset form fields when component mounts or unmounts
  useEffect(() => {
    resetForm();
    
    // Cleanup function to reset fields when component unmounts
    return () => {
      resetForm();
    };
  }, []);

  const resetForm = () => {
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    if (authState.isAuthenticated) {
      resetForm();
      navigate('/dashboard');
    }
  };

  const handleSwitchToSignUp = () => {
    resetForm();
    resetAuthState(); // Clear any auth errors
    switchToSignUp();
  };

  return (
    <div className="auth-form">
      <h2>Sign In</h2>
      <div className="underline"></div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <p className="forgot-password">
          Don't have an account? <span className="link" onClick={handleSwitchToSignUp}>Sign up instead</span>
        </p>
        
        <div className="button-group">
          <button type="submit" className="btn primary" disabled={authState.isLoading}>
            {authState.isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          <button type="button" className="btn secondary" onClick={handleSwitchToSignUp}>
            Sign Up
          </button>
        </div>
      </form>
      
      {authState.error && <p className="error-message">{authState.error}</p>}
    </div>
  );
};

export default SignInForm;