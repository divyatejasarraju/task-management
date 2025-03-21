import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignUpForm = ({ switchToSignIn }: { switchToSignIn: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, authState, resetAuthState } = useAuth();
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
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(name, email, password);
    if (authState.isAuthenticated) {
      resetForm();
      navigate('/dashboard');
    }
  };

  const handleSwitchToSignIn = () => {
    resetForm();
    resetAuthState(); // Clear any auth errors
    switchToSignIn();
  };

  return (
    <div className="auth-form">
      <h2>Sign Up</h2>
      <div className="underline"></div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
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
          Already have an account? <span className="link" onClick={handleSwitchToSignIn}>Sign in instead</span>
        </p>
        
        <div className="button-group">
          <button type="submit" className="btn primary" disabled={authState.isLoading}>
            {authState.isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
          <button type="button" className="btn secondary" onClick={handleSwitchToSignIn}>
            Sign In
          </button>
        </div>
      </form>
      
      {authState.error && <p className="error-message">{authState.error}</p>}
    </div>
  );
};

export default SignUpForm;
