import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTasks, FaTrophy, FaSignOutAlt, FaUser } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import LevelProgress from '../gamification/LevelProgress';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <Logo to="/">
        <FaTasks /> LevelUp Tasks
      </Logo>
      
      <NavContainer>
        <UserInfo>
          <UserAvatar>
            <FaUser />
          </UserAvatar>
          <UserDetails>
            <Username>{user?.username || 'User'}</Username>
            {user && (
              <UserLevel>
                Level {user.level} <span>•</span> {user.xp}/{user.xpToNextLevel} XP
              </UserLevel>
            )}
          </UserDetails>
          {user && <LevelProgress />}
        </UserInfo>
        
        <NavLinks>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/leaderboard">
            <FaTrophy /> Leaderboard
          </NavLink>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </LogoutButton>
        </NavLinks>
      </NavContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #1e2a38;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #3498db;
  }
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-right: 2rem;
  gap: 1rem;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
  box-shadow: 0 2px 10px rgba(108, 92, 231, 0.3);
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
`;

const UserLevel = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  
  span {
    margin: 0 4px;
    opacity: 0.5;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #34495e;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  
  &:hover {
    background-color: #c0392b;
  }
`;



export default Header;
