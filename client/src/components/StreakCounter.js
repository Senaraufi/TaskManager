import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaFire } from 'react-icons/fa';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const StreakContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 10px;
`;

const StreakIcon = styled.div`
  color: #e74c3c;
  font-size: 1.5rem;
  margin-bottom: 5px;
  animation: ${pulse} 2s infinite;
`;

const StreakCount = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
`;

const StreakLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
`;

const StreakCounter = ({ count }) => {
  return (
    <StreakContainer>
      <StreakIcon>
        <FaFire />
      </StreakIcon>
      <StreakCount>{count}</StreakCount>
      <StreakLabel>Day Streak</StreakLabel>
    </StreakContainer>
  );
};

export default StreakCounter;
