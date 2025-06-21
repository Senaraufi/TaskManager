import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import TaskForm from '../components/tasks/TaskForm';
import TaskCard from '../components/tasks/TaskCard';
import AuthContext from '../context/AuthContext';
import TaskContext from '../context/TaskContext';
import { FaTasks, FaCheck } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { tasks, loading } = useContext(TaskContext);
  const [filter, setFilter] = useState('all');
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'open') return task.status !== 'done';
    if (filter === 'done') return task.status === 'done';
    return true;
  });

  return (
    <PageContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1>Welcome, {user?.username}!</h1>
        <p>You're currently at Level {user?.level}. Keep completing tasks to level up!</p>
      </WelcomeSection>
      
      <TaskForm />
      
      <TasksSection>
        <TasksHeader>
          <TasksTitle>
            <FaTasks /> Your Tasks
          </TasksTitle>
          
          <FilterContainer>
            <FilterButton 
              $active={filter === 'all'} 
              onClick={() => setFilter('all')}
            >
              All
            </FilterButton>
            <FilterButton 
              $active={filter === 'open'} 
              onClick={() => setFilter('open')}
            >
              Active
            </FilterButton>
            <FilterButton 
              $active={filter === 'done'} 
              onClick={() => setFilter('done')}
            >
              Completed
            </FilterButton>
          </FilterContainer>
        </TasksHeader>
        
        {loading ? (
          <LoadingMessage>Loading tasks...</LoadingMessage>
        ) : filteredTasks.length === 0 ? (
          <EmptyState>
            {filter === 'all' ? (
              <>
                <FaTasks size={40} />
                <h3>No tasks yet</h3>
                <p>Create your first task to start earning XP!</p>
              </>
            ) : filter === 'open' ? (
              <>
                <FaTasks size={40} />
                <h3>No active tasks</h3>
                <p>All your tasks are completed. Great job!</p>
              </>
            ) : (
              <>
                <FaCheck size={40} />
                <h3>No completed tasks</h3>
                <p>Complete some tasks to see them here!</p>
              </>
            )}
          </EmptyState>
        ) : (
          <TasksList>
            {filteredTasks.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
          </TasksList>
        )}
      </TasksSection>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const WelcomeSection = styled(motion.div)`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #7f8c8d;
    font-size: 1.1rem;
  }
`;

const TasksSection = styled.div`
  margin-top: 2rem;
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

export default Dashboard;
