import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Mock user for development
const mockUser = {
  _id: '123456789',
  username: 'TestUser',
  email: 'test@example.com',
  level: 5,
  xp: 75,
  xpToNextLevel: 200,
  token: 'mock-token'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } else {
      // Use mock user if no user in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
    
    setLoading(false);
  }, []);

  // Register new user (mock implementation)
  const register = (userData) => {
    setLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          _id: Date.now().toString(),
          ...userData,
          level: 1,
          xp: 0,
          xpToNextLevel: 120,
          token: 'mock-token-' + Date.now()
        };
        
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        setLoading(false);
        resolve(newUser);
      }, 500);
    });
  };

  // Login user (mock implementation)
  const login = (credentials) => {
    setLoading(true);
    setError(null);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple validation
        if (credentials.email === 'test@example.com' && credentials.password === 'password') {
          localStorage.setItem('user', JSON.stringify(mockUser));
          setUser(mockUser);
          setLoading(false);
          resolve(mockUser);
        } else {
          setLoading(false);
          setError('Invalid credentials');
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user data (e.g., after XP gain)
  const updateUserData = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
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
