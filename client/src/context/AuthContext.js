import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on initial load
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Set default axios auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/users/register', userData);
      
      // Save user to state and localStorage
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/users/login', userData);
      
      // Save user to state and localStorage
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update user data (level, xp)
  const updateUserData = (userData) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login,
      logout,
      updateUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
