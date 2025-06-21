import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import TaskContext from '../context/TaskContext';
import AuthContext from '../context/AuthContext';
import { FaStar } from 'react-icons/fa';

const Dashboard = () => {
  const { tasks, loading, updateTask } = useContext(TaskContext);
  const { user } = useContext(AuthContext);

  // Group tasks by category
  const tasksByCategory = {
    'Morning Routine': [],
    'Health': [],
    'Creative': [],
    'Evening Routine': []
  };

  tasks.forEach(task => {
    const category = task.category || 'Morning Routine';
    if (tasksByCategory[category]) {
      tasksByCategory[category].push(task);
    } else {
      tasksByCategory['Morning Routine'].push(task);
    }
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
  const handleTaskToggle = (task) => {
    const newStatus = task.status === 'done' ? 'open' : 'done';
    updateTask(task._id, { status: newStatus });
  };

  // Reset all tasks to open status
  const resetTasks = () => {
    tasks.forEach(task => {
      if (task.status === 'done') {
        updateTask(task._id, { status: 'open' });
      }
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

        <ResetButton onClick={resetTasks}>
          Reset Daily Tasks
          <ResetDescription>Reset your checklist for a fresh start</ResetDescription>
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

      {/* Task Categories */}
      {Object.entries(tasksByCategory).map(([category, categoryTasks]) => {
        const categoryStats = getCategoryStats(categoryTasks);
        
        return (
          <CategorySection key={category}>
            <CategoryHeader>
              <h2>{category}</h2>
              <CategoryStats>
                {categoryStats.completed}/{categoryStats.total} tasks
                <PointsTotal>{categoryStats.completed > 0 ? categoryStats.totalPoints : 0}/{categoryTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0)} pts</PointsTotal>
              </CategoryStats>
            </CategoryHeader>
            
            {categoryTasks.map(task => (
              <TaskItem key={task._id}>
                <Checkbox 
                  type="checkbox" 
                  checked={task.status === 'done'}
                  onChange={() => handleTaskToggle(task)}
                />
                <TaskContent>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskDescription>{task.description}</TaskDescription>
                </TaskContent>
                <TaskPoints>+{task.xpReward} pts</TaskPoints>
              </TaskItem>
            ))}
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
  width: 350px;
  overflow-y: auto;
  z-index: 90;
`;

const DashboardContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  background-color: transparent;
  overflow-y: auto;
  height: calc(100vh - 70px);
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
  justify-content: space-around;
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
  padding: 1.25rem;
  text-align: center;
  flex: 1;
  min-width: 100px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
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
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
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
  height: 22px;
  width: 22px;
  margin-right: 1rem;
  cursor: pointer;
  accent-color: #9b59b6;
`;

const TaskContent = styled.div`
  flex: 1;
`;

const TaskTitle = styled.div`
  font-size: 1rem;
  color: #fff;
  margin-bottom: 0.25rem;
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
  margin-left: 1rem;
  border: 1px solid rgba(155, 89, 182, 0.3);
`;

const TipsContainer = styled.div`
  background: linear-gradient(135deg, #2980b9, #3498db);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  box-shadow: 0 6px 18px rgba(41, 128, 185, 0.3);
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

export default Dashboard;
