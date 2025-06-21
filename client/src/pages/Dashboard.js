import React, { useContext, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import TaskContext from '../context/TaskContext';
import AuthContext from '../context/AuthContext';
import { FaStar, FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';

const Dashboard = () => {
  const { tasks, loading: tasksLoading, updateTask, createTask, deleteTask } = useContext(TaskContext);
  const { user } = useContext(AuthContext);
  
  // State variables - defined at the top to avoid initialization errors
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Morning Routine',
    priority: 'medium',
    xpReward: 10
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Available categories
  const availableCategories = [
    'Morning Routine',
    'Health',
    'Creative',
    'Evening Routine',
    'Work',
    'Learning',
    'Social'
  ];

  // Group tasks by category
  const tasksByCategory = {};
  
  // Initialize all available categories
  availableCategories.forEach(category => {
    tasksByCategory[category] = [];
  });
  
  // Add any custom categories from existing tasks
  tasks.forEach(task => {
    const category = task.category || 'Morning Routine';
    if (!tasksByCategory[category]) {
      tasksByCategory[category] = [];
    }
  });

  // Sort tasks into categories
  tasks.forEach(task => {
    const category = task.category || 'Morning Routine';
    tasksByCategory[category].push(task);
  });

  // Calculate points and completion stats
  const calculateStats = () => {
    let totalPoints = 0;
    let completedTasks = 0;
    let totalTasks = 0;

    Object.values(tasksByCategory).forEach(categoryTasks => {
      categoryTasks.forEach(task => {
        totalTasks++;
        if (task.status === 'done') {
          completedTasks++;
          totalPoints += task.xpReward || 0;
        }
      });
    });

    return {
      totalPoints,
      completedTasks,
      totalTasks,
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const stats = calculateStats();

  // Handle task completion toggle
  const handleTaskToggle = useCallback((task) => {
    const newStatus = task.status === 'done' ? 'open' : 'done';
    // Prevent double-clicking by checking if loading
    if (tasksLoading || loading) return;
    
    setLoading(true);
    
    // Apply immediate visual feedback
    const updatedTasks = tasks.map(t => 
      t._id === task._id ? { ...t, status: newStatus } : t
    );
    
    // Force re-render
    setRefreshTrigger(prev => !prev);
    
    updateTask(task._id, { status: newStatus })
      .then((response) => {
        if (response.success) {
          console.log(`Task ${task.title} marked as ${newStatus}`);
        } else {
          console.error('Failed to update task status');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error toggling task status:', error);
        setLoading(false);
      });
  }, [tasks, tasksLoading, loading, updateTask]);
  
  // Handle adding a new task
  const handleAddTask = useCallback((e) => {
    e.preventDefault();
    
    // Validate the form
    if (!newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }
    
    setIsSubmitting(true);
    
    // Handle custom category if selected
    let finalCategory = newTask.category;
    if (newTask.category === 'custom' && customCategory.trim()) {
      finalCategory = customCategory.trim();
    }
    
    // Create a complete task object
    const taskToCreate = {
      ...newTask,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      category: finalCategory,
      priority: newTask.priority || 'medium',
      xpReward: parseInt(newTask.xpReward) || 10
    };
    
    // Show optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const tempTask = {
      _id: tempId,
      ...taskToCreate,
      status: 'open',
      createdAt: new Date().toISOString(),
      isTemporary: true
    };
    
    // Force re-render with the temporary task
    setRefreshTrigger(prev => !prev);
    
    createTask(taskToCreate)
      .then(() => {
        // Reset form and hide it
        setNewTask({
          title: '',
          description: '',
          category: activeCategory || 'Morning Routine',
          priority: 'medium',
          xpReward: 10
        });
        setCustomCategory('');
        setShowCustomCategory(false);
        setShowAddTaskForm(false);
        setIsSubmitting(false);
      })
      .catch(error => {
        console.error('Error adding task:', error);
        setIsSubmitting(false);
        alert('Failed to add task. Please try again.');
      });
  }, [newTask, customCategory, activeCategory, createTask]);
  
  // Handle editing a task
  const handleEditTask = useCallback((e) => {
    e.preventDefault();
    
    if (!editingTask || !newTask.title.trim()) {
      alert('Please enter a task title');
      return;
    }
    
    setIsSubmitting(true);
    
    // Handle custom category if selected
    let finalCategory = newTask.category;
    if (newTask.category === 'custom' && customCategory.trim()) {
      finalCategory = customCategory.trim();
    }
    
    const taskToUpdate = {
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      category: finalCategory,
      priority: newTask.priority || 'medium'
    };
    
    // Show optimistic UI update
    const updatedTasks = tasks.map(task => 
      task._id === editingTask._id ? { ...task, ...taskToUpdate } : task
    );
    
    // Force re-render with the updated task
    setRefreshTrigger(prev => !prev);
    
    updateTask(editingTask._id, taskToUpdate)
      .then(() => {
        // Reset form and hide it
        setNewTask({
          title: '',
          description: '',
          category: 'Morning Routine',
          priority: 'medium'
        });
        setEditingTask(null);
        setIsSubmitting(false);
      })
      .catch(error => {
        console.error('Error updating task:', error);
        setIsSubmitting(false);
        alert('Failed to update task. Please try again.');
      });
  }, [editingTask, newTask, customCategory, tasks, updateTask]);
  
  // Handle deleting a task
  const handleDeleteTask = useCallback((taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      
      // Show optimistic UI update by filtering out the deleted task
      const filteredTasks = tasks.filter(task => task._id !== taskId);
      
      // Force re-render with the task removed
      setRefreshTrigger(prev => !prev);
      
      deleteTask(taskId)
        .then(() => {
          // Task deleted successfully
          setLoading(false);
        })
        .catch(error => {
          console.error('Error deleting task:', error);
          setLoading(false);
          alert('Failed to delete task. Please try again.');
        });
    }
  }, [tasks, deleteTask]);
  
  // Set up edit mode
  const startEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      category: task.category || 'Morning Routine',
      priority: task.priority || 'medium'
    });
  };
  
  // Cancel add/edit mode
  const cancelAddEdit = () => {
    setShowAddTaskForm(false);
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      category: activeCategory || 'Morning Routine',
      priority: 'medium',
      xpReward: 10
    });
    setCustomCategory('');
    setShowCustomCategory(false);
  };
  
  // Handle category selection for adding tasks
  const handleAddTaskToCategory = (category) => {
    setActiveCategory(category);
    setNewTask(prev => ({ ...prev, category }));
    setShowAddTaskForm(true);
  };

  // State variables already declared at the top of the component
  
  // Reset all tasks to open status
  const resetTasks = () => {
    setIsResetting(true);
    
    // Create a promise for each task update
    const updatePromises = tasks
      .filter(task => task.status === 'done')
      .map(task => updateTask(task._id, { status: 'open' }));
    
    // When all updates are complete, set resetting to false
    Promise.all(updatePromises)
      .then(() => {
        setIsResetting(false);
      })
      .catch(error => {
        console.error('Error resetting tasks:', error);
        setIsResetting(false);
      });
  };

  // Calculate category stats
  const getCategoryStats = (categoryTasks) => {
    let completed = 0;
    let totalPoints = 0;
    
    categoryTasks.forEach(task => {
      if (task.status === 'done') {
        completed++;
        totalPoints += task.xpReward || 0;
      }
    });
    
    return { completed, total: categoryTasks.length, totalPoints };
  };

  return (
    <AppContainer>
      <FixedTrackerSection>
        <TrackerHeader>
          <h1>Daily Self-Care Tracker</h1>
          <p>Every small step matters! <FaStar /></p>
        </TrackerHeader>

        <StatsContainer>
          <StatBox>
            <StatValue>{stats.totalPoints}</StatValue>
            <StatLabel>Points Today</StatLabel>
          </StatBox>
          
          <StatBox>
            <StatValue>{stats.completedTasks}/{stats.totalTasks}</StatValue>
            <StatLabel>Tasks Completed</StatLabel>
          </StatBox>
          
          <StatBox>
            <StatValue>{stats.progress}%</StatValue>
            <StatLabel>Daily Progress</StatLabel>
          </StatBox>
        </StatsContainer>

        <ProgressBarContainer>
          <ProgressBar progress={stats.progress} />
        </ProgressBarContainer>

        <ResetButton 
          onClick={resetTasks} 
          disabled={isResetting || stats.completedTasks === 0}
        >
          {isResetting ? 'Resetting...' : 'Reset Daily Tasks'}
          <ResetDescription>
            {stats.completedTasks === 0 
              ? 'No completed tasks to reset' 
              : 'Reset your checklist for a fresh start'}
          </ResetDescription>
        </ResetButton>
        
        {/* ADHD-Friendly Tips */}
        <TipsContainer>
          <TipsHeader>🧠 ADHD-Friendly Tips</TipsHeader>
          <TipsList>
            <Tip>• Start with the easiest tasks to build momentum</Tip>
            <Tip>• It's okay if you don't complete everything - progress over perfection!</Tip>
            <Tip>• Use the point system as motivation, not judgment</Tip>
            <Tip>• Celebrate small wins - they add up to big changes</Tip>
            <Tip>• Reset your list anytime you need a fresh start</Tip>
          </TipsList>
        </TipsContainer>
      </FixedTrackerSection>
      
      <DashboardContainer>
        {/* Add Task Button */}
        {!showAddTaskForm && !editingTask && (
          <AddTaskButton onClick={() => setShowAddTaskForm(true)}>
            <FaPlus /> Add New Task
          </AddTaskButton>
        )}
        
        {/* Add/Edit Task Form */}
        {(showAddTaskForm || editingTask) && (
          <TaskFormContainer>
            <TaskForm onSubmit={editingTask ? handleEditTask : handleAddTask}>
              <TaskFormHeader>
                <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                <CloseButton onClick={cancelAddEdit}>
                  <FaTimes />
                </CloseButton>
              </TaskFormHeader>
              
              <FormGroup>
                <FormLabel>Title</FormLabel>
                <FormInput 
                  type="text" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Task title"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextarea 
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Task description"
                  rows="3"
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Category</FormLabel>
                <FormSelect 
                  value={newTask.category} 
                  onChange={(e) => {
                    setNewTask({...newTask, category: e.target.value});
                    setShowCustomCategory(e.target.value === 'custom');
                  }}
                >
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  <option value="custom">+ Add Custom Category</option>
                </FormSelect>
              </FormGroup>
              
              {showCustomCategory && (
                <FormGroup>
                  <FormLabel>Custom Category Name</FormLabel>
                  <FormInput
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    required
                  />
                </FormGroup>
              )}
              
              <FormGroup>
                <FormLabel>Points (XP Reward)</FormLabel>
                <FormSelect
                  value={newTask.xpReward}
                  onChange={(e) => setNewTask({...newTask, xpReward: e.target.value})}
                >
                  <option value="5">5 XP (Quick Task)</option>
                  <option value="10">10 XP (Standard Task)</option>
                  <option value="15">15 XP (Challenging Task)</option>
                  <option value="20">20 XP (Difficult Task)</option>
                </FormSelect>
              </FormGroup>
              
              <FormGroup>
                <FormLabel>Priority</FormLabel>
                <FormSelect 
                  value={newTask.priority} 
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </FormSelect>
              </FormGroup>
              
              <FormButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingTask ? 'Update Task' : 'Add Task'}
              </FormButton>
            </TaskForm>
          </TaskFormContainer>
        )}

        {/* Task Categories */}
        {Object.entries(tasksByCategory)
          .filter(([category, tasks]) => tasks.length > 0 || availableCategories.includes(category))
          .map(([category, categoryTasks]) => {
            const categoryStats = getCategoryStats(categoryTasks);
            
            return (
              <CategorySection key={category}>
                <CategoryHeader>
                  <CategoryTitleArea>
                    <h2>{category}</h2>
                    <AddToCategoryButton 
                      onClick={() => handleAddTaskToCategory(category)}
                      title={`Add task to ${category}`}
                    >
                      <FaPlus />
                    </AddToCategoryButton>
                  </CategoryTitleArea>
                  <CategoryStats>
                    {categoryStats.completed}/{categoryStats.total} tasks
                    <PointsTotal>{categoryStats.completed > 0 ? categoryStats.totalPoints : 0}/{categoryTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0)} pts</PointsTotal>
                  </CategoryStats>
                </CategoryHeader>
                
                {categoryTasks.length === 0 ? (
                  <EmptyCategory>
                    No tasks in this category
                    <EmptyCategoryButton onClick={() => handleAddTaskToCategory(category)}>
                      Add a task
                    </EmptyCategoryButton>
                  </EmptyCategory>
                ) : (
                  categoryTasks.map(task => (
                    <TaskItem key={task._id}>
                      <Checkbox 
                        type="checkbox" 
                        checked={task.status === 'done'}
                        onChange={() => handleTaskToggle(task)}
                        disabled={loading}
                        id={`task-checkbox-${task._id}`}
                      />
                      <TaskContent>
                        <TaskTitle className={task.status === 'done' ? 'completed' : ''}>
                          {task.title}
                        </TaskTitle>
                        <TaskDescription>{task.description}</TaskDescription>
                      </TaskContent>
                      <TaskActions>
                        <TaskPoints>+{task.xpReward} pts</TaskPoints>
                        <ActionButton onClick={() => startEditTask(task)}>
                          <FaEdit />
                        </ActionButton>
                        <ActionButton onClick={() => handleDeleteTask(task._id)}>
                          <FaTrash />
                        </ActionButton>
                      </TaskActions>
                    </TaskItem>
                  ))
                )}
              </CategorySection>
            );
          })}


    </DashboardContainer>
    </AppContainer>
  );
};

const AppContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 70px);
  font-family: 'Segoe UI', 'Roboto', sans-serif;
`;

const FixedTrackerSection = styled.div`
  background-color: #1e2a38;
  padding: 1.5rem;
  border-radius: 0 16px 16px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 70px;
  height: calc(100vh - 70px);
  width: 400px;
  overflow-y: auto;
  z-index: 90;
  transition: width 0.3s ease;

  @media (min-width: 1200px) {
    width: 420px;
  }
  
  @media (max-width: 768px) {
    width: 320px;
  }
`;

const DashboardContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  background-color: transparent;
  overflow-y: auto;
  height: calc(100vh - 70px);
  max-width: 1000px;
  margin: 0 auto;
`;

const TrackerHeader = styled.div`
  text-align: center;
  margin-bottom: 1rem;
  
  h1 {
    font-size: 1.8rem;
    margin-bottom: 0.25rem;
    color: #fff;
  }
  
  p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const TasksHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const TasksTitle = styled.h2`
  font-size: 1.5rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  
  svg {
    color: #3498db;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
  background-color: ${props => props.$active ? '#3498db' : '#f0f0f0'};
  color: ${props => props.$active ? 'white' : '#7f8c8d'};
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? '#2980b9' : '#e0e0e0'};
  }
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  svg {
    color: #bdc3c7;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #7f8c8d;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
`;

const StatBox = styled.div`
  background-color: #2c3e50;
  border-radius: 12px;
  padding: 1.25rem 0.75rem;
  text-align: center;
  flex: 1;
  min-width: 100px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const ProgressBarContainer = styled.div`
  background-color: #2c3e50;
  border-radius: 10px;
  height: 12px;
  margin-bottom: 2rem;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ProgressBar = styled.div`
  background: linear-gradient(90deg, #3498db, #9b59b6);
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.5);
`;

const ResetButton = styled.button`
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: block;
  width: 100%;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 auto 2rem;
  padding: 0.85rem 1.75rem;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #c0392b, #e74c3c);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
  }
  
  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResetDescription = styled.span`
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
`;

const CategorySection = styled.div`
  background-color: #2c3e50;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #3498db;
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h2 {
    font-size: 1.25rem;
    color: #fff;
    margin: 0;
  }
`;

const CategoryStats = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PointsTotal = styled.span`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #34495e;
  border-radius: 8px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 0.85rem;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #3a536b;
    transform: translateX(3px);
  }
`;

const Checkbox = styled.input`
  appearance: none;
  width: 24px;
  height: 24px;
  margin-right: 16px;
  cursor: pointer;
  border-radius: 4px;
  border: 2px solid #6c5ce7;
  background-color: ${props => props.checked ? '#6c5ce7' : 'transparent'};
  position: relative;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #5a4de6;
    transform: scale(1.05);
  }
  
  &:checked {
    background-color: #6c5ce7;
    &:after {
      content: '✓';
      position: absolute;
      color: white;
      font-size: 16px;
      top: -1px;
      left: 4px;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TaskContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const TaskTitle = styled.div`
  font-size: 1rem;
  color: #fff;
  margin-bottom: 0.25rem;
  transition: text-decoration 0.3s ease;
  
  &.completed {
    text-decoration: line-through;
    opacity: 0.7;
  }
`;

const TaskDescription = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
`;

const TaskPoints = styled.div`
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.2), rgba(52, 152, 219, 0.2));
  color: #9b59b6;
  border-radius: 12px;
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
  font-weight: bold;
  margin-right: 0.5rem;
  border: 1px solid rgba(155, 89, 182, 0.3);
`;

const TipsContainer = styled.div`
  background: linear-gradient(135deg, #2980b9, #3498db);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  box-shadow: 0 6px 18px rgba(41, 128, 185, 0.3);
  width: 100%;
`;

const TipsHeader = styled.div`
  font-size: 1.1rem;
  color: #fff;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const TipsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Tip = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
`;

// New styled components for CRUD functionality
const AddTaskButton = styled.button`
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1.5rem;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #2980b9, #3498db);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const TaskFormContainer = styled.div`
  background-color: #2c3e50;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #3498db;
`;

const TaskForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  
  h3 {
    color: white;
    margin: 0;
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  transition: color 0.2s;
  
  &:hover {
    color: white;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
`;

const FormInput = styled.input`
  background-color: #34495e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  padding: 0.75rem;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const FormTextarea = styled.textarea`
  background-color: #34495e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  padding: 0.75rem;
  resize: vertical;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const FormSelect = styled.select`
  background-color: #34495e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  padding: 0.75rem;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
  
  option {
    background-color: #2c3e50;
  }
`;

const FormButton = styled.button`
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.5rem;
  padding: 0.75rem;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2980b9, #3498db);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
    cursor: not-allowed;
  }
`;

const TaskActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.4rem;
  transition: all 0.2s;
  border-radius: 50%;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const EmptyCategory = styled.div`
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 1.5rem;
  font-style: italic;
`;

// Additional styled components for category management
const CategoryTitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddToCategoryButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.4rem;
  transition: all 0.2s;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const EmptyCategoryButton = styled.button`
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(155, 89, 182, 0.2));
  border: 1px solid rgba(52, 152, 219, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
  
  &:hover {
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.3), rgba(155, 89, 182, 0.3));
    color: white;
  }
`;

export default Dashboard;
