import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';
import TaskContext from '../../context/TaskContext';

const TaskForm = () => {
  const { createTask } = useContext(TaskContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    try {
      setLoading(true);
      await createTask(formData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      });
      
      setIsExpanded(false);
      setLoading(false);
    } catch (error) {
      console.error('Error creating task:', error);
      setLoading(false);
    }
  };

  return (
    <FormContainer
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isExpanded ? (
        <AddTaskButton onClick={() => setIsExpanded(true)}>
          <FaPlus /> Add New Task
        </AddTaskButton>
      ) : (
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Task Title</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Description (Optional)</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about this task..."
              rows="3"
            />
          </FormGroup>
          
          <FormRow>
            <FormGroup>
              <Label>Priority</Label>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Due Date (Optional)</Label>
              <Input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </FormGroup>
          </FormRow>
          
          <ButtonGroup>
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Task'}
            </SubmitButton>
            <CancelButton type="button" onClick={() => setIsExpanded(false)}>
              Cancel
            </CancelButton>
          </ButtonGroup>
          
          <XpInfo>
            <span>+10 XP for creating a task</span>
            <span>+30 XP when completed</span>
          </XpInfo>
        </Form>
      )}
    </FormContainer>
  );
};

const FormContainer = styled(motion.div)`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const AddTaskButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  width: 100%;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const Form = styled.form`
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
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #27ae60;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  background-color: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #d0d0d0;
  }
`;

const XpInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #27ae60;
  margin-top: 0.5rem;
`;

export default TaskForm;
