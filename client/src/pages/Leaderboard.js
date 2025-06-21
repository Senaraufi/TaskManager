import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaTrophy, FaMedal, FaStar } from 'react-icons/fa';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users/leaderboard');
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load leaderboard');
        setLoading(false);
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <FaTrophy color="#FFD700" />;  // Gold
      case 1: return <FaMedal color="#C0C0C0" />;   // Silver
      case 2: return <FaMedal color="#CD7F32" />;   // Bronze
      default: return <FaStar color="#3498db" />;   // Blue star
    }
  };

  return (
    <PageContainer>
      <HeaderSection
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1><FaTrophy /> Leaderboard</h1>
        <p>See who's leading the way in task completion!</p>
      </HeaderSection>

      {loading ? (
        <LoadingMessage>Loading leaderboard...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <LeaderboardContainer>
          <LeaderboardHeader>
            <span>Rank</span>
            <span>User</span>
            <span>Level</span>
            <span>XP</span>
          </LeaderboardHeader>

          {users.length === 0 ? (
            <EmptyState>
              <p>No users on the leaderboard yet!</p>
            </EmptyState>
          ) : (
            users.map((user, index) => (
              <LeaderboardItem
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                $isTop={index < 3}
                $rank={index}
              >
                <RankCell>
                  {getRankIcon(index)}
                  <span>{index + 1}</span>
                </RankCell>
                <UsernameCell>{user.username}</UsernameCell>
                <LevelCell>Level {user.level}</LevelCell>
                <XpCell>{user.xp} XP</XpCell>
              </LeaderboardItem>
            ))
          )}
        </LeaderboardContainer>
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeaderSection = styled(motion.div)`
  margin-bottom: 2rem;
  text-align: center;
  
  h1 {
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    svg {
      color: #f39c12;
    }
  }
  
  p {
    color: #7f8c8d;
    font-size: 1.1rem;
  }
`;

const LeaderboardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const LeaderboardHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 100px 100px;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: bold;
  color: #2c3e50;
  
  @media (max-width: 500px) {
    grid-template-columns: 60px 1fr 60px 60px;
    font-size: 0.9rem;
  }
`;

const LeaderboardItem = styled(motion.div)`
  display: grid;
  grid-template-columns: 80px 1fr 100px 100px;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background-color: ${props => {
    if (props.$rank === 0) return 'rgba(255, 215, 0, 0.1)';
    if (props.$rank === 1) return 'rgba(192, 192, 192, 0.1)';
    if (props.$rank === 2) return 'rgba(205, 127, 50, 0.1)';
    return 'transparent';
  }};
  
  &:hover {
    background-color: ${props => {
      if (props.$rank === 0) return 'rgba(255, 215, 0, 0.2)';
      if (props.$rank === 1) return 'rgba(192, 192, 192, 0.2)';
      if (props.$rank === 2) return 'rgba(205, 127, 50, 0.2)';
      return '#f8f9fa';
    }};
  }
  
  @media (max-width: 500px) {
    grid-template-columns: 60px 1fr 60px 60px;
    font-size: 0.9rem;
  }
`;

const RankCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
`;

const UsernameCell = styled.div`
  font-weight: 500;
  color: #2c3e50;
`;

const LevelCell = styled.div`
  font-weight: bold;
  color: #3498db;
`;

const XpCell = styled.div`
  color: #27ae60;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  background-color: #fdeded;
  border-radius: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
`;

export default Leaderboard;
