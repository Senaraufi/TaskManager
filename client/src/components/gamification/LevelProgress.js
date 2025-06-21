import React, { useContext } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';

const LevelProgress = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return null;
  
  const { level, xp, xpToNextLevel } = user;
  const progressPercentage = Math.min((xp / xpToNextLevel) * 100, 100);
  
  return (
    <ProgressContainer>
      <LevelBadge>
        <span>LVL</span>
        <strong>{level}</strong>
      </LevelBadge>
      
      <ProgressBarContainer>
        <ProgressInfo>
          <span>XP: {xp} / {xpToNextLevel}</span>
          <span>{Math.round(progressPercentage)}%</span>
        </ProgressInfo>
        
        <ProgressBarOuter>
          <ProgressBarInner 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </ProgressBarOuter>
      </ProgressBarContainer>
    </ProgressContainer>
  );
};

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 250px;
`;

const LevelBadge = styled.div`
  background-color: #f39c12;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 0.7rem;
  line-height: 1;
  
  span {
    font-size: 0.6rem;
    opacity: 0.8;
  }
  
  strong {
    font-size: 1rem;
  }
`;

const ProgressBarContainer = styled.div`
  flex: 1;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
`;

const ProgressBarOuter = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  height: 8px;
  width: 100%;
  overflow: hidden;
`;

const ProgressBarInner = styled(motion.div)`
  background-color: #2ecc71;
  height: 100%;
  border-radius: 10px;
`;

export default LevelProgress;
