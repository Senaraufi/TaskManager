import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, updateUserData } = useContext(AuthContext);

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user]);

  // Fetch all tasks for the current user
  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    }
  };

  // Create a new task
  const createTask = async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/tasks', taskData);
      
      // Add new task to state
      setTasks([response.data.task, ...tasks]);
      
      // Update user level and XP
      if (response.data.user) {
        updateUserData(response.data.user);
      }
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to create task');
      throw error;
    }
  };

  // Update a task
  const updateTask = async (id, taskData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`/api/tasks/${id}`, taskData);
      
      // Update task in state
      setTasks(tasks.map(task => 
        task._id === id ? response.data.task : task
      ));
      
      // Update user level and XP if task was completed
      if (response.data.user) {
        updateUserData(response.data.user);
      }
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to update task');
      throw error;
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`/api/tasks/${id}`);
      
      // Remove task from state
      setTasks(tasks.filter(task => task._id !== id));
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Failed to delete task');
      throw error;
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
