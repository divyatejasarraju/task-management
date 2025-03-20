import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="dashboard-content">
        <div className="user-info">
          <h2>User Profile</h2>
          <p><strong>Name:</strong> {authState.user?.name}</p>
          <p><strong>Email:</strong> {authState.user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;