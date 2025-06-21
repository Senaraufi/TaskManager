import React from 'react';
import styled, { keyframes } from 'styled-components';

const popIn = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #8e44ad, #3498db);
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  animation: ${popIn} 0.5s forwards;
  
  &::before {
    content: '🎉';
    font-size: 1.5rem;
    margin-right: 10px;
  }
`;

const AchievementNotification = ({ message }) => {
  return (
    <NotificationContainer>
      {message}
    </NotificationContainer>
  );
};

export default AchievementNotification;
