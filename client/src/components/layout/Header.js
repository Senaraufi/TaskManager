import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTasks, FaSignOutAlt, FaTrophy } from 'react-icons/fa';
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
      
      {user ? (
        <NavContainer>
          <UserInfo>
            <Username>{user.username}</Username>
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
      ) : (
        <NavLinks>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </NavLinks>
      )}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
