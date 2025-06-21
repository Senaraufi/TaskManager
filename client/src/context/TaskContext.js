import { createContext, useState, useContext, useEffect } from 'react';
import AuthContext from './AuthContext';

const TaskContext = createContext();

// Mock tasks for development
const mockTasks = [
  {
    _id: '1',
    title: 'Complete project setup',
    description: 'Set up the initial project structure and dependencies',
    status: 'done',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    xpReward: 10,
    completionXp: 30,
    completedAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Design user interface',
    description: 'Create wireframes and mockups for the main screens',
    status: 'open',
    priority: 'medium',
    dueDate: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
    xpReward: 10,
    completionXp: 30
  },
  {
    _id: '3',
    title: 'Implement authentication',
    description: 'Add login and registration functionality',
    status: 'open',
    priority: 'high',
    dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    xpReward: 10,
    completionXp: 30
  }
];

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(mockTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, updateUserData } = useContext(AuthContext);

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      // Simulate API call
      setLoading(true);
      setTimeout(() => {
        setTasks(mockTasks);
        setLoading(false);
      }, 500);
    } else {
      setTasks([]);
    }
  }, [user]);

  // Fetch all tasks (mock implementation)
  const fetchTasks = () => {
    setLoading(true);
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 500);
  };

  // Create a new task (mock implementation)
  const createTask = (taskData) => {
    setLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTask = {
          _id: Date.now().toString(),
          ...taskData,
          status: 'open',
          xpReward: 10,
          completionXp: 30,
          createdAt: new Date().toISOString()
        };
        
        setTasks([newTask, ...tasks]);
        
        // Mock user XP update
        const updatedUser = {
          ...user,
          xp: user.xp + 10
        };
        
        // Check if user should level up
        if (updatedUser.xp >= updatedUser.xpToNextLevel) {
          updatedUser.level += 1;
          updatedUser.xp = updatedUser.xp - updatedUser.xpToNextLevel;
          updatedUser.xpToNextLevel = 100 + (updatedUser.level * 20);
        }
        
        updateUserData(updatedUser);
        setLoading(false);
        
        resolve({
          task: newTask,
          user: updatedUser
        });
      }, 500);
    });
  };

  // Update a task (mock implementation)
  const updateTask = (id, taskData) => {
    setLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const taskIndex = tasks.findIndex(task => task._id === id);
        if (taskIndex === -1) {
          setLoading(false);
          return;
        }
        
        const oldTask = tasks[taskIndex];
        const wasCompleted = oldTask.status !== 'done' && taskData.status === 'done';
        
        const updatedTask = {
          ...oldTask,
          ...taskData,
          completedAt: wasCompleted ? new Date().toISOString() : oldTask.completedAt
        };
        
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = updatedTask;
        setTasks(updatedTasks);
        
        let updatedUser = { ...user };
        
        // If task was completed, award XP
        if (wasCompleted) {
          updatedUser.xp += updatedTask.completionXp;
          
          // Check if user should level up
          if (updatedUser.xp >= updatedUser.xpToNextLevel) {
            updatedUser.level += 1;
            updatedUser.xp = updatedUser.xp - updatedUser.xpToNextLevel;
            updatedUser.xpToNextLevel = 100 + (updatedUser.level * 20);
          }
          
          updateUserData(updatedUser);
        }
        
        setLoading(false);
        
        resolve({
          task: updatedTask,
          user: wasCompleted ? updatedUser : null
        });
      }, 500);
    });
  };

  // Delete a task (mock implementation)
  const deleteTask = (id) => {
    setLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        setTasks(tasks.filter(task => task._id !== id));
        setLoading(false);
        resolve();
      }, 500);
    });
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      error,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;
