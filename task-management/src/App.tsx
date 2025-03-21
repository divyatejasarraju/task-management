import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import HolidaysPage from './pages/HolidaysPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { HolidayProvider } from './context/HolidayContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import { checkAndClearToken } from './utils/tokenValidation';
import './styles/App.css'; // Add a new App.css file

function AppRoutes() {
  const { authState, resetAuthState } = useAuth();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Validate token on app startup
    const validateTokenOnStartup = async () => {
      try {
        await checkAndClearToken();
      } catch (error) {
        // If any error occurs during validation, reset auth state
        resetAuthState();
      } finally {
        setIsValidating(false);
      }
    };

    validateTokenOnStartup();
  }, [resetAuthState]);

  if (isValidating) {
    return <LoadingScreen message="Initializing application..." />;
  }

  return (
    <div className="app-wrapper">
      <Routes>
        <Route 
          path="/" 
          element={authState.isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <TaskDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/holidays"
          element={
            <ProtectedRoute>
              <HolidaysPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <div className="app-root">
      <AuthProvider>
        <TaskProvider>
          <HolidayProvider>
            <Router>
              <AppRoutes />
            </Router>
          </HolidayProvider>
        </TaskProvider>
      </AuthProvider>
    </div>
  );
}

export default App;