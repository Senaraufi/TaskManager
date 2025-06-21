import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaTasks, FaTrophy } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import LevelProgress from '../gamification/LevelProgress';

const Header = () => {
  const { user } = useContext(AuthContext);

  return (
    <HeaderContainer>
      <Logo to="/">
        <FaTasks /> LevelUp Tasks
      </Logo>
      
      <NavContainer>
        <UserInfo>
          <Username>{user?.username || 'TestUser'}</Username>
          {user && <LevelProgress />}
        </UserInfo>
        
        <NavLinks>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/leaderboard">
            <FaTrophy /> Leaderboard
          </NavLink>
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
  flex-direction: column;
  align-items: flex-end;
`;

const Username = styled.span`
  font-weight: bold;
  margin-bottom: 0.25rem;
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
