import { createContext, useState, useContext, useEffect } from 'react';
import AuthContext from './AuthContext';

// API URL
const API_URL = 'http://localhost:5002/api';

const TaskContext = createContext();

// No more hardcoded mock tasks - users will add their own

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
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
      // Fall back to empty array
      setTasks([]);
      setLoading(false);
    }
  };

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
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
      throw err;
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
      
      // Update user data if returned (e.g., XP gained)
      if (data.user) {
        updateUserData(data.user);
      }
      
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      console.error('Error updating task:', err.message);
      
      // Fallback to local update if server fails
      const updatedTasks = tasks.map(task => {
        if (task._id === id) {
          return { ...task, ...taskData };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      throw err;
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
      
      // Remove task from list
      setTasks(tasks.filter(task => task._id !== id));
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      console.error('Error deleting task:', err.message);
      
      // Fallback to local deletion if server fails
      setTasks(tasks.filter(task => task._id !== id));
      throw err;
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
