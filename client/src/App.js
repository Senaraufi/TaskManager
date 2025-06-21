import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Header from './components/layout/Header';
// Import commented out for now
// import Login from './components/auth/Login';
// import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import './App.css';

// Mock user for development - bypassing authentication
const mockUser = {
  _id: '123456789',
  username: 'TestUser',
  email: 'test@example.com',
  level: 5,
  xp: 75,
  xpToNextLevel: 200,
  token: 'mock-token'
};

// Store mock user in localStorage
if (!localStorage.getItem('user')) {
  localStorage.setItem('user', JSON.stringify(mockUser));
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TaskProvider>
          <div className="App">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                {/* Authentication routes commented out for now */}
                {/* <Route path="/login" element={<Login />} /> */}
                {/* <Route path="/register" element={<Register />} /> */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Routes>
            </main>
          </div>
        </TaskProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
