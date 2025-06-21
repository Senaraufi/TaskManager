import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import TaskContext from '../../context/TaskContext';

const TaskCard = ({ task }) => {
  const { updateTask, deleteTask } = useContext(TaskContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  });

  const handleComplete = async () => {
    try {
      await updateTask(task._id, { ...task, status: 'done' });
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task._id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateTask(task._id, editedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#3498db';
    }
  };

  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      $completed={task.status === 'done'}
      $priority={getPriorityColor(task.priority)}
    >
      {isEditing ? (
        <EditForm>
          <FormGroup>
            <Label>Title</Label>
            <Input
              type="text"
              name="title"
              value={editedTask.title}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={editedTask.description || ''}
              onChange={handleChange}
              rows="3"
            />
          </FormGroup>
          
          <FormRow>
            <FormGroup>
              <Label>Priority</Label>
              <Select
                name="priority"
                value={editedTask.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Due Date</Label>
              <Input
                type="date"
                name="dueDate"
                value={editedTask.dueDate || ''}
                onChange={handleChange}
              />
            </FormGroup>
          </FormRow>
          
          <ButtonGroup>
            <Button onClick={handleSave} $primary>Save</Button>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          </ButtonGroup>
        </EditForm>
      ) : (
        <>
          <CardHeader>
            <PriorityBadge $color={getPriorityColor(task.priority)}>
              {task.priority}
            </PriorityBadge>
            
            <TaskTitle $completed={task.status === 'done'}>
              {task.title}
            </TaskTitle>
            
            <ActionButtons>
              {task.status !== 'done' && (
                <ActionButton onClick={handleComplete} $color="#2ecc71">
                  <FaCheck />
                </ActionButton>
              )}
              
              <ActionButton onClick={handleEdit} $color="#3498db">
                <FaEdit />
              </ActionButton>
              
              <ActionButton onClick={handleDelete} $color="#e74c3c">
                <FaTrash />
              </ActionButton>
            </ActionButtons>
          </CardHeader>
          
          {task.description && (
            <Description $completed={task.status === 'done'}>
              {task.description}
            </Description>
          )}
          
          <CardFooter>
            {task.dueDate && (
              <DueDate>
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </DueDate>
            )}
            
            <XpReward>
              {task.status === 'done' ? 
                `+${task.completionXp} XP earned!` : 
                `+${task.completionXp} XP on completion`}
            </XpReward>
          </CardFooter>
        </>
      )}
    </CardContainer>
  );
};

const CardContainer = styled(motion.div)`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.$priority};
  opacity: ${props => props.$completed ? 0.7 : 1};
  position: relative;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const PriorityBadge = styled.span`
  background-color: ${props => props.$color};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-right: 1rem;
`;

const TaskTitle = styled.h3`
  margin: 0;
  flex: 1;
  font-size: 1.1rem;
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  color: ${props => props.$completed ? '#7f8c8d' : '#2c3e50'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${props => props.$color};
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const Description = styled.p`
  margin: 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.8rem;
`;

const DueDate = styled.span`
  color: #7f8c8d;
`;

const XpReward = styled.span`
  color: #27ae60;
  font-weight: bold;
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  > * {
    flex: 1;
  }
`;

const Label = styled.label`
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  resize: vertical;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  background-color: ${props => props.$primary ? '#3498db' : '#e0e0e0'};
  color: ${props => props.$primary ? 'white' : '#333'};
  
  &:hover {
    background-color: ${props => props.$primary ? '#2980b9' : '#d0d0d0'};
  }
`;

export default TaskCard;
