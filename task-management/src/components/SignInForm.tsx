import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignInForm = ({ switchToSignUp }: { switchToSignUp: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, authState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    if (authState.isAuthenticated) {
      navigate('/dashboard');
    }
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
          Lost password? <span className="link">Click here!</span>
        </p>
        
        <div className="button-group">
          <button type="submit" className="btn primary">Sign In</button>
          <button type="button" className="btn secondary" onClick={switchToSignUp}>Sign Up</button>
        </div>
      </form>
      
      {authState.error && <p className="error-message">{authState.error}</p>}
    </div>
  );
};

export default SignInForm;