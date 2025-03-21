import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

/**
 * Validates the stored token on application startup
 * Returns true if token is valid, false otherwise
 */
export const validateToken = async (): Promise<boolean> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    
    // Make a request to a protected endpoint to validate the token
    await axios.get(`${API_URL}/users/profile`, config);
    return true;
  } catch (error) {
    // Token is invalid or expired
    localStorage.removeItem('token');
    return false;
  }
};

/**
 * Verifies token and clears invalid tokens from storage
 */
export const checkAndClearToken = async () => {
  const isValid = await validateToken();
  
  if (!isValid && localStorage.getItem('token')) {
    // Token exists but is invalid - clear it
    localStorage.removeItem('token');
    // Clear any other stored state
    sessionStorage.clear();
    // Force redirect to login page
    window.location.href = '/';
  }
};