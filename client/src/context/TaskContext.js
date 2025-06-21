import { createContext, useState, useContext, useEffect } from 'react';
import AuthContext from './AuthContext';

// API URL
const API_URL = 'http://localhost:5002/api';

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

  // Fetch tasks from API
  const fetchTasks = async () => {
    if (!user || !user.token) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tasks');
      }
      
      setTasks(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err.message);
      // Fall back to mock tasks
      setTasks(mockTasks);
      setLoading(false);
    }
  };

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Create a new task
  const createTask = async (taskData) => {
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create task');
      }
      
      // Update tasks list with new task
      setTasks([data.task, ...tasks]);
      
      // Update user data if returned
      if (data.user) {
        updateUserData(data.user);
      }
      
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      console.error('Error creating task:', err.message);
      
      // Fallback to local creation if server fails
      const newTask = {
        _id: Date.now().toString(),
        ...taskData,
        status: 'open',
        xpReward: taskData.xpReward || 10,
        completionXp: 30,
        createdAt: new Date().toISOString()
      };
      
      setTasks([newTask, ...tasks]);
      
      return { task: newTask, success: true };
    }
  };

  // Update a task
  const updateTask = async (id, taskData) => {
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task');
      }
      
      // Update tasks list with updated task
      const updatedTasks = tasks.map(task => 
        task._id === id ? data.task : task
      );
      
      setTasks(updatedTasks);
      
      // Update user data if returned (e.g., if XP was awarded)
      if (data.user) {
        updateUserData(data.user);
      }
      
      setLoading(false);
      return { ...data, success: true };
    } catch (err) {
      setLoading(false);
      console.error('Error updating task:', err.message);
      
      // Fallback to local update if server fails
      const taskIndex = tasks.findIndex(task => task._id === id);
      if (taskIndex === -1) {
        return { success: false, error: 'Task not found' };
      }
      
      const oldTask = tasks[taskIndex];
      const wasCompleted = oldTask.status !== 'done' && taskData.status === 'done';
      const wasUncompleted = oldTask.status === 'done' && taskData.status === 'open';
      
      const updatedTask = {
        ...oldTask,
        ...taskData,
        completedAt: wasCompleted ? new Date().toISOString() : (wasUncompleted ? null : oldTask.completedAt)
      };
      
      // Create a completely new array to ensure React detects the state change
      const updatedTasks = tasks.map(task => 
        task._id === id ? updatedTask : task
      );
      
      // Update the state with the new tasks array
      setTasks(updatedTasks);
      
      let updatedUser = { ...user };
      
      // If task was completed, award XP
      if (wasCompleted) {
        updatedUser.xp += updatedTask.completionXp || 30;
        
        // Check if user should level up
        if (updatedUser.xp >= updatedUser.xpToNextLevel) {
          updatedUser.level += 1;
          updatedUser.xp = updatedUser.xp - updatedUser.xpToNextLevel;
          updatedUser.xpToNextLevel = 100 + (updatedUser.level * 20);
        }
        
        updateUserData(updatedUser);
      }
      
      return {
        success: true,
        task: updatedTask,
        user: wasCompleted ? updatedUser : null
      };
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete task');
      }
      
      // Remove task from tasks list
      const updatedTasks = tasks.filter(task => task._id !== id);
      setTasks(updatedTasks);
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      console.error('Error deleting task:', err.message);
      
      // Fallback to local deletion if server fails
      const updatedTasks = tasks.filter(task => task._id !== id);
      setTasks(updatedTasks);
      
      return { success: true };
    }
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
