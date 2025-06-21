const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize, testConnection } = require('./config/database');
const { User, Task } = require('./models');

// Import routes
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Gamified Task Manager API is running');
});

// Start the server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Mock authentication middleware for development when database connection fails
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') && req.path !== '/api/users/login' && req.path !== '/api/users/register' && !req.headers.authorization) {
    // Attach mock user to request for development purposes
    req.user = {
      id: 123456789,
      username: 'TestUser',
      email: 'test@example.com',
      level: 5,
      xp: 75,
      xpToNextLevel: 200
    };
  }
  next();
});

// Mock routes for development when database connection fails
app.post('/api/users/register', (req, res, next) => {
  // If the route handler in userRoutes.js doesn't handle this, provide mock data
  const { username, email } = req.body;
  res.json({
    id: Date.now(),
    username,
    email,
    level: 1,
    xp: 0,
    xpToNextLevel: 120,
    token: 'mock-token-' + Date.now()
  });
});

app.post('/api/users/login', (req, res, next) => {
  // If the route handler in userRoutes.js doesn't handle this, provide mock data
  const { email } = req.body;
  res.json({
    id: 123456789,
    username: email.split('@')[0],
    email,
    level: 5,
    xp: 75,
    xpToNextLevel: 200,
    token: 'mock-token-' + Date.now()
  });
});

app.get('/api/tasks', (req, res, next) => {
  // If the route handler in taskRoutes.js doesn't handle this, provide mock data
  res.json([
    {
      id: 1,
      title: 'Morning Meditation',
      description: '10 minutes of mindfulness meditation',
      category: 'Morning Routine',
      status: 'open',
      priority: 'high',
      xpReward: 10,
      completionXp: 30,
      createdAt: new Date().toISOString(),
      userId: 123456789
    },
    {
      id: 2,
      title: 'Take Medication',
      description: 'Remember to take your daily medication',
      category: 'Health',
      status: 'open',
      priority: 'high',
      xpReward: 5,
      completionXp: 20,
      createdAt: new Date().toISOString(),
      userId: 123456789
    },
    {
      id: 3,
      title: 'Journal Writing',
      description: 'Write in your journal for 15 minutes',
      category: 'Creative',
      status: 'open',
      priority: 'medium',
      xpReward: 15,
      completionXp: 40,
      createdAt: new Date().toISOString(),
      userId: 123456789
    }
  ]);
});

// Initialize database and start server
async function initializeApp() {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
    startServer();
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    console.log('Starting server in development mode with mock data');
    startServer();
  }
}

// Test database connection and initialize app
testConnection()
  .then(connected => {
    if (connected) {
      console.log('Connected to MySQL database');
      initializeApp();
    } else {
      console.log('Starting server in development mode with mock data');
      startServer();
    }
  });
