import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCrown, FaGem } from 'react-icons/fa';

const shine = keyframes`
  0% { background-position: -100px; }
  40% { background-position: 200px; }
  100% { background-position: 200px; }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 15px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  margin-bottom: 20px;
`;

const LevelInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const CurrentLevel = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #f1c40f;
  
  svg {
    margin-right: 8px;
  }
`;

const NextLevel = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  
  svg {
    margin-right: 5px;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #f1c40f, #f39c12);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: ${shine} 2s infinite;
  }
`;

const XpInfo = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
`;

const LevelProgress = ({ level, progress, currentXp, nextLevelXp }) => {
  return (
    <Container>
      <LevelInfo>
        <CurrentLevel>
          <FaCrown /> Level {level}
        </CurrentLevel>
        <NextLevel>
          <FaGem /> Next: Level {level + 1}
        </NextLevel>
      </LevelInfo>
      <ProgressBarContainer>
        <ProgressFill progress={progress} />
      </ProgressBarContainer>
      <XpInfo>
        {currentXp} / {nextLevelXp} XP
      </XpInfo>
    </Container>
  );
};

export default LevelProgress;
